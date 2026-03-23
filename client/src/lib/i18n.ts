import { useState, useEffect } from "react";

import en from "../locales/en";
import es from "../locales/es";
import pt from "../locales/pt";
import fr from "../locales/fr";
import zh from "../locales/zh";
import ar from "../locales/ar";
import hi from "../locales/hi";
import tl from "../locales/tl";

export type Language = "en" | "es" | "pt" | "fr" | "zh" | "ar" | "hi" | "tl";

export const LANGUAGES: Record<
  Language,
  { name: string; native: string; flag: string; dir: "ltr" | "rtl" }
> = {
  en: { name: "English",    native: "English",    flag: "🇺🇸", dir: "ltr" },
  es: { name: "Spanish",    native: "Español",    flag: "🇪🇸", dir: "ltr" },
  pt: { name: "Portuguese", native: "Português",  flag: "🇧🇷", dir: "ltr" },
  fr: { name: "French",     native: "Français",   flag: "🇫🇷", dir: "ltr" },
  zh: { name: "Mandarin",   native: "中文",        flag: "🇨🇳", dir: "ltr" },
  ar: { name: "Arabic",     native: "العربية",    flag: "🇸🇦", dir: "rtl" },
  hi: { name: "Hindi",      native: "हिन्दी",      flag: "🇮🇳", dir: "ltr" },
  tl: { name: "Tagalog",    native: "Tagalog",    flag: "🇵🇭", dir: "ltr" },
} as const;

const STORAGE_KEY = "scoreshift_lang";

// All locale bundles keyed by language code — loaded statically (no async)
const LOCALES: Record<Language, Record<string, string>> = {
  en,
  es,
  pt,
  fr,
  zh,
  ar,
  hi,
  tl,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidLanguage(value: string): value is Language {
  return Object.keys(LANGUAGES).includes(value);
}

function applyDocumentAttributes(lang: Language): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = LANGUAGES[lang].dir;
}

// ---------------------------------------------------------------------------
// getCurrentLanguage — safe to call outside of React (e.g. in API utils)
// ---------------------------------------------------------------------------

export function getCurrentLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isValidLanguage(stored)) return stored;
  return "en";
}

// ---------------------------------------------------------------------------
// useLanguage — React hook
// ---------------------------------------------------------------------------

export function useLanguage(): {
  language: Language;
  setLanguage: (lang: Language) => void;
} {
  const [language, setLanguageState] = useState<Language>("en");

  // Read from localStorage on mount and apply document attributes
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: Language = stored && isValidLanguage(stored) ? stored : "en";
    setLanguageState(initial);
    applyDocumentAttributes(initial);
  }, []);

  function setLanguage(lang: Language): void {
    window.localStorage.setItem(STORAGE_KEY, lang);
    applyDocumentAttributes(lang);
    setLanguageState(lang);
  }

  return { language, setLanguage };
}

// ---------------------------------------------------------------------------
// t() — translate a key for a given language, falling back to English
// ---------------------------------------------------------------------------

export function t(key: string, lang: Language): string {
  const bundle = LOCALES[lang];
  if (bundle && key in bundle) return bundle[key];

  // Fallback to English
  const fallback = LOCALES["en"];
  if (fallback && key in fallback) return fallback[key];

  // Last resort: return the raw key so nothing is silently blank
  return key;
}
