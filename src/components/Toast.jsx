import { useEffect } from "react";

export default function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="toast">
      ✅ {msg}
    </div>
  );
}
