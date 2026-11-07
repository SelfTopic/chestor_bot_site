import type { MetadataRoute } from "next";

import { LANGS, type Lang } from "@/i18n/config";
import { loadPages } from "@/lib/docs/load";
import { docsPath, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function languages(paths: Partial<Record<Lang, string>>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(paths).map(([lang, path]) => [lang, `${SITE_URL}${path}`]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const docsLangs = LANGS.filter((lang) => loadPages(lang).length > 0);
  const latest = (lang: Lang) =>
    loadPages(lang).reduce<Date | undefined>(
      (max, page) => (page.updated && (!max || page.updated > max) ? page.updated : max),
      undefined,
    );

  const homes = LANGS.map((lang) => ({
    url: `${SITE_URL}/${lang}/`,
    lastModified: latest(lang),
    alternates: { languages: languages(Object.fromEntries(LANGS.map((other) => [other, `/${other}/`]))) },
  }));

  const indexes = docsLangs.map((lang) => ({
    url: `${SITE_URL}${docsPath(lang)}`,
    lastModified: latest(lang),
    alternates: { languages: languages(Object.fromEntries(docsLangs.map((other) => [other, docsPath(other)]))) },
  }));

  const sections = docsLangs.flatMap((lang) =>
    loadPages(lang).map((page) => ({
      url: `${SITE_URL}${docsPath(lang, page.slug)}`,
      lastModified: page.updated,
      alternates: {
        languages: languages(
          Object.fromEntries(
            docsLangs
              .filter((other) => loadPages(other).some((item) => item.slug === page.slug))
              .map((other) => [other, docsPath(other, page.slug)]),
          ),
        ),
      },
    })),
  );

  return [...homes, ...indexes, ...sections];
}
