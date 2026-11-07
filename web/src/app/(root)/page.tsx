import type { Metadata } from "next";
import Link from "next/link";

import { DEFAULT_LANG, LANGS } from "@/i18n/config";
import { t } from "@/i18n";
import { SITE_URL } from "@/lib/site";

import styles from "./page.module.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: t(DEFAULT_LANG).meta.title,
  description: t(DEFAULT_LANG).meta.description,
  alternates: { canonical: `/${DEFAULT_LANG}/`, languages: Object.fromEntries(LANGS.map((lang) => [lang, `/${lang}/`])) },
};

// Статике nginx нечем выбрать язык на сервере, поэтому выбирает браузер; без JS — ссылки.
const pickLanguage = `(function(){var l=(navigator.languages||[navigator.language||""]).join(",").toLowerCase();location.replace(/(^|,)ru/.test(l)?"/ru/":"/en/")})();`;

export default function LanguagePicker() {
  return (
    <main className={styles.picker}>
      <script dangerouslySetInnerHTML={{ __html: pickLanguage }} />
      <p className={styles.logo}>CheStor</p>
      <ul className={styles.langs}>
        {LANGS.map((lang) => (
          <li key={lang}>
            <Link href={`/${lang}/`} hrefLang={lang} lang={lang}>
              {t(lang).langName}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
