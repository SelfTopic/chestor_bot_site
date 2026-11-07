import type { Lang } from "@/i18n/config";
import { t } from "@/i18n";
import { BOT_REPO_URL, BOT_TECH_PAGE_URL, BOT_URL, BOT_USERNAME, DOCS_CHANNEL } from "@/lib/site";

import styles from "./SiteFooter.module.css";

export function SiteFooter({ lang }: { lang: Lang }) {
  const dict = t(lang);
  return (
    <footer className={styles.footer}>
      <a href={BOT_URL}>@{BOT_USERNAME}</a>
      <a href={DOCS_CHANNEL[lang]}>{dict.docs.channel}</a>
      <a href={BOT_TECH_PAGE_URL}>{dict.footer.builtBy}</a>
      <a href={`${BOT_REPO_URL}/tree/main/docs/players`}>{dict.footer.source}</a>
    </footer>
  );
}
