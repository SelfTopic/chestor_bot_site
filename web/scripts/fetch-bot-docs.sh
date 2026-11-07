#!/bin/sh
# Справка игроков из публичного репозитория бота: частичный клон только docs/players.
set -eu

repo="${BOT_REPO_URL:-https://github.com/SelfTopic/chestor_bot.git}"
ref="${BOT_REPO_REF:-main}"
dir="$(dirname "$0")/../.bot"

if [ -d "$dir/.git" ]; then
  git -C "$dir" fetch --depth 1 origin "$ref"
  git -C "$dir" checkout -q FETCH_HEAD
else
  rm -rf "$dir"
  git clone --quiet --depth 1 --branch "$ref" --filter=blob:none --sparse "$repo" "$dir"
  git -C "$dir" sparse-checkout set docs/players
fi

git -C "$dir" log -1 --format='docs/players @ %h %s'
