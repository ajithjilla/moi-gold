import { Inbox } from "lucide-react";

export default function Empty({ icon, title, description, children }) {
  const Icon = icon || Inbox;
  return (
    <div className="empty-state">
      <div className="empty-icon">{typeof Icon === "function" ? <Icon size={28} /> : Icon}</div>
      <div className="empty-title">{title}</div>
      {description && <div className="empty-sub">{description}</div>}
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}
