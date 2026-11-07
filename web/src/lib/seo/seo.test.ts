import { describe, expect, it } from "vitest";

import { LANGS } from "@/i18n/config";
import { t } from "@/i18n";
import { parsePage } from "@/lib/docs/parse";

import { docsPageLd, faqLd, gameLd } from "./jsonLd";
import { markdownPath, pageMarkdown } from "./markdown";

const page = parsePage("06-economy.md", "---\ntitle: Деньги\nhelp: деньги\n---\n# 💰 Деньги\n\n### щелк (щёлк)\n\nтекст\n");

describe("FAQ", () => {
  it("is filled in every language and points to existing docs sections", () => {
    const ru = t("ru").faq;
    for (const lang of LANGS) {
      const faq = t(lang).faq;
      expect(faq.length).toBe(ru.length);
      faq.forEach((item, i) => {
        expect(item.question.trim()).not.toBe("");
        expect(item.answer.trim()).not.toBe("");
        expect(item.slug).toBe(ru[i]?.slug);
      });
    }
  });

  it("goes to JSON-LD exactly as written on the page", () => {
    const ld = faqLd("ru") as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(ld.mainEntity.map((q) => q.name)).toEqual(t("ru").faq.map((item) => item.question));
    expect(ld.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(t("ru").faq.map((item) => item.answer));
  });
});

describe("structured data", () => {
  it("describes the bot as a free Telegram game", () => {
    const ld = gameLd("en");
    expect(ld["gamePlatform"]).toBe("Telegram");
    expect(ld["isAccessibleForFree"]).toBe(true);
    expect(ld["sameAs"]).toContain("https://t.me/chestor_chat_bot");
  });

  it("gives a docs section an article and breadcrumbs", () => {
    const [article, breadcrumbs] = docsPageLd("ru", page);
    expect(article?.["url"]).toBe("https://chestor-bot.site/ru/docs/economy/");
    expect(breadcrumbs?.["@type"]).toBe("BreadcrumbList");
  });
});

describe("markdown for models", () => {
  it("keeps the section text and links back to the page", () => {
    const md = pageMarkdown("ru", page);
    expect(md.startsWith("# 💰 Деньги\n")).toBe(true);
    expect(md).toContain("### щелк (щёлк)");
    expect(md).toContain("Source: https://chestor-bot.site/ru/docs/economy/");
    expect(markdownPath("en", "economy")).toBe("/md/en/economy.md");
  });
});
