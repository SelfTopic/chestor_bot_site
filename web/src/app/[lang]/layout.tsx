import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/SiteFooter";
import { DIR, isLang, LANGS, OG_LOCALE } from "@/i18n/config";
import { t } from "@/i18n";
import { SITE_URL } from "@/lib/site";
import { THEME_COLOR, themeInitScript } from "@/lib/theme";

import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = t(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.title, template: "%s · CheStor" },
    description: dict.meta.description,
    applicationName: "CheStor",
    openGraph: { type: "website", siteName: "CheStor", locale: OG_LOCALE[lang] },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR.human },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.ghoul },
  ],
};

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={lang} dir={DIR[lang]} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Тема ставится до первой отрисовки, иначе «Гуль» мигнёт светлым. Строка статична. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <SiteFooter lang={lang} />
      </body>
    </html>
  );
}
