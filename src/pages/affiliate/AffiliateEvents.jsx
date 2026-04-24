import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Gift, CalendarDays, Users, Trash2, Edit2, ArrowRight } from "lucide-react";
import { affiliateApi } from "../../api/client.js";
import { fmt, fmtDate, EVENT_TYPES, statusBadgeClass } from "../../utils/helpers.js";
import Modal from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Empty from "../../components/ui/Empty.jsx";
import ErrorBanner from "../../components/ui/ErrorBanner.jsx";

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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setEvents(await affiliateApi.events());
      setErr("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const submitCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await affiliateApi.createEvent({
        ...form,
        date: new Date(form.date).toISOString(),
      });
      toast.success("Event created");
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      toast.error(e.message);
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
      toast.success("Event updated");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setSaving(true);
    try {
      await affiliateApi.deleteEvent(deleting.id);
      toast.success("Event deleted");
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(e.message);
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
          <div className="page-title">My Events</div>
          <div className="page-sub">Create and manage your events.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> New event
        </button>
      </div>

      <ErrorBanner message={err} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={18} />
          </div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Total events</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={18} />
          </div>
          <div className="stat-value">{totalEntries}</div>
          <div className="stat-label">Total Moi entries</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <Gift size={18} />
          </div>
          <div className="stat-value">{fmt(totalMoi)}</div>
          <div className="stat-label">Collected so far</div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="card">
          <Empty title="No events yet" description="Click ‘New event’ to create your first event.">
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> Create event
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
                <span className="badge badge-neutral">{ev._count?.moi_entries || 0} entries</span>
                <span className="badge badge-neutral">{ev._count?.writers || 0} writers</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Owner: <strong style={{ color: "var(--text)" }}>{ev.owner_name}</strong>{" "}
                {ev.owner_phone && <span>· {ev.owner_phone}</span>}
              </div>
              <div className="modal-footer" style={{ marginTop: 16, paddingTop: 12 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => setEditing({ ...ev, date: ev.date.slice(0, 10) })}>
                  <Edit2 size={14} /> Edit
                </button>
                <button className="btn btn-sm btn-danger-outline" onClick={() => setDeleting(ev)}>
                  <Trash2 size={14} /> Delete
                </button>
                <Link to={`/affiliate/events/${ev.id}`} className="btn btn-sm btn-primary">
                  Open <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => !saving && setCreateOpen(false)}
        title="Create event"
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" form="create-event-form" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create event"}
            </button>
          </>
        }
      >
        <EventForm id="create-event-form" value={form} onChange={setForm} onSubmit={submitCreate} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title="Edit event"
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" form="edit-event-form" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
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
        title="Delete event?"
        destructive
        message={`This will permanently delete "${deleting?.name}" and all its Moi entries. This action cannot be undone.`}
        confirmLabel="Delete event"
      />
    </div>
  );
}

function EventForm({ id, value, onChange, onSubmit, showStatus }) {
  return (
    <form id={id} onSubmit={onSubmit}>
      <div className="section-strip">Event details</div>
      <div className="form-grid">
        <div className="form-group full">
          <label>Event name</label>
          <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value })}>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.emoji} {t.value}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={value.date?.slice?.(0, 10) ?? value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} required />
        </div>
        <div className="form-group full">
          <label>Venue</label>
          <input value={value.venue || ""} onChange={(e) => onChange({ ...value, venue: e.target.value })} />
        </div>
        {showStatus && (
          <div className="form-group">
            <label>Status</label>
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

      <div className="section-strip" style={{ marginTop: 18 }}>Owner details</div>
      <div className="form-grid">
        <div className="form-group">
          <label>Owner name</label>
          <input value={value.owner_name} onChange={(e) => onChange({ ...value, owner_name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Owner phone</label>
          <input value={value.owner_phone || ""} onChange={(e) => onChange({ ...value, owner_phone: e.target.value })} />
        </div>
        <div className="form-group full">
          <label>Owner email (optional)</label>
          <input type="email" value={value.owner_email || ""} onChange={(e) => onChange({ ...value, owner_email: e.target.value })} />
          <div className="form-hint">Used only for notifications, not for login.</div>
        </div>
      </div>
    </form>
  );
}
