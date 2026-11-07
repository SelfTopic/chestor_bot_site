import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { SiteNav } from "@/components/site/SiteNav";
import { DEFAULT_LANG, isLang, LANGS, otherLang } from "@/i18n/config";
import { t } from "@/i18n";
import { findPage, loadPages } from "@/lib/docs/load";
import { renderMarkdown } from "@/lib/docs/render";
import { docsPageLd } from "@/lib/seo/jsonLd";
import { markdownPath } from "@/lib/seo/markdown";
import { BOT_URL, docsPath } from "@/lib/site";

import "./prose.css";
import styles from "./section.module.css";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => loadPages(lang).map((page) => ({ lang, slug: page.slug })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[lang]/docs/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const page = findPage(lang, slug);
  if (!page) return {};
  return {
    title: page.title,
    description: `${page.title}: ${page.topics.map((topic) => topic.heading).join(", ")}`.slice(0, 200),
    alternates: {
      canonical: docsPath(lang, slug),
      languages: {
        ...Object.fromEntries(LANGS.filter((other) => findPage(other, slug)).map((other) => [other, docsPath(other, slug)])),
        "x-default": docsPath(DEFAULT_LANG, slug),
      },
      types: { "text/markdown": markdownPath(lang, slug) },
    },
    openGraph: { type: "article", title: page.heading, url: docsPath(lang, slug) },
  };
}

export default async function DocsSection({ params }: PageProps<"/[lang]/docs/[slug]">) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const page = findPage(lang, slug);
  if (!page) notFound();

  const dict = t(lang);
  const pages = loadPages(lang);
  const index = pages.indexOf(page);
  const prev = pages[index - 1];
  const next = pages[index + 1];
  const other = otherLang(lang);
  const html = await renderMarkdown(page.markdown);
  const helpWord = page.helpWords[0] ?? page.title.toLowerCase();

  return (
    <>
      <SiteNav
        lang={lang}
        switchLang={other}
        switchHref={findPage(other, slug) ? docsPath(other, slug) : `/${other}/`}
      />
      <div className={styles.layout}>
        <nav className={styles.sidebar} aria-label={dict.docs.sections}>
          <Link href={docsPath(lang)} className={styles.sidebarTitle}>
            {dict.docs.allSections}
          </Link>
          <ol className={styles.sections}>
            {pages.map((item) => (
              <li key={item.slug}>
                <Link
                  href={docsPath(lang, item.slug)}
                  aria-current={item.slug === page.slug ? "page" : undefined}
                  className={styles.sectionLink}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <main className={styles.main}>
          <header className={styles.header}>
            <p className={styles.kicker}>
              {dict.docs.kicker} · {String(page.order).padStart(2, "0")}
            </p>
            <h1 className={styles.title}>{page.heading}</h1>
            {page.topics.length > 0 ? (
              <nav aria-label={dict.docs.onPage} className={styles.topics}>
                {page.topics.map((topic) => (
                  <a key={topic.anchor} href={`#${topic.anchor}`}>
                    {topic.heading}
                  </a>
                ))}
              </nav>
            ) : null}
          </header>

          <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

          <aside className={styles.inBot}>
            <span>{dict.docs.inBot}:</span>
            <a href={BOT_URL}>
              <code>/help {helpWord}</code>
            </a>
          </aside>

          <nav className={styles.pager} aria-label={dict.docs.sections}>
            {prev ? (
              <Link href={docsPath(lang, prev.slug)} className={styles.prev}>
                <span>← {dict.docs.prev}</span>
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={docsPath(lang, next.slug)} className={styles.next}>
                <span>{dict.docs.next} →</span>
                {next.title}
              </Link>
            ) : null}
          </nav>
        </main>
      </div>
      <JsonLd data={docsPageLd(lang, page)} />
    </>
  );
}
