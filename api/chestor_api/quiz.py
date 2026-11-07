import json
import logging
import random
import secrets
from collections import OrderedDict
from dataclasses import dataclass
from pathlib import Path
from typing import Literal, Protocol

from ghoul_quiz import GhoulQuizAPI, GhoulQuizError, RateLimitError

from .config import Limits

logger = logging.getLogger(__name__)

Kind = Literal["choice", "truefalse"]
TRUE_FALSE_OPTIONS = ("true", "false")
FALLBACK_DECK = Path(__file__).parent / "data" / "fallback_questions.json"


class QuizUnavailable(Exception):
    pass


class QuizBusy(Exception):
    def __init__(self, retry_after: float) -> None:
        super().__init__(f"quiz api busy, retry after {retry_after:.0f}s")
        self.retry_after = retry_after


class UnknownQuestion(Exception):
    pass


@dataclass(frozen=True)
class Question:
    id: int
    kind: Kind
    text: str
    options: tuple[str, ...]


class QuestionSource(Protocol):
    name: str

    async def random_question(self) -> Question: ...

    async def is_correct(self, question: Question, answer: str) -> tuple[bool, str]: ...

    async def close(self) -> None: ...


class FallbackDeck:
    name = "fallback"

    def __init__(self, path: Path = FALLBACK_DECK, rng: random.Random | None = None) -> None:
        items = json.loads(path.read_text(encoding="utf-8"))
        self._questions = [
            Question(
                id=int(item["id"]),
                kind="choice",
                text=item["question"],
                options=tuple(item["answer_options"]),
            )
            for item in items
        ]
        self._answers = {int(item["id"]): str(item["answer"]) for item in items}
        self._rng = rng or random.Random()

    async def random_question(self) -> Question:
        question = self._rng.choice(self._questions)
        return Question(
            id=question.id,
            kind=question.kind,
            text=question.text,
            options=tuple(self._rng.sample(question.options, len(question.options))),
        )

    async def is_correct(self, question: Question, answer: str) -> tuple[bool, str]:
        right = self._answers.get(question.id)
        if right is None:
            raise UnknownQuestion()
        return answer == right, right

    async def close(self) -> None:
        return None


# Живые вопросы Ghoul Quiz под отдельной сессией сайта. Картинки API — ссылки на фандом,
# который не отдаёт их ботам, поэтому «Кто это?» и утверждения с картинкой пропускаются.
class GhoulQuizSource:
    name = "live"

    def __init__(self, api: GhoulQuizAPI, rng: random.Random | None = None) -> None:
        self._api = api
        self._rng = rng or random.Random()

    @classmethod
    def connect(cls, email: str, base_url: str) -> "GhoulQuizSource | None":
        api = GhoulQuizAPI(base_url=base_url)
        if not api.load_saved_token(email):
            logger.warning("Нет сохранённой сессии Ghoul Quiz для %s: запасная колода", email)
            return None
        return cls(api)

    async def random_question(self) -> Question:
        try:
            if self._rng.random() < 0.25:
                statement = await self._api.get_random_true_false()
                if statement.prompt_media is None:
                    return Question(
                        statement.id, "truefalse", statement.statement, TRUE_FALSE_OPTIONS
                    )
            raw = await self._api.get_random_question()
        except RateLimitError as exc:
            raise QuizBusy(exc.retry_after or 30) from exc
        except GhoulQuizError as exc:
            raise QuizUnavailable(str(exc)) from exc
        return Question(raw.id, "choice", raw.question, tuple(raw.answer_options))

    async def is_correct(self, question: Question, answer: str) -> tuple[bool, str]:
        try:
            if question.kind == "truefalse":
                verdict = await self._api.get_true_false_answer(question.id)
                right = "true" if verdict.correct else "false"
            else:
                right = (await self._api.get_answer(question_id=question.id)).answer
        except RateLimitError as exc:
            raise QuizBusy(exc.retry_after or 30) from exc
        except GhoulQuizError as exc:
            raise QuizUnavailable(str(exc)) from exc
        return answer == right, right

    async def close(self) -> None:
        await self._api.close()


@dataclass(frozen=True)
class Issued:
    token: str
    question: Question
    source: str


@dataclass(frozen=True)
class Verdict:
    correct: bool
    answer: str


# Выданный вопрос живёт на сервере под случайным токеном: ответ проверяется только для
# вопросов, которые выдали мы, и только один раз — эндпоинт не годится как справочник ответов.
class QuizService:
    def __init__(self, live: QuestionSource | None, fallback: QuestionSource, limits: Limits):
        self._live = live
        self._fallback = fallback
        self._limits = limits
        self._pending: OrderedDict[str, tuple[Question, QuestionSource, float]] = OrderedDict()

    async def next_question(self, now: float) -> Issued:
        self._forget_expired(now)
        source = self._live or self._fallback
        try:
            question = await source.random_question()
        except QuizUnavailable as exc:
            logger.warning("Ghoul Quiz API: %s; вопрос из запасной колоды", exc)
            source = self._fallback
            question = await source.random_question()
        token = secrets.token_urlsafe(16)
        self._pending[token] = (question, source, now)
        while len(self._pending) > self._limits.max_pending:
            self._pending.popitem(last=False)
        return Issued(token=token, question=question, source=source.name)

    async def answer(self, token: str, answer: str, now: float) -> Verdict:
        self._forget_expired(now)
        pending = self._pending.pop(token, None)
        if pending is None:
            raise UnknownQuestion()
        question, source, _ = pending
        if answer not in question.options:
            raise UnknownQuestion()
        correct, right = await source.is_correct(question, answer)
        return Verdict(correct=correct, answer=right)

    def _forget_expired(self, now: float) -> None:
        while self._pending:
            _, (_, _, issued_at) = next(iter(self._pending.items()))
            if issued_at > now - self._limits.question_ttl:
                break
            self._pending.popitem(last=False)

    async def close(self) -> None:
        if self._live is not None:
            await self._live.close()
        await self._fallback.close()
