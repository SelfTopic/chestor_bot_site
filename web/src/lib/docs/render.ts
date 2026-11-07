import type { Element, Root } from "hast";
import { toString } from "hast-util-to-string";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { uniqueAnchors } from "./parse";

// Якоря подразделов те же, что в списке тем (parsePage), — ссылки «#щелк» совпадают.
function topicAnchors() {
  return (tree: Root) => {
    const topics: Element[] = [];
    visit(tree, "element", (node) => {
      if (node.tagName === "h3") topics.push(node);
    });
    const anchors = uniqueAnchors(topics.map((node) => toString(node)));
    topics.forEach((node, i) => {
      const id = anchors[i];
      if (!id) return;
      node.properties = { ...node.properties, id };
      node.children = [
        {
          type: "element",
          tagName: "a",
          properties: { href: `#${id}`, className: ["topic-anchor"], ariaHidden: "true", tabIndex: -1 },
          children: [{ type: "text", value: "#" }],
        },
        ...node.children,
      ];
    });
  };
}

// Таблицы шире экрана телефона прокручиваются внутри обёртки, а не всей страницей.
function scrollableTables() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "table" || !parent || index === undefined) return;
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-scroll"] },
        children: [node],
      };
    });
  };
}

// Ссылки наружу открываются в новой вкладке, чтобы не терять место в справке.
function externalLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      const href = node.properties?.href;
      if (node.tagName === "a" && typeof href === "string" && /^https?:\/\//.test(href)) {
        node.properties = { ...node.properties, target: "_blank", rel: ["noopener"] };
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(topicAnchors)
  .use(scrollableTables)
  .use(externalLinks)
  .use(rehypeStringify);

export async function renderMarkdown(markdown: string): Promise<string> {
  return String(await processor.process(markdown));
}
