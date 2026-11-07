import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { Lang } from "@/i18n/config";

import { DocsError, parsePage, type DocPage } from "./parse";

// Корень справки бота: русская — в нём, переводы — в подпапках языков (en/).
function docsRoot(): string {
  return process.env.BOT_DOCS_DIR ?? path.join(process.cwd(), ".bot", "docs", "players");
}

function langDir(lang: Lang): string {
  return lang === "ru" ? docsRoot() : path.join(docsRoot(), lang);
}

const cache = new Map<Lang, DocPage[]>();

export function loadPages(lang: Lang): DocPage[] {
  const cached = cache.get(lang);
  if (cached) return cached;

  const dir = langDir(lang);
  if (!existsSync(dir)) {
    if (lang !== "ru") return [];
    throw new DocsError(`нет справки бота в ${dir}: запусти «pnpm fetch-docs» или задай BOT_DOCS_DIR`);
  }

  const pages = readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .sort()
    .map((name) => parsePage(name, readFileSync(path.join(dir, name), "utf-8")));

  const slugs = new Set<string>();
  for (const page of pages) {
    if (slugs.has(page.slug)) throw new DocsError(`${dir}: два раздела с адресом «${page.slug}»`);
    slugs.add(page.slug);
  }

  cache.set(lang, pages);
  return pages;
}

export function findPage(lang: Lang, slug: string): DocPage | undefined {
  return loadPages(lang).find((page) => page.slug === slug);
}
