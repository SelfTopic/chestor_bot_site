import Link from "next/link";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { Lang } from "@/i18n/config";
import { t } from "@/i18n";
import { docsPath } from "@/lib/site";

import styles from "./SiteNav.module.css";

// switchHref — та же страница на другом языке; если перевода нет, ведёт на главную того языка.
type SiteNavProps = { lang: Lang; switchHref: string; switchLang: Lang };

export function SiteNav({ lang, switchHref, switchLang }: SiteNavProps) {
  const dict = t(lang);
  return (
    <header className={styles.nav}>
      <Link href={`/${lang}/`} className={styles.logo}>
        {dict.nav.home}
      </Link>
      <nav className={styles.links} aria-label={dict.docs.sections}>
        <Link href={docsPath(lang)}>{dict.nav.docs}</Link>
        <Link href={switchHref} hrefLang={switchLang} lang={switchLang} aria-label={dict.nav.switchLangLabel}>
          {dict.nav.switchLang}
        </Link>
      </nav>
      <ThemeToggle toGhoul={dict.theme.toGhoul} toHuman={dict.theme.toHuman} />
    </header>
  );
}
