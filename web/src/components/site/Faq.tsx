import Link from "next/link";

import type { Lang } from "@/i18n/config";
import { t } from "@/i18n";
import { docsPath } from "@/lib/site";

import styles from "./Faq.module.css";

// Тот же список, что уходит в FAQPage JSON-LD: разметка не расходится с видимым текстом.
export function Faq({ lang }: { lang: Lang }) {
  const dict = t(lang);
  return (
    <dl className={styles.faq}>
      {dict.faq.map((item) => (
        <div key={item.question} className={styles.item}>
          <dt className={styles.question}>{item.question}</dt>
          <dd className={styles.answer}>
            {item.answer}{" "}
            <Link href={docsPath(lang, item.slug)} className={styles.more}>
              {dict.seo.faqMore} →
            </Link>
          </dd>
        </div>
      ))}
    </dl>
  );
}
