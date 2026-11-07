import logging
import time
from collections.abc import Callable
from typing import Any

from aiohttp import web

from .config import Config
from .quiz import (
    FallbackDeck,
    GhoulQuizSource,
    QuizBusy,
    QuizService,
    QuizUnavailable,
    UnknownQuestion,
)
from .ratelimit import RateLimited, RateLimiter

logger = logging.getLogger(__name__)

CONFIG = web.AppKey("config", Config)
QUIZ = web.AppKey("quiz", QuizService)
LIMITER = web.AppKey("limiter", RateLimiter)
CLOCK = web.AppKey[Callable[[], float]]("clock")

MAX_BODY = 4096


def client_ip(request: web.Request) -> str:
    if request.app[CONFIG].trust_proxy:
        forwarded = request.headers.get("X-Real-IP")
        if forwarded:
            return forwarded.strip()
    return request.remote or "unknown"


def error(status: int, code: str, retry_after: float | None = None) -> web.Response:
    headers = {"Retry-After": str(max(1, round(retry_after)))} if retry_after else None
    body: dict[str, Any] = {"error": code}
    if retry_after:
        body["retry_after"] = round(retry_after, 1)
    return web.json_response(body, status=status, headers=headers)


async def read_json(request: web.Request) -> dict[str, Any]:
    if request.content_length is not None and request.content_length > MAX_BODY:
        raise web.HTTPRequestEntityTooLarge(max_size=MAX_BODY, actual_size=request.content_length)
    try:
        data = await request.json()
    except ValueError:
        return {}
    return data if isinstance(data, dict) else {}


async def health(_request: web.Request) -> web.Response:
    return web.json_response({"ok": True})


async def quiz_question(request: web.Request) -> web.Response:
    app = request.app
    now = app[CLOCK]()
    limits = app[CONFIG].limits
    ip = client_ip(request)
    try:
        app[LIMITER].hit(f"question:{ip}", limits.question_burst, now)
        app[LIMITER].hit(f"question:{ip}", limits.question_hourly, now)
    except RateLimited as exc:
        return error(429, "rate_limited", exc.retry_after)
    try:
        issued = await app[QUIZ].next_question(now)
    except QuizBusy as exc:
        return error(503, "quiz_busy", exc.retry_after)
    question = issued.question
    return web.json_response(
        {
            "token": issued.token,
            "kind": question.kind,
            "text": question.text,
            "options": list(question.options),
            "source": issued.source,
        }
    )


async def quiz_answer(request: web.Request) -> web.Response:
    app = request.app
    now = app[CLOCK]()
    try:
        app[LIMITER].hit(f"answer:{client_ip(request)}", app[CONFIG].limits.answer_burst, now)
    except RateLimited as exc:
        return error(429, "rate_limited", exc.retry_after)
    data = await read_json(request)
    token, answer = data.get("token"), data.get("answer")
    if not isinstance(token, str) or not isinstance(answer, str):
        return error(400, "bad_request")
    try:
        verdict = await app[QUIZ].answer(token, answer, now)
    except UnknownQuestion:
        return error(404, "unknown_question")
    except QuizBusy as exc:
        return error(503, "quiz_busy", exc.retry_after)
    except QuizUnavailable:
        return error(503, "quiz_unavailable")
    return web.json_response({"correct": verdict.correct, "answer": verdict.answer})


def create_app(
    config: Config,
    quiz: QuizService | None = None,
    clock: Callable[[], float] = time.monotonic,
) -> web.Application:
    app = web.Application(client_max_size=MAX_BODY)
    app[CONFIG] = config
    app[LIMITER] = RateLimiter()
    app[CLOCK] = clock
    app[QUIZ] = quiz or build_quiz(config)
    app.router.add_get("/api/health", health)
    app.router.add_post("/api/quiz/question", quiz_question)
    app.router.add_post("/api/quiz/answer", quiz_answer)
    app.on_cleanup.append(close_quiz)
    return app


def build_quiz(config: Config) -> QuizService:
    live = None
    if config.quiz_email:
        live = GhoulQuizSource.connect(config.quiz_email, config.quiz_api_url)
    else:
        logger.warning("GHOUL_QUIZ_EMAIL не задан: квиз на запасной колоде")
    return QuizService(live=live, fallback=FallbackDeck(), limits=config.limits)


async def close_quiz(app: web.Application) -> None:
    await app[QUIZ].close()
