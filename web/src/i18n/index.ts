import type { Lang } from "./config";
import { en } from "./en";
import { ru } from "./ru";

export type Dict = typeof ru;

const DICTS: Record<Lang, Dict> = { ru, en };

export function t(lang: Lang): Dict {
  return DICTS[lang];
}
