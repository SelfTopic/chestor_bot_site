import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCards } from "@/components/docs/SectionCards";
import { Quiz } from "@/components/quiz/Quiz";
import { JsonLd } from "@/components/seo/JsonLd";
import { Faq } from "@/components/site/Faq";
import { SiteNav } from "@/components/site/SiteNav";
import { isLang, LANGS, otherLang } from "@/i18n/config";
import { t } from "@/i18n";
import { loadPages } from "@/lib/docs/load";
import { faqLd, gameLd, websiteLd } from "@/lib/seo/jsonLd";
import { BOT_ADD_TO_GROUP_URL, BOT_URL, docsPath } from "@/lib/site";

import styles from "./home.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    alternates: {
      canonical: `/${lang}/`,
      languages: { ...Object.fromEntries(LANGS.map((other) => [other, `/${other}/`])), "x-default": "/" },
    },
  };
}

// Временная главная до лендинга (docs/spec.md, часть 1): шапка и карточки разделов справки.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const pages = loadPages(lang);
  const other = otherLang(lang);

  return (
    <>
      <SiteNav lang={lang} switchLang={other} switchHref={`/${other}/`} />
      <main>
        <section className={styles.hero}>
          <p className={styles.kicker}>{dict.home.kicker}</p>
          <h1 className={styles.title}>{dict.home.title}</h1>
          <p className={styles.lead}>{dict.home.lead}</p>
          <div className={styles.actions}>
            <a href={BOT_URL} className={styles.primary}>
              {dict.home.play}
            </a>
            <a href={BOT_ADD_TO_GROUP_URL} className={styles.secondary}>
              {dict.home.addToGroup}
            </a>
            {pages.length ? (
              <Link href={docsPath(lang)} className={styles.secondary}>
                {dict.home.docs}
              </Link>
            ) : null}
          </div>
        </section>
        {pages.length ? (
          <section className={styles.section}>
            <p className={styles.kicker}>{dict.home.sectionsKicker}</p>
            <h2 className={styles.sectionTitle}>{dict.home.sectionsTitle}</h2>
            <SectionCards lang={lang} pages={pages} />
          </section>
        ) : null}
        <section className={styles.section} id="quiz">
          <p className={styles.kicker}>{dict.quiz.kicker}</p>
          <h2 className={styles.sectionTitle}>{dict.quiz.title}</h2>
          <p className={styles.sectionLead}>{dict.quiz.lead}</p>
          <Quiz lang={lang} />
        </section>
        <section className={styles.section} id="faq">
          <p className={styles.kicker}>{dict.home.faqKicker}</p>
          <h2 className={styles.sectionTitle}>{dict.home.faqTitle}</h2>
          <Faq lang={lang} />
        </section>
      </main>
      <JsonLd data={[websiteLd(lang), gameLd(lang), faqLd(lang)]} />
    </>
  );
}
