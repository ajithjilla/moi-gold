import { useLanguage } from "../context/useLanguage.js";

export default function LanguageToggle({ className = "" }) {
  const { locale, setLocale, t } = useLanguage();
  return (
    <div className={`lang-toggle ${className}`.trim()} role="group" aria-label={t("lang.toggle")}>
      <button type="button" className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")}>
        {t("lang.en")}
      </button>
      <button type="button" className={locale === "ta" ? "active" : ""} onClick={() => setLocale("ta")}>
        {t("lang.ta")}
      </button>
    </div>
  );
}
