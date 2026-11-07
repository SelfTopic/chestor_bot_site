#!/bin/sh
# Справка игроков из публичного репозитория бота: частичный клон только docs/players.
# История коммитов нужна целиком (без содержимого файлов) — по ней sitemap берёт даты разделов.
set -eu

repo="${BOT_REPO_URL:-https://github.com/SelfTopic/chestor_bot.git}"
ref="${BOT_REPO_REF:-main}"
dir="$(dirname "$0")/../.bot"

if [ -d "$dir/.git" ]; then
  if [ -f "$dir/.git/shallow" ]; then
    git -C "$dir" fetch --quiet --unshallow --filter=blob:none origin "$ref"
  else
    git -C "$dir" fetch --quiet --filter=blob:none origin "$ref"
  fi
  git -C "$dir" checkout -q FETCH_HEAD
else
  git clone --quiet --branch "$ref" --filter=blob:none --sparse "$repo" "$dir"
  git -C "$dir" sparse-checkout set docs/players
fi

git -C "$dir" log -1 --format='docs/players @ %h %s'
