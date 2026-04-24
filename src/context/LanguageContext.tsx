import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import en from "../locales/english.json";
import ta from "../locales/tamil.json";
import { LanguageContext, type Locale } from "./languageContextValue";

const STORAGE_KEY = "moi-gold-locale";

const bundles = { en, ta } as const;

function getValue(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) {
      const idx = Number(p);
      cur = Number.isInteger(idx) ? cur[idx] : undefined;
    } else if (typeof cur === "object") {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "ta" || stored === "en") return stored;
    return "en";
  });

  const setLocale = useCallback((next: Locale) => {
    const l = next === "ta" ? "ta" : "en";
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "ta" ? "ta" : "en";
  }, [locale]);

  const t = useCallback(
    (key: string) => {
      const bundle = bundles[locale] ?? bundles.en;
      let val = getValue(bundle, key);
      if (val === undefined) val = getValue(bundles.en, key);
      return typeof val === "string" ? val : key;
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      toggleLocale: () => setLocale(locale === "en" ? "ta" : "en"),
    }),
    [locale, setLocale, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
