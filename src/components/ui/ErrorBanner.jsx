import { AlertCircle } from "lucide-react";

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      style={{
        background: "var(--danger-bg)",
        border: "1px solid rgba(220, 38, 38, 0.3)",
        color: "var(--danger)",
        padding: "12px 16px",
        borderRadius: 10,
        display: "flex",
        gap: 10,
        alignItems: "center",
        fontSize: 13,
        marginBottom: 16,
      }}
    >
      <AlertCircle size={18} />
      <div style={{ flex: 1 }}>{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: 700 }}
        >
          ×
        </button>
      )}
    </div>
  );
}
