import { isValidElement, type ComponentType, type ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyProps {
  icon?: ComponentType<{ size?: number }> | ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

export default function Empty({ icon, title, description, children }: EmptyProps) {
  const Icon = icon || Inbox;
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {typeof Icon === "function" ? <Icon size={28} /> : isValidElement(Icon) ? Icon : <Inbox size={28} />}
      </div>
      <div className="empty-title">{title}</div>
      {description && <div className="empty-sub">{description}</div>}
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}
