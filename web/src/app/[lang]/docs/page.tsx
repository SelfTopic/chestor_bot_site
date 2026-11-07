import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionCards } from "@/components/docs/SectionCards";
import { SiteNav } from "@/components/site/SiteNav";
import { DEFAULT_LANG, isLang, LANGS, otherLang } from "@/i18n/config";
import { t } from "@/i18n";
import { loadPages } from "@/lib/docs/load";
import { docsPath } from "@/lib/site";

import styles from "./docs.module.css";

export function generateStaticParams() {
  return LANGS.filter((lang) => loadPages(lang).length > 0).map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/docs">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = t(lang);
  return {
    title: dict.docs.title,
    description: dict.docs.lead,
    alternates: {
      canonical: docsPath(lang),
      languages: {
        ...Object.fromEntries(LANGS.filter((other) => loadPages(other).length > 0).map((other) => [other, docsPath(other)])),
        "x-default": docsPath(DEFAULT_LANG),
      },
    },
  };
}

export default async function DocsIndex({ params }: PageProps<"/[lang]/docs">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const pages = loadPages(lang);
  const other = otherLang(lang);

  return (
    <>
      <SiteNav lang={lang} switchLang={other} switchHref={loadPages(other).length ? docsPath(other) : `/${other}/`} />
      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.kicker}>{dict.docs.kicker}</p>
          <h1 className={styles.title}>{dict.docs.title}</h1>
          <p className={styles.lead}>{dict.docs.lead}</p>
        </header>
        <SectionCards lang={lang} pages={pages} />
      </main>
    </>
  );
}
