import en from "@/locales/en.json";
import ko from "@/locales/ko.json";

export const languages = ["en", "ko"] as const;

export type Language = (typeof languages)[number];
export type TranslationKey = keyof typeof en;

const dict: Record<Language, typeof en> = { en, ko };

export function isLanguage(value: string | null): value is Language {
  return languages.includes(value as Language);
}

export function t(key: TranslationKey, lang: Language) {
  return dict[lang]?.[key] || dict.en[key] || key;
}
