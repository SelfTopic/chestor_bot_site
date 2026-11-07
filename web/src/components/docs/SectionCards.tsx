import Link from "next/link";

import type { Lang } from "@/i18n/config";
import { t } from "@/i18n";
import type { DocPage } from "@/lib/docs/parse";
import { docsPath } from "@/lib/site";

import styles from "./SectionCards.module.css";

const TOPICS_SHOWN = 6;

export function SectionCards({ lang, pages }: { lang: Lang; pages: DocPage[] }) {
  const dict = t(lang);
  return (
    <ol className={styles.grid}>
      {pages.map((page) => {
        const shown = page.topics.slice(0, TOPICS_SHOWN);
        const rest = page.topics.length - shown.length;
        return (
          <li key={page.slug} className={styles.card}>
            <p className={styles.number}>{String(page.order).padStart(2, "0")}</p>
            <h3 className={styles.title}>
              <Link href={docsPath(lang, page.slug)} className={styles.link}>
                {page.heading}
              </Link>
            </h3>
            <ul className={styles.topics}>
              {shown.map((topic) => (
                <li key={topic.anchor}>
                  <Link href={`${docsPath(lang, page.slug)}#${topic.anchor}`}>{topic.heading}</Link>
                </li>
              ))}
              {rest > 0 ? <li className={styles.more}>{dict.docs.topicsMore(rest)}</li> : null}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
