import type { Lang } from "@/i18n/config";

export const SITE_URL = "https://chestor-bot.site";

export const BOT_USERNAME = "chestor_chat_bot";
export const BOT_URL = `https://t.me/${BOT_USERNAME}`;
export const BOT_ADD_TO_GROUP_URL = `${BOT_URL}?startgroup=true`;
export const BOT_REPO_URL = "https://github.com/SelfTopic/chestor_bot";
export const BOT_TECH_PAGE_URL = "https://chestor.site/bot";

export const DOCS_CHANNEL: Record<Lang, string> = {
  ru: "https://t.me/chestor_docs",
  en: "https://t.me/chestor_docs_en",
};

export function docsPath(lang: Lang, slug?: string): string {
  return slug ? `/${lang}/docs/${slug}/` : `/${lang}/docs/`;
}
