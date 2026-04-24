import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { adminApi } from "../../api/client.js";
import Spinner from "../../components/ui/Spinner.jsx";
import ErrorBanner from "../../components/ui/ErrorBanner.jsx";

const KNOWN_KEYS = [
  { key: "app_name", label: "App name", type: "text" },
  { key: "brand_title", label: "Brand title", type: "text" },
  { key: "brand_subtitle", label: "Brand subtitle", type: "text" },
  { key: "footer_note", label: "Footer note", type: "text" },
  { key: "support_email", label: "Support email", type: "email" },
  { key: "whatsapp_api_key", label: "WhatsApp API key (secret)", type: "password" },
  { key: "welcome_message_ta", label: "Welcome message (Tamil)", type: "textarea" },
  { key: "currency", label: "Currency code (e.g. INR)", type: "text" },
];

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [settings, setSettings] = useState({});

  useEffect(() => {
    adminApi
      .settings()
      .then(setSettings)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminApi.updateSettings(settings);
      setSettings(updated);
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">System Settings</div>
          <div className="page-sub">Global configuration for the platform.</div>
        </div>
      </div>
      <ErrorBanner message={err} />

      <form onSubmit={onSave} className="card">
        <div className="form-grid">
          {KNOWN_KEYS.map((k) => (
            <div key={k.key} className={`form-group${k.type === "textarea" ? " full" : ""}`}>
              <label>{k.label}</label>
              {k.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={settings[k.key] || ""}
                  onChange={(e) => setSettings({ ...settings, [k.key]: e.target.value })}
                />
              ) : (
                <input
                  type={k.type}
                  value={settings[k.key] || ""}
                  onChange={(e) => setSettings({ ...settings, [k.key]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
