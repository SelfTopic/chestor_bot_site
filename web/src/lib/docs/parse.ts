import { parse as parseYaml } from "yaml";

export class DocsError extends Error {}

export type DocTopic = { heading: string; anchor: string };

export type DocPage = {
  slug: string;
  order: number;
  title: string;
  heading: string;
  helpWords: string[];
  markdown: string;
  topics: DocTopic[];
  updated?: Date;
};

const FRONT = "---";
const TOPIC_PREFIX = "### ";
const FENCE = /^\s*(```|~~~)/;
// Так же заголовок разбивает /help бота: «щелк (щёлк)», «кинуть / перевести».
const SEPARATORS = /[/,()]/;

export function slugFromFile(fileName: string): { slug: string; order: number } {
  const match = /^(\d+)-(.+)\.md$/.exec(fileName);
  if (!match?.[1] || !match[2]) throw new DocsError(`${fileName}: имя файла — «NN-раздел.md»`);
  return { order: Number(match[1]), slug: match[2] };
}

export function topicWords(heading: string): string[] {
  return heading
    .split(SEPARATORS)
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);
}

export function anchorFor(heading: string): string {
  const first = topicWords(heading)[0] ?? heading.toLowerCase();
  return first.replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-+|-+$/g, "") || "topic";
}

export function uniqueAnchors(headings: string[]): string[] {
  const seen = new Map<string, number>();
  return headings.map((heading) => {
    const base = anchorFor(heading);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

function splitFrontmatter(text: string, fileName: string): { head: string; body: string } {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== FRONT) throw new DocsError(`${fileName}: файл начинается с шапки между строками ---`);
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === FRONT);
  if (end === -1) throw new DocsError(`${fileName}: шапка не закрыта строкой ---`);
  return { head: lines.slice(1, end).join("\n"), body: lines.slice(end + 1).join("\n") };
}

function topicHeadings(markdown: string): string[] {
  const headings: string[] = [];
  let fenced = false;
  for (const line of markdown.split("\n")) {
    if (FENCE.test(line)) fenced = !fenced;
    else if (!fenced && line.startsWith(TOPIC_PREFIX)) headings.push(line.slice(TOPIC_PREFIX.length).trim());
  }
  return headings;
}

// Первый «# …» — заголовок страницы: его показывает шапка сайта, а не текст раздела.
function takeHeading(body: string): { heading: string | null; rest: string } {
  const lines = body.trim().split("\n");
  const first = lines[0] ?? "";
  if (!first.startsWith("# ")) return { heading: null, rest: body.trim() };
  return { heading: first.slice(2).trim(), rest: lines.slice(1).join("\n").trim() };
}

export function parsePage(fileName: string, text: string): DocPage {
  const { slug, order } = slugFromFile(fileName);
  const { head, body } = splitFrontmatter(text, fileName);
  const meta: unknown = parseYaml(head);
  if (typeof meta !== "object" || meta === null) throw new DocsError(`${fileName}: в шапке нужен title`);
  const { title, help } = meta as Record<string, unknown>;
  if (typeof title !== "string" || !title.trim()) throw new DocsError(`${fileName}: в шапке нужен title`);
  if (help !== undefined && help !== null && typeof help !== "string") {
    throw new DocsError(`${fileName}: help — слова через запятую`);
  }

  const { heading, rest } = takeHeading(body);
  const headings = topicHeadings(rest);
  const anchors = uniqueAnchors(headings);

  return {
    slug,
    order,
    title: title.trim(),
    heading: heading ?? title.trim(),
    helpWords: (help ?? "")
      .split(",")
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean),
    markdown: rest,
    topics: headings.map((heading, i) => ({ heading, anchor: anchors[i] ?? anchorFor(heading) })),
  };
}
