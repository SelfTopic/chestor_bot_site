// Тексты для моделей (docs/seo.md, 1.3–1.4): llms.txt, llms-full.txt и Markdown разделов.
import { LANGS, type Lang } from "@/i18n/config";
import { t } from "@/i18n";
import { loadPages } from "@/lib/docs/load";
import type { DocPage } from "@/lib/docs/parse";
import { BOT_ADD_TO_GROUP_URL, BOT_REPO_URL, BOT_TECH_PAGE_URL, BOT_URL, docsPath, SITE_URL } from "@/lib/site";

export function markdownPath(lang: Lang, slug: string): string {
  return `/md/${lang}/${slug}.md`;
}

export function pageMarkdown(lang: Lang, page: DocPage): string {
  return [`# ${page.heading}`, "", page.markdown, "", "---", "", `Source: ${SITE_URL}${docsPath(lang, page.slug)}`, ""].join(
    "\n",
  );
}

function langsWithDocs(): Lang[] {
  return LANGS.filter((lang) => loadPages(lang).length > 0);
}

export function llmsTxt(): string {
  const en = t("en");
  const ru = t("ru");
  const lines = [
    "# CheStor — Tokyo Ghoul bot for Telegram",
    "",
    `> ${en.meta.description} Telegram: @chestor_chat_bot (${BOT_URL}). Free to play. Languages: Russian and English.`,
    "",
    `> ${ru.meta.description}`,
    "",
    "## Play",
    "",
    `- [Open the bot in Telegram](${BOT_URL})`,
    `- [Add the bot to a group](${BOT_ADD_TO_GROUP_URL})`,
    `- [Source code](${BOT_REPO_URL})`,
    `- [How the bot is built](${BOT_TECH_PAGE_URL})`,
    "",
  ];

  for (const lang of ["en", "ru"] as const) {
    const dict = t(lang);
    lines.push(`## ${dict.home.faqTitle} (${lang})`, "");
    for (const item of dict.faq) lines.push(`- **${item.question}** ${item.answer}`);
    lines.push("");
  }

  for (const lang of langsWithDocs()) {
    const dict = t(lang);
    lines.push(`## ${dict.docs.title} (${lang})`, "");
    for (const page of loadPages(lang)) {
      const topics = page.topics.map((topic) => topic.heading).join(", ");
      lines.push(`- [${page.title}](${SITE_URL}${markdownPath(lang, page.slug)}): ${topics}`);
    }
    lines.push("");
  }

  lines.push("## Optional", "", `- [Full documentation in one file](${SITE_URL}/llms-full.txt)`, "");
  return lines.join("\n");
}

export function llmsFullTxt(): string {
  const parts = ["# CheStor — Tokyo Ghoul bot for Telegram: full documentation", ""];
  for (const lang of langsWithDocs()) {
    for (const page of loadPages(lang)) parts.push(pageMarkdown(lang, page));
  }
  return parts.join("\n");
}
