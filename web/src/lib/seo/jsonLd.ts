// JSON-LD (schema.org) собирается из тех же текстов, что видны на странице (docs/seo.md, 0.2, 1.5).
import type { Lang } from "@/i18n/config";
import { LANGS } from "@/i18n/config";
import { t } from "@/i18n";
import type { DocPage } from "@/lib/docs/parse";
import { BOT_REPO_URL, BOT_TECH_PAGE_URL, BOT_URL, docsPath, SITE_URL } from "@/lib/site";

export type JsonLd = Record<string, unknown>;

const WEBSITE_ID = `${SITE_URL}/#website`;
const GAME_ID = `${SITE_URL}/#game`;

export function websiteLd(lang: Lang): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "CheStor",
    inLanguage: [...LANGS],
    description: t(lang).meta.description,
  };
}

export function gameLd(lang: Lang): JsonLd {
  const dict = t(lang);
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "@id": GAME_ID,
    name: "CheStor",
    alternateName: dict.seo.gameAltNames,
    description: dict.meta.description,
    url: `${SITE_URL}/${lang}/`,
    sameAs: [BOT_URL, BOT_REPO_URL, BOT_TECH_PAGE_URL],
    gamePlatform: "Telegram",
    operatingSystem: "Telegram",
    applicationCategory: "GameApplication",
    genre: ["RPG"],
    playMode: "MultiPlayer",
    inLanguage: [...LANGS],
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD", url: BOT_URL },
    isBasedOn: { "@type": "CreativeWork", name: "Tokyo Ghoul", alternateName: "Токийский гуль" },
  };
}

export function faqLd(lang: Lang): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: t(lang).faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer, url: `${SITE_URL}${docsPath(lang, item.slug)}` },
    })),
  };
}

export function docsPageLd(lang: Lang, page: DocPage): JsonLd[] {
  const dict = t(lang);
  const url = `${SITE_URL}${docsPath(lang, page.slug)}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: page.heading,
      name: page.title,
      url,
      inLanguage: lang,
      keywords: [...page.helpWords, ...page.topics.map((topic) => topic.heading)].join(", "),
      about: { "@id": GAME_ID },
      isPartOf: { "@id": WEBSITE_ID },
      ...(page.updated ? { dateModified: page.updated.toISOString() } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: dict.seo.breadcrumbHome, item: `${SITE_URL}/${lang}/` },
        { "@type": "ListItem", position: 2, name: dict.docs.kicker, item: `${SITE_URL}${docsPath(lang)}` },
        { "@type": "ListItem", position: 3, name: page.title, item: url },
      ],
    },
  ];
}
