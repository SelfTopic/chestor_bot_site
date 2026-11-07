import os
from dataclasses import dataclass, field


@dataclass(frozen=True)
class Limits:
    # Вопрос и ответ — на IP: окно в секундах и сколько запросов в нём можно.
    question_burst: tuple[float, int] = (10.0, 5)
    question_hourly: tuple[float, int] = (3600.0, 120)
    answer_burst: tuple[float, int] = (10.0, 10)
    # Выданный вопрос ждёт ответа столько секунд, потом забывается.
    question_ttl: float = 600.0
    # Сколько выданных вопросов держать в памяти сразу: потолок памяти под атаку.
    max_pending: int = 10_000


@dataclass(frozen=True)
class Config:
    host: str = "0.0.0.0"
    port: int = 8090
    quiz_email: str | None = None
    quiz_api_url: str = "https://chestor.site/api"
    # За nginx адрес клиента берётся из X-Real-IP; без прокси заголовку верить нельзя.
    trust_proxy: bool = False
    limits: Limits = field(default_factory=Limits)

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            host=os.environ.get("API_HOST", "0.0.0.0"),
            port=int(os.environ.get("API_PORT", "8090")),
            quiz_email=os.environ.get("GHOUL_QUIZ_EMAIL") or None,
            quiz_api_url=os.environ.get("GHOUL_QUIZ_API_URL", "https://chestor.site/api"),
            trust_proxy=os.environ.get("TRUST_PROXY", "").lower() in ("1", "true", "yes"),
        )
