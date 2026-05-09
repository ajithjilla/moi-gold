import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Gift, CalendarDays, Users, Trash2, Edit2, ArrowRight } from "lucide-react";
import { affiliateApi } from "../../api/client";
import { fmt, fmtDate, EVENT_TYPES, statusBadgeClass, eventTypeLabel } from "../../utils/helpers";
import { useLanguage } from "../../context/useLanguage";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Empty from "../../components/ui/Empty";
import ErrorBanner from "../../components/ui/ErrorBanner";

const emptyForm = {
  name: "",
  type: "WEDDING",
  date: new Date().toISOString().slice(0, 10),
  venue: "",
  owner_name: "",
  owner_phone: "",
  owner_email: "",
};

export default function AffiliateEvents() {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEvents(await affiliateApi.events());
      setErr("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : t("common.somethingWrong"));
    } finally {
      setLoading(false);
    }
  }, [t]);
  useEffect(() => {
    load();
  }, [load]);

  const submitCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await affiliateApi.createEvent({
        ...form,
        date: new Date(form.date).toISOString(),
      });
      toast.success(t("affiliatePage.toastCreated"));
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await affiliateApi.updateEvent(editing.id, {
        name: editing.name,
        type: editing.type,
        date: new Date(editing.date).toISOString(),
        venue: editing.venue,
        owner_name: editing.owner_name,
        owner_phone: editing.owner_phone || null,
        owner_email: editing.owner_email || null,
        status: editing.status,
      });
      toast.success(t("affiliatePage.toastUpdated"));
      setEditing(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setSaving(true);
    try {
      await affiliateApi.deleteEvent(deleting.id);
      toast.success(t("affiliatePage.toastDeleted"));
      setDeleting(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const totalEntries = events.reduce((s, e) => s + (e._count?.moi_entries || 0), 0);
  const totalMoi = events.reduce((s, e) => s + (e.moi_entries?.reduce((a, m) => a + m.amount, 0) || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{t("affiliate.myEventsTitle")}</div>
          <div className="page-sub">{t("affiliatePage.pageSub")}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> {t("affiliatePage.newEventBtn")}
        </button>
      </div>

      <ErrorBanner message={err} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={18} />
          </div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">{t("affiliatePage.totalEvents")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={18} />
          </div>
          <div className="stat-value">{totalEntries}</div>
          <div className="stat-label">{t("affiliate.statTotalMoiEntries")}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <Gift size={18} />
          </div>
          <div className="stat-value">{fmt(totalMoi)}</div>
          <div className="stat-label">{t("affiliatePage.collectedSoFar")}</div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="card">
          <Empty title={t("affiliatePage.noEventsTitle")} description={t("affiliatePage.noEventsDesc")}>
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> {t("affiliatePage.createEventBtn")}
            </button>
          </Empty>
        </div>
      ) : (
        <div className="grid-2">
          {events.map((ev) => (
            <div key={ev.id} className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{ev.name}</div>
                  <div className="text-xs text-muted">
                    {fmtDate(ev.date)} · {ev.venue || "—"}
                  </div>
                </div>
                <span className={`badge ${statusBadgeClass(ev.status)}`}>{ev.status}</span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <span className="event-badge">{ev.type}</span>
                <span className="badge badge-neutral">
                  {ev._count?.moi_entries || 0} {t("affiliatePage.entries")}
                </span>
                <span className="badge badge-neutral">
                  {ev._count?.writers || 0} {t("affiliatePage.writers")}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {t("affiliatePage.owner")}: <strong style={{ color: "var(--text)" }}>{ev.owner_name}</strong>{" "}
                {ev.owner_phone && <span>· {ev.owner_phone}</span>}
              </div>
              <div className="modal-footer" style={{ marginTop: 16, paddingTop: 12 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => setEditing({ ...ev, date: ev.date.slice(0, 10) })}>
                  <Edit2 size={14} /> {t("common.edit")}
                </button>
                <button className="btn btn-sm btn-danger-outline" onClick={() => setDeleting(ev)}>
                  <Trash2 size={14} /> {t("common.delete")}
                </button>
                <Link to={`/affiliate/events/${ev.id}`} className="btn btn-sm btn-primary">
                  {t("affiliatePage.open")} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => !saving && setCreateOpen(false)}
        title={t("affiliatePage.createModalTitle")}
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setCreateOpen(false)} disabled={saving}>
              {t("common.cancel")}
            </button>
            <button className="btn btn-primary" form="create-event-form" type="submit" disabled={saving}>
              {saving ? t("common.saving") : t("affiliatePage.createEventBtn")}
            </button>
          </>
        }
      >
        <EventForm id="create-event-form" value={form} onChange={setForm} onSubmit={submitCreate} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title={t("affiliatePage.editModalTitle")}
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)} disabled={saving}>
              {t("common.cancel")}
            </button>
            <button className="btn btn-primary" form="edit-event-form" type="submit" disabled={saving}>
              {saving ? t("common.saving") : t("affiliatePage.saveChanges")}
            </button>
          </>
        }
      >
        {editing && <EventForm id="edit-event-form" value={editing} onChange={setEditing} onSubmit={submitEdit} showStatus />}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => !saving && setDeleting(null)}
        onConfirm={doDelete}
        loading={saving}
        title={t("affiliatePage.deleteTitle")}
        destructive
        message={t("affiliatePage.deleteMsg").replace("{name}", deleting?.name || "")}
        confirmLabel={t("affiliatePage.deleteConfirm")}
      />
    </div>
  );
}

function EventForm({
  id,
  value,
  onChange,
  onSubmit,
  showStatus = false,
}: {
  id: string;
  value: any;
  onChange: (_next: any) => void;
  onSubmit: (_e: FormEvent<HTMLFormElement>) => void;
  showStatus?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <form id={id} onSubmit={onSubmit}>
      <div className="section-strip">{t("affiliatePage.eventDetails")}</div>
      <div className="form-grid">
        <div className="form-group full">
          <label>{t("affiliatePage.eventName")}</label>
          <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>{t("affiliatePage.type")}</label>
          <select value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value })}>
            {EVENT_TYPES.map((et) => (
              <option key={et.value} value={et.value}>
                {eventTypeLabel(et.value, t)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>{t("affiliatePage.date")}</label>
          <input
            type="date"
            value={value.date?.slice?.(0, 10) ?? value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            required
          />
        </div>
        <div className="form-group full">
          <label>{t("affiliatePage.venue")}</label>
          <input value={value.venue || ""} onChange={(e) => onChange({ ...value, venue: e.target.value })} />
        </div>
        {showStatus && (
          <div className="form-group">
            <label>{t("affiliatePage.status")}</label>
            <select value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value })}>
              {["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="section-strip" style={{ marginTop: 18 }}>
        {t("affiliatePage.ownerDetails")}
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>{t("affiliatePage.ownerName")}</label>
          <input
            value={value.owner_name}
            onChange={(e) => onChange({ ...value, owner_name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("affiliatePage.ownerPhone")}</label>
          <input
            value={value.owner_phone || ""}
            onChange={(e) => onChange({ ...value, owner_phone: e.target.value })}
          />
        </div>
        <div className="form-group full">
          <label>{t("affiliatePage.ownerEmailOpt")}</label>
          <input
            type="email"
            value={value.owner_email || ""}
            onChange={(e) => onChange({ ...value, owner_email: e.target.value })}
          />
          <div className="form-hint">{t("affiliatePage.ownerEmailHint")}</div>
        </div>
      </div>
    </form>
  );
}
