import type { ReactNode } from "react";
import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: ReactNode;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${destructive ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </>
      }
    >
      {message && <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.55 }}>{message}</p>}
    </Modal>
  );
}
