import random
from dataclasses import dataclass, field
from typing import Any

import pytest
from aiohttp.test_utils import TestClient

from chestor_api.app import create_app
from chestor_api.config import Config, Limits
from chestor_api.quiz import FallbackDeck, Question, QuizService, QuizUnavailable


@dataclass
class Clock:
    now: float = 1000.0

    def __call__(self) -> float:
        return self.now


@dataclass
class FakeLive:
    name: str = "live"
    fail: bool = False
    asked: list[Question] = field(default_factory=list)

    async def random_question(self) -> Question:
        if self.fail:
            raise QuizUnavailable("down")
        question = Question(7, "truefalse", "Какухо у укаку — на плечах", ("true", "false"))
        self.asked.append(question)
        return question

    async def is_correct(self, question: Question, answer: str) -> tuple[bool, str]:
        return answer == "true", "true"

    async def close(self) -> None:
        return None


def make_client(aiohttp_client: Any, live: FakeLive | None, limits: Limits | None = None):
    limits = limits or Limits()
    clock = Clock()
    quiz = QuizService(live=live, fallback=FallbackDeck(rng=random.Random(1)), limits=limits)
    app = create_app(Config(limits=limits), quiz=quiz, clock=clock)
    return aiohttp_client(app), clock


async def ask(client: TestClient) -> dict[str, Any]:
    response = await client.post("/api/quiz/question")
    assert response.status == 200
    return await response.json()


async def test_question_hides_the_answer_and_checks_it_once(aiohttp_client: Any) -> None:
    client_coro, _ = make_client(aiohttp_client, FakeLive())
    client = await client_coro
    question = await ask(client)
    assert question["kind"] == "truefalse"
    assert "answer" not in question

    response = await client.post(
        "/api/quiz/answer", json={"token": question["token"], "answer": "true"}
    )
    assert await response.json() == {"correct": True, "answer": "true"}

    again = await client.post(
        "/api/quiz/answer", json={"token": question["token"], "answer": "true"}
    )
    assert again.status == 404


async def test_wrong_answer_reveals_the_right_one(aiohttp_client: Any) -> None:
    client = await make_client(aiohttp_client, FakeLive())[0]
    question = await ask(client)
    response = await client.post(
        "/api/quiz/answer", json={"token": question["token"], "answer": "false"}
    )
    assert await response.json() == {"correct": False, "answer": "true"}


async def test_answer_must_be_one_of_the_options(aiohttp_client: Any) -> None:
    client = await make_client(aiohttp_client, FakeLive())[0]
    question = await ask(client)
    response = await client.post(
        "/api/quiz/answer", json={"token": question["token"], "answer": "да"}
    )
    assert response.status == 404


async def test_fallback_deck_when_live_api_is_down(aiohttp_client: Any) -> None:
    client = await make_client(aiohttp_client, FakeLive(fail=True))[0]
    question = await ask(client)
    assert question["source"] == "fallback"
    assert question["kind"] == "choice"
    assert len(question["options"]) == 4


async def test_question_expires(aiohttp_client: Any) -> None:
    client_coro, clock = make_client(aiohttp_client, FakeLive())
    client = await client_coro
    question = await ask(client)
    clock.now += Limits().question_ttl + 1
    response = await client.post(
        "/api/quiz/answer", json={"token": question["token"], "answer": "true"}
    )
    assert response.status == 404


async def test_rate_limit_per_ip(aiohttp_client: Any) -> None:
    limits = Limits(question_burst=(10.0, 2))
    client_coro, clock = make_client(aiohttp_client, FakeLive(), limits)
    client = await client_coro
    await ask(client)
    await ask(client)
    blocked = await client.post("/api/quiz/question")
    assert blocked.status == 429
    assert int(blocked.headers["Retry-After"]) >= 1
    clock.now += 11
    await ask(client)


@pytest.mark.parametrize("body", [None, {"token": 1, "answer": "x"}, ["token"]])
async def test_bad_answer_body(aiohttp_client: Any, body: Any) -> None:
    client = await make_client(aiohttp_client, FakeLive())[0]
    response = await client.post("/api/quiz/answer", json=body)
    assert response.status == 400
