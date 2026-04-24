import { useState } from "react";
import { useAuth } from "../context/useAuth.js";
import { useLanguage } from "../context/useLanguage.js";
import LanguageToggle from "./LanguageToggle.jsx";
import { Gift, BarChart3, Printer, Globe2, Phone, Lock, ArrowRight } from "lucide-react";
import ErrorBanner from "./ui/ErrorBanner.jsx";

const FEATURES = [
  { icon: Gift, titleKey: "loginFeatures.0.title", subKey: "loginFeatures.0.sub" },
  { icon: BarChart3, titleKey: "loginFeatures.1.title", subKey: "loginFeatures.1.sub" },
  { icon: Printer, titleKey: "loginFeatures.2.title", subKey: "loginFeatures.2.sub" },
  { icon: Globe2, titleKey: "loginFeatures.3.title", subKey: "loginFeatures.3.sub" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    if (!phone || !pass) {
      setError(t("login.errorMissing") || "Phone and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login({ phone: phone.trim(), password: pass });
    } catch (err) {
      setError(err.message || t("login.errorFailed") || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div style={{ position: "absolute", top: 20, right: 24, zIndex: 2 }}>
        <LanguageToggle />
      </div>

      <div className="login-hero">
        <div className="login-hero-logo">M</div>
        <h1>{t("nav.brandTitle") || "Moi Tech"}</h1>
        <p>{t("login.tagline") || "A modern event-gift management system for affiliates, writers, and event owners."}</p>
        <div className="login-features">
          {FEATURES.map((f, i) => (
            <div className="login-feature" key={i}>
              <div className="login-feature-icon">
                <f.icon size={18} />
              </div>
              <div>
                <div className="login-feature-title">{t(f.titleKey)}</div>
                <div className="login-feature-desc">{t(f.subKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleLogin}>
          <h2>{t("login.welcomeBack") || "Welcome back"}</h2>
          <p className="sub">{t("login.signInSub") || "Sign in with your phone number and password."}</p>

          {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

          <div className="form-group mb-3">
            <label>
              <Phone size={12} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />
              {t("login.phone") || "Phone Number"}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9000000000"
              autoComplete="tel"
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="form-group mb-4">
            <label>
              <Lock size={12} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />
              {t("login.password") || "Password"}
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder={t("login.passwordPh") || "Your password"}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
            {loading ? t("login.signingIn") || "Signing in…" : (
              <>
                {t("login.signIn") || "Sign In"} <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="login-hint">
            <strong>{t("login.demoTitle") || "Demo accounts"}</strong>
            <div>Admin: <code>9000000000 / admin123</code></div>
            <div>Affiliate: <code>9811234567 / ravi123</code></div>
            <div>Writer: <code>9876500001 / writer123</code></div>
          </div>
        </form>
      </div>
    </div>
  );
}
