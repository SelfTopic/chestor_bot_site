import { describe, expect, it } from "vitest";

import { renderMarkdown } from "./render";
import { anchorFor, DocsError, parsePage, slugFromFile, topicWords, uniqueAnchors } from "./parse";

const page = (body: string, head = "title: Деньги\nhelp: деньги, CheSton") => `---\n${head}\n---\n${body}`;

describe("slugFromFile", () => {
  it("drops the order number from the address", () => {
    expect(slugFromFile("06-economy.md")).toEqual({ order: 6, slug: "economy" });
  });

  it("rejects files without a number", () => {
    expect(() => slugFromFile("economy.md")).toThrow(DocsError);
  });
});

describe("topic words and anchors", () => {
  it("split headings like /help of the bot", () => {
    expect(topicWords("кинуть / перевести / подать (/transfer)")).toEqual(["кинуть", "перевести", "подать", "transfer"]);
    expect(topicWords("/start")).toEqual(["start"]);
  });

  it("take the first name as the anchor", () => {
    expect(anchorFor("щелк (щёлк)")).toBe("щелк");
    expect(anchorFor("ссылки на видео (tiktok, youtube)")).toBe("ссылки-на-видео");
    expect(anchorFor("язык (/lang)")).toBe("язык");
  });

  it("number repeated anchors on one page", () => {
    expect(uniqueAnchors(["вопросы (джет)", "вопросы (рулетка)"])).toEqual(["вопросы", "вопросы-2"]);
  });
});

describe("parsePage", () => {
  it("reads the header, the page title and the topics", () => {
    const parsed = parsePage("06-economy.md", page("# 💰 Деньги\n\nтекст\n\n### щелк (щёлк)\n\n### бал\n"));
    expect(parsed.title).toBe("Деньги");
    expect(parsed.heading).toBe("💰 Деньги");
    expect(parsed.helpWords).toEqual(["деньги", "cheston"]);
    expect(parsed.topics).toEqual([
      { heading: "щелк (щёлк)", anchor: "щелк" },
      { heading: "бал", anchor: "бал" },
    ]);
    expect(parsed.markdown.startsWith("# ")).toBe(false);
  });

  it("ignores ### inside code blocks", () => {
    const parsed = parsePage("01-start.md", page("```\n### не тема\n```\n\n### тема\n"));
    expect(parsed.topics.map((topic) => topic.anchor)).toEqual(["тема"]);
  });

  it("fails the build on a broken header", () => {
    expect(() => parsePage("01-start.md", "# без шапки")).toThrow(DocsError);
    expect(() => parsePage("01-start.md", page("текст", "help: слова"))).toThrow(/title/);
  });
});

describe("renderMarkdown", () => {
  it("gives topics the same anchors as the topic list", async () => {
    const html = await renderMarkdown("### вопросы (джет)\n\n### вопросы\n");
    expect(html).toContain('id="вопросы"');
    expect(html).toContain('id="вопросы-2"');
  });

  it("keeps tables, details and external links usable", async () => {
    const html = await renderMarkdown(
      "| a | b |\n|--|--|\n| 1 | 2 |\n\n<details><summary>ещё</summary>\n\nтекст\n\n</details>\n\n[канал](https://t.me/chestor_channel)",
    );
    expect(html).toContain('<div class="table-scroll"><table>');
    expect(html).toContain("<details>");
    expect(html).toContain('target="_blank"');
  });
});
