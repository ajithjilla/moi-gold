import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { adminApi } from "../../api/client";
import { useLanguage } from "../../context/useLanguage";
import Spinner from "../../components/ui/Spinner";
import ErrorBanner from "../../components/ui/ErrorBanner";

const KNOWN_KEYS = [
  { key: "app_name", labelKey: "appSettings.appName", type: "text" as const },
  { key: "brand_title", labelKey: "appSettings.brandTitle", type: "text" as const },
  { key: "brand_subtitle", labelKey: "appSettings.brandSub", type: "text" as const },
  { key: "footer_note", labelKey: "appSettings.footerNote", type: "text" as const },
  { key: "support_email", labelKey: "appSettings.supportEmail", type: "email" as const },
  { key: "welcome_message_ta", labelKey: "appSettings.welcomeMsgTa", type: "textarea" as const },
  { key: "currency", labelKey: "appSettings.currency", type: "text" as const },
];

const WA_KEYS = [
  { key: "whatsapp_access_token", labelKey: "appSettings.waToken", type: "password" as const, hintKey: "appSettings.waTokenHint" },
  { key: "whatsapp_phone_number_id", labelKey: "appSettings.waPhoneId", type: "text" as const, hintKey: "appSettings.waPhoneIdHint" },
  { key: "whatsapp_business_number", labelKey: "appSettings.waDisplayNum", type: "text" as const, hintKey: "appSettings.waDisplayNumHint" },
  { key: "whatsapp_msg_template", labelKey: "appSettings.waTemplate", type: "textarea" as const, hintKey: "appSettings.waTemplateHint" },
];

export default function AdminSettings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    adminApi
      .settings()
      .then(setSettings)
      .catch((e) => setErr(e instanceof Error ? e.message : t("common.somethingWrong")))
      .finally(() => setLoading(false));
  }, [t]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminApi.updateSettings(settings);
      setSettings(updated);
      toast.success(t("appSettings.saveSuccess"));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{t("appSettings.title")}</div>
          <div className="page-sub">{t("appSettings.sub")}</div>
        </div>
      </div>
      <ErrorBanner message={err} />

      <form onSubmit={onSave}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="section-title">{t("appSettings.general")}</div>
          </div>
          <div className="form-grid">
            {KNOWN_KEYS.map((k) => (
              <div key={k.key} className={`form-group${k.type === "textarea" ? " full" : ""}`}>
                <label>{t(k.labelKey)}</label>
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
              <div className="section-title">{t("appSettings.waTitle")}</div>
              <div className="text-xs text-muted">{t("appSettings.waHelp")}</div>
            </div>
          </div>
          <div className="form-grid">
            {WA_KEYS.map((k) => (
              <div key={k.key} className={`form-group${k.type === "textarea" ? " full" : ""}`}>
                <label>{t(k.labelKey)}</label>
                {k.type === "textarea" ? (
                  <textarea
                    rows={3}
                    placeholder={t(k.hintKey)}
                    value={settings[k.key] || ""}
                    onChange={(e) => setSettings({ ...settings, [k.key]: e.target.value })}
                  />
                ) : (
                  <input
                    type={k.type}
                    placeholder={t(k.hintKey)}
                    value={settings[k.key] || ""}
                    onChange={(e) => setSettings({ ...settings, [k.key]: e.target.value })}
                  />
                )}
                {k.hintKey && k.type !== "textarea" && (
                  <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                    {t(k.hintKey)}
                  </div>
                )}
              </div>
            ))}
          </div>
          {!settings["whatsapp_msg_template"] && (
            <div className="text-xs text-muted" style={{ padding: "0 20px 14px" }}>
              {t("appSettings.defaultTemplateHint")}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? t("common.saving") : t("appSettings.saveBtn")}
          </button>
        </div>
      </form>
    </div>
  );
}
