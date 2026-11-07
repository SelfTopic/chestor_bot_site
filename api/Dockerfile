FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_VIRTUALENVS_CREATE=false

# git нужен, чтобы поставить ghoul-quiz-lib из репозитория.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/* \
    && pip install "poetry>=2,<3"

WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN poetry install --only main --no-root

COPY chestor_api ./chestor_api
RUN poetry install --only main

RUN useradd --create-home --uid 10001 api
USER api

EXPOSE 8090
CMD ["python", "-m", "chestor_api"]
