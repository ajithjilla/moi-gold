import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { adminApi } from "../../api/client";
import Spinner from "../../components/ui/Spinner";
import ErrorBanner from "../../components/ui/ErrorBanner";

const KNOWN_KEYS = [
  { key: "app_name", label: "App name", type: "text" },
  { key: "brand_title", label: "Brand title", type: "text" },
  { key: "brand_subtitle", label: "Brand subtitle", type: "text" },
  { key: "footer_note", label: "Footer note", type: "text" },
  { key: "support_email", label: "Support email", type: "email" },
  { key: "welcome_message_ta", label: "Welcome message (Tamil)", type: "textarea" },
  { key: "currency", label: "Currency code (e.g. INR)", type: "text" },
];

const WA_KEYS = [
  { key: "whatsapp_access_token", label: "WhatsApp Access Token", type: "password", hint: "Meta Cloud API permanent token" },
  { key: "whatsapp_phone_number_id", label: "Phone Number ID", type: "text", hint: "From Meta Business → WhatsApp → API Setup" },
  { key: "whatsapp_business_number", label: "Business Display Number", type: "text", hint: "e.g. +91 98765 43210 (for reference only)" },
  { key: "whatsapp_msg_template", label: "Message template", type: "textarea", hint: "Use {giver}, {amount}, {event} as placeholders" },
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
      .catch((e) => setErr(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminApi.updateSettings(settings);
      setSettings(updated);
      toast.success("Settings saved");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
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

      <form onSubmit={onSave}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="section-title">General</div>
          </div>
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
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div>
              <div className="section-title">WhatsApp Business API</div>
              <div className="text-xs text-muted">
                Configure your Meta WhatsApp Cloud API credentials so Moi thank-you messages are sent from your business number.
              </div>
            </div>
          </div>
          <div className="form-grid">
            {WA_KEYS.map((k) => (
              <div key={k.key} className={`form-group${k.type === "textarea" ? " full" : ""}`}>
                <label>{k.label}</label>
                {k.type === "textarea" ? (
                  <textarea
                    rows={3}
                    placeholder={k.hint}
                    value={settings[k.key] || ""}
                    onChange={(e) => setSettings({ ...settings, [k.key]: e.target.value })}
                  />
                ) : (
                  <input
                    type={k.type}
                    placeholder={k.hint}
                    value={settings[k.key] || ""}
                    onChange={(e) => setSettings({ ...settings, [k.key]: e.target.value })}
                  />
                )}
                {k.hint && k.type !== "textarea" && (
                  <div className="text-xs text-muted" style={{ marginTop: 2 }}>{k.hint}</div>
                )}
              </div>
            ))}
          </div>
          {!settings["whatsapp_msg_template"] && (
            <div className="text-xs text-muted" style={{ padding: "0 20px 14px" }}>
              Default message: "Vanakkam {"{giver}"}, Thank you for your generous gift of {"{amount}"} at "{"{event}"}". Your support means a lot to us! — Moi Tech"
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
