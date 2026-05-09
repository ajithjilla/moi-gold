import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useLanguage } from "../context/useLanguage";
import LanguageToggle from "./LanguageToggle";
import { LogOut, Menu, X } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

export interface AppMenuItem {
  to: string;
  label: string;
  icon?: ComponentType<{ size?: number }>;
  end?: boolean;
}

export default function AppLayout({
  menu,
  title,
  subtitle,
  children,
}: {
  menu: AppMenuItem[];
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabel =
    user?.role === "ADMIN"
      ? t("nav.superAdmin")
      : user?.role === "AFFILIATE"
      ? t("nav.affiliate")
      : user?.role === "USER"
      ? t("nav.writer")
      : t("nav.eventOwner");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="topbar-brand">
          <button
            className="icon-btn"
            style={{ display: "none" }}
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            id="sidebar-toggle-btn"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="topbar-logo">M</div>
          <div>
            <div className="topbar-title">{title || t("nav.brandTitle")}</div>
            <div className="topbar-subtitle">{subtitle || t("nav.brandSubtitle")}</div>
          </div>
        </div>
        <div className="topbar-actions">
          <LanguageToggle />
          {user && (
            <div className="topbar-user">
              <div>
                <div className="topbar-user-name">{user.name || user.phone}</div>
                <div className="topbar-user-role">{roleLabel}</div>
              </div>
            </div>
          )}
          <button className="icon-btn" onClick={handleLogout} title={t("nav.logout")}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="layout">
        <aside className={`sidebar${mobileOpen ? " open" : ""}`}>
          <div className="sidebar-section-label">{t("admin.navLabel")}</div>
          {menu?.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon ? <item.icon size={16} /> : null}
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="sidebar-footer">
            <div>{t("nav.brandTitle")}</div>
            <div style={{ marginTop: 4 }}>© {new Date().getFullYear()}</div>
          </div>
        </aside>

        <div
          className={`sidebar-overlay${mobileOpen ? " open" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        <main className="main" key={location.pathname}>
          {children}
        </main>
      </div>

      <style>{`@media (max-width: 760px) { #sidebar-toggle-btn { display: grid !important; } }`}</style>
    </div>
  );
}
