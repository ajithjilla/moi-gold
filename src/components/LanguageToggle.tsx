import { useLanguage } from "../context/useLanguage";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();
  return (
    <button
      className="lang-toggle"
      onClick={toggleLocale}
      title={locale === "ta" ? "Switch to English" : "தமிழுக்கு மாறவும்"}
    >
      {locale === "ta" ? "EN" : "தமிழ்"}
    </button>
  );
}
