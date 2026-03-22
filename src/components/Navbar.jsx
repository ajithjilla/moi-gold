const ROLE_LABELS = {
  admin: "Super Admin",
  affiliate: "Affiliate",
  owner: "Event Owner",
};

export default function Navbar({ role, userName, onLogout }) {
  const roleLabel = ROLE_LABELS[role] ?? role;
  return (
    <div className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">M</div>
        <div>
          <div className="navbar-title">Moi Tech</div>
          <div className="navbar-subtitle">மொய் Management System</div>
        </div>
      </div>
      <div className="navbar-user">
        <span className="navbar-badge">{roleLabel}</span>
        <span style={{ color: "var(--cream)", fontSize: 14 }}>{userName}</span>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
