import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/useLanguage.js";
import LanguageToggle from "./LanguageToggle.jsx";

const FEATURES = [
  { icon: "💍", titleKey: "loginFeatures.0.title", subKey: "loginFeatures.0.sub" },
  { icon: "📊", titleKey: "loginFeatures.1.title", subKey: "loginFeatures.1.sub" },
  { icon: "🖨️", titleKey: "loginFeatures.2.title", subKey: "loginFeatures.2.sub" },
  { icon: "🌐", titleKey: "loginFeatures.3.title", subKey: "loginFeatures.3.sub" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !pass) { setError("Phone and password are required"); return; }
    setError("");
    setLoading(true);
    try {
      await login({ phone, password: pass });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="login-page pattern-bg">
      <div className="login-lang" style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <LanguageToggle />
      </div>

      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-big">M</div>
          <div className="login-app-name">மொய்<br />Moi Tech</div>
          <div className="login-tagline">{t("login.tagline")}</div>
        </div>
        <div className="login-features">
          {FEATURES.map((f, i) => (
            <div className="login-feature" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div>
                <div className="feature-text-title">{t(f.titleKey)}</div>
                <div className="feature-text-sub">{t(f.subKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right" style={{ background: "rgba(26,10,0,0.2)", backdropFilter: "blur(10px)" }}>
        <div className="login-card">
          <div className="login-card-title">{t("login.welcomeBack")}</div>
          <div className="login-card-sub">{t("login.signInSub")}</div>

          {error && (
            <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div className="form-group mb-3">
            <label>{t("login.phone") || "Phone Number"}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter mobile number"
              onKeyDown={handleKey}
              autoComplete="tel"
            />
          </div>
          <div className="form-group mb-4">
            <label>{t("login.password")}</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder={t("login.passwordPh")}
              onKeyDown={handleKey}
              autoComplete="current-password"
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : t("login.signIn")}
          </button>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--muted)" }}>
            {t("login.needAccount")} <strong style={{ color: "var(--gold-dark)" }}>admin@moitech.in</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
