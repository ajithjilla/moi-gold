import { useState } from "react";

const ROLE_MAP = {
  admin: { email: "admin@moitech.in", pass: "admin123" },
  affiliate: { email: "ravi@gmail.com", pass: "ravi123" },
  owner: { email: "murugan@gmail.com", pass: "owner123" },
};

const FEATURES = [
  { icon: "💍", title: "All Functions Covered", sub: "Wedding, Engagement, Ear Piercing, Cradle & more" },
  { icon: "📊", title: "Real-time Tracking", sub: "Event owners view gifts live on mobile" },
  { icon: "🖨️", title: "Print & Export", sub: "PDF reports for families at end of function" },
  { icon: "🌐", title: "Tamil + English", sub: "Bilingual interface for ease of use" },
];

const ROLES = [
  ["admin", "🛡️ Admin"],
  ["affiliate", "💼 Affiliate"],
  ["owner", "📱 Event Owner"],
];

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState("affiliate");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = () => {
    const demo = ROLE_MAP[role];
    if (email === demo.email && pass === demo.pass) {
      onLogin(role);
    } else {
      onLogin(role);
    }
  };

  const handleRoleClick = (r) => {
    setRole(r);
    setEmail(ROLE_MAP[r].email);
    setPass(ROLE_MAP[r].pass);
  };

  return (
    <div className="login-page pattern-bg">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-big">M</div>
          <div className="login-app-name">மொய்<br />Moi Tech</div>
          <div className="login-tagline">Digital Gift Tracking for Tamil Nadu Functions</div>
        </div>
        <div className="login-features">
          {FEATURES.map((f, i) => (
            <div className="login-feature" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div>
                <div className="feature-text-title">{f.title}</div>
                <div className="feature-text-sub">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right" style={{ background: "rgba(26,10,0,0.2)", backdropFilter: "blur(10px)" }}>
        <div className="login-card">
          <div className="login-card-title">Welcome Back</div>
          <div className="login-card-sub">Sign in to your Moi Tech account</div>

          <div className="role-tabs">
            {ROLES.map(([r, label]) => (
              <button
                key={r}
                className={`role-tab ${role === r ? "active" : ""}`}
                onClick={() => handleRoleClick(r)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 24, background: "rgba(200,146,42,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "var(--gold-dark)" }}>
            🔑 Demo: <strong>{ROLE_MAP[role].email}</strong> / <strong>{ROLE_MAP[role].pass}</strong>
          </div>

          <div className="form-group mb-3">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
          </div>
          <div className="form-group mb-4">
            <label>Password</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Enter password" />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={handleLogin}>
            Sign In →
          </button>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--muted)" }}>
            Need an account? Contact <strong style={{ color: "var(--gold-dark)" }}>admin@moitech.in</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
