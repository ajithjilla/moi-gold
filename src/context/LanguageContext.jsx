import { useCallback, useEffect, useMemo, useState } from "react";
import en from "../locales/english.json";
import ta from "../locales/tamil.json";
import { LanguageContext } from "./languageContext.js";

const STORAGE_KEY = "moi-gold-locale";

const bundles = { en, ta };

function getValue(obj, path) {
  if (!path) return obj;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) {
      const idx = Number(p);
      cur = Number.isInteger(idx) ? cur[idx] : undefined;
    } else {
      cur = cur[p];
    }
  }
  return cur;
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "ta" || stored === "en") return stored;
    return "en";
  });

  const setLocale = useCallback((next) => {
    const l = next === "ta" ? "ta" : "en";
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "ta" ? "ta" : "en";
  }, [locale]);

  const t = useCallback(
    (key) => {
      const bundle = bundles[locale] ?? bundles.en;
      let val = getValue(bundle, key);
      if (val === undefined) val = getValue(bundles.en, key);
      return val !== undefined ? val : key;
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
