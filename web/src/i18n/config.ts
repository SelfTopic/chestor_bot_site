export const LANGS = ["ru", "en"] as const;

export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "ru";

// Фарси и арабский добавятся сюда с "rtl" — вёрстка уже на логических свойствах.
export const DIR: Record<Lang, "ltr" | "rtl"> = { ru: "ltr", en: "ltr" };

export const OG_LOCALE: Record<Lang, string> = { ru: "ru_RU", en: "en_US" };

// Пока языков два, переключатель в шапке ведёт на «другой»; с третьим станет списком.
export function otherLang(lang: Lang): Lang {
  return lang === "ru" ? "en" : "ru";
}

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}
