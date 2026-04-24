import { createContext } from "react";

export type Locale = "en" | "ta";

export interface LanguageContextValue {
  locale: Locale;
  setLocale: (_locale: Locale) => void;
  toggleLocale: () => void;
  t: (_key: string) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
