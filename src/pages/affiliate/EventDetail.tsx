import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Search,
  Link2,
  RefreshCw,
  Users,
  Gift,
  Calculator,
  Edit2,
  Ban,
  Undo2,
  Trash2,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { affiliateApi, moiApi, reportsApi } from "../../api/client";
import { fmt, fmtDate, fmtDateTime } from "../../utils/helpers";
import { MessageCircle } from "lucide-react";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Empty from "../../components/ui/Empty";
import ErrorBanner from "../../components/ui/ErrorBanner";
import Toggle from "../../components/ui/Toggle";
import MoiEntryForm from "./components/MoiEntryForm";
import WriterManager from "./components/WriterManager";
import type { Settlement } from "../../types/domain";

const TABS = [
  { id: "entries", label: "Moi entries", icon: Gift },
  { id: "writers", label: "Writers", icon: Users },
  { id: "settlement", label: "Settlement", icon: Calculator },
];

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [tab, setTab] = useState("entries");
  const [query, setQuery] = useState("");
  const [showVoided, setShowVoided] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [voiding, setVoiding] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ev, m] = await Promise.all([affiliateApi.event(eventId), moiApi.list(eventId)]);
      setEvent(ev);
      setEntries(m.entries || []);
      setErr("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [eventId]);
  useEffect(() => {
    load();
  }, [load]);

  const visibleEntries = useMemo(() => {
    let list = entries;
    if (!showVoided) list = list.filter((e) => !e.voided);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.giver_name?.toLowerCase().includes(q) ||
          e.phone?.includes(q) ||
          e.address?.toLowerCase().includes(q) ||
          e.relation?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, query, showVoided]);

  const totals = useMemo(() => {
    const active = entries.filter((e) => !e.voided);
    return {
      count: active.length,
      total: active.reduce((s, e) => s + e.amount, 0),
      avg: active.length ? Math.round(active.reduce((s, e) => s + e.amount, 0) / active.length) : 0,
    };
  }, [entries]);

  const addEntry = async (payload) => {
    setSaving(true);
    try {
      await moiApi.create(eventId, payload);
      toast.success("Entry added");
      setAddOpen(false);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const updateEntry = async (payload) => {
    setSaving(true);
    try {
      await moiApi.update(eventId, editing.id, payload);
      toast.success("Entry updated");
      setEditing(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const voidEntry = async () => {
    setSaving(true);
    try {
      await moiApi.void(eventId, voiding.id);
      toast.success("Entry voided");
      setVoiding(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const restoreEntry = async (entry) => {
    try {
      await moiApi.restore(eventId, entry.id);
      toast.success("Entry restored");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const hardDelete = async () => {
    setSaving(true);
    try {
      await moiApi.remove(eventId, deleting.id);
      toast.success("Entry deleted");
      setDeleting(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const toggleShare = async (enabled) => {
    try {
      const res = await affiliateApi.toggleShare(eventId, enabled);
      setEvent((ev) => ({ ...ev, share_enabled: res.share_enabled, share_token: res.share_token }));
      toast.success(enabled ? "Public sharing enabled" : "Public sharing disabled");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const regenShare = async () => {
    try {
      const res = await affiliateApi.regenerateShare(eventId);
      setEvent((ev) => ({ ...ev, share_token: res.share_token }));
      toast.success("Share link regenerated");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const toggleWriters = async (enabled) => {
    try {
      await affiliateApi.toggleWriterAccess(eventId, enabled);
      setEvent((ev) => ({ ...ev, writer_access_enabled: enabled }));
      toast.success(enabled ? "Writer access enabled" : "Writer access disabled");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const exportCsv = async () => {
    try {
      const blob = await reportsApi.downloadCsv(eventId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moi-${event?.name?.replace(/[^a-z0-9]+/gi, "-") || "export"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const copyShareLink = () => {
    if (!event?.share_token) return;
    const url = `${window.location.origin}/share/${event.share_token}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  };

  const [sendingWa, setSendingWa] = useState<string | null>(null);
  const sendWhatsApp = async (entryId: string, giverName: string) => {
    setSendingWa(entryId);
    try {
      const res = await moiApi.sendWhatsApp(eventId, entryId);
      toast.success(res.message);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to send WhatsApp message");
    } finally {
      setSendingWa(null);
    }
  };

  if (loading) return <Spinner />;
  if (!event) return <ErrorBanner message={err || "Event not found"} />;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/affiliate")}>
            <ArrowLeft size={14} /> Back
          </button>
          <div className="page-title" style={{ marginTop: 8 }}>{event.name}</div>
          <div className="page-sub">
            {fmtDate(event.date)} · {event.venue || "—"} · Owner: {event.owner_name}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={exportCsv}>
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          <button className="btn btn-outline" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add Moi
          </button>
        </div>
      </div>

      <ErrorBanner message={err} onDismiss={() => setErr("")} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total entries</div>
          <div className="stat-value">{totals.count}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Total Moi</div>
          <div className="stat-value">{fmt(totals.total)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average / entry</div>
          <div className="stat-value">{fmt(totals.avg)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="section-title">Access & Sharing</div>
            <div className="text-xs text-muted">Control writer recording and the owner's public view.</div>
          </div>
        </div>
        <div className="grid-2">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 14,
              background: "var(--surface-alt)",
              borderRadius: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Writer recording</div>
              <div className="text-xs text-muted">
                Writers {event.writer_access_enabled ? "can" : "cannot"} add entries right now.
              </div>
            </div>
            <Toggle checked={event.writer_access_enabled} onChange={toggleWriters} />
          </div>

          <div
            style={{
              padding: 14,
              background: "var(--surface-alt)",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Owner public link</div>
                <div className="text-xs text-muted">Share a view-only URL with the event owner.</div>
              </div>
              <Toggle checked={event.share_enabled} onChange={toggleShare} />
            </div>
            {event.share_enabled && event.share_token && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button className="btn btn-sm btn-outline" onClick={copyShareLink}>
                  <Link2 size={12} /> Copy link
                </button>
                <button className="btn btn-sm btn-ghost" onClick={regenShare}>
                  <RefreshCw size={12} /> Regenerate
                </button>
                <Link className="btn btn-sm btn-ghost" to={`/share/${event.share_token}`} target="_blank" rel="noreferrer">
                  Open
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)" }}>
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              style={{
                flex: 1,
                padding: "14px 18px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                color: tab === tb.id ? "var(--crimson)" : "var(--text-muted)",
                borderBottom: tab === tb.id ? "3px solid var(--crimson)" : "3px solid transparent",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
              <tb.icon size={14} /> {tb.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {tab === "entries" && (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <div className="search-input" style={{ flex: 1, minWidth: 220 }}>
                  <Search size={16} />
                  <input
                    className="input"
                    placeholder="Search by name, phone, relation…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={showVoided} onChange={(e) => setShowVoided(e.target.checked)} />
                  Show voided
                </label>
              </div>

              {visibleEntries.length === 0 ? (
                <Empty title="No entries yet" description="Click ‘Add Moi’ to record the first entry." />
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Giver</th>
                        <th>Phone</th>
                        <th>Relation</th>
                        <th>Method</th>
                        <th>Writer</th>
                        <th>When</th>
                        <th className="num">Amount</th>
                        <th className="num">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleEntries.map((e, i) => (
                        <tr key={e.id} className={e.voided ? "voided" : ""}>
                          <td>{i + 1}</td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{e.giver_name}</div>
                            {e.address && <div className="text-xs text-muted">{e.address}</div>}
                            {e.note && <div className="text-xs text-muted">📝 {e.note}</div>}
                          </td>
                          <td>{e.phone || "—"}</td>
                          <td>{e.relation || "—"}</td>
                          <td>
                            <span className="badge badge-neutral">{e.method}</span>
                          </td>
                          <td>{e.written_by?.name || "—"}</td>
                          <td className="text-xs">{fmtDateTime(e.created_at)}</td>
                          <td className="num">
                            <span className="amount-tag">{fmt(e.amount)}</span>
                          </td>
                          <td className="num">
                            <div style={{ display: "inline-flex", gap: 4 }}>
                              {!e.voided && (
                                <>
                                  <button className="btn btn-sm btn-ghost" onClick={() => setEditing(e)} title="Edit">
                                    <Edit2 size={12} />
                                  </button>
                                  <button className="btn btn-sm btn-ghost" onClick={() => setVoiding(e)} title="Void">
                                    <Ban size={12} />
                                  </button>
                                </>
                              )}
                              {e.voided && (
                                <button className="btn btn-sm btn-ghost" onClick={() => restoreEntry(e)} title="Restore">
                                  <Undo2 size={12} />
                                </button>
                              )}
                              {e.phone && (
                                <button
                                  className="btn btn-sm btn-ghost"
                                  onClick={() => sendWhatsApp(e.id, e.giver_name)}
                                  disabled={sendingWa === e.id}
                                  title={`Send WhatsApp to ${e.giver_name}`}
                                  style={{ color: "#25D366" }}
                                >
                                  <MessageCircle size={12} />
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-danger-outline"
                                onClick={() => setDeleting(e)}
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {tab === "writers" && <WriterManager eventId={eventId} />}

          {tab === "settlement" && <SettlementPanel eventId={eventId} />}
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        title="Add Moi entry"
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" form="moi-form-add" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Add entry"}
            </button>
          </>
        }
      >
        <MoiEntryForm id="moi-form-add" onSubmit={addEntry} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title="Edit Moi entry"
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" form="moi-form-edit" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        {editing && <MoiEntryForm id="moi-form-edit" value={editing} onSubmit={updateEntry} />}
      </Modal>

      <ConfirmDialog
        open={!!voiding}
        onClose={() => !saving && setVoiding(null)}
        onConfirm={voidEntry}
        loading={saving}
        title="Void this entry?"
        message="It will be excluded from totals but kept for audit. You can restore it later."
        confirmLabel="Void"
        destructive
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => !saving && setDeleting(null)}
        onConfirm={hardDelete}
        loading={saving}
        title="Delete permanently?"
        message="This entry will be removed forever. Consider voiding instead if you may need to restore it."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}

function SettlementPanel({ eventId }) {
  const [data, setData] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    reportsApi
      .settlement(eventId)
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <Spinner />;
  if (err) return <ErrorBanner message={err} />;
  if (!data) return null;

  return (
    <div>
      <div className="settle-hero">
        <div className="settle-hero-label">Grand total</div>
        <div className="settle-hero-amount">{fmt(data.grandTotal)}</div>
        <div className="settle-hero-sub">
          {data.totalEntries} entries · {data.cashCount} cash · {data.digitalCount} digital
        </div>
      </div>

      <div className="settlement-grid" style={{ marginTop: 16 }}>
        <div className="settlement-card">
          <div className="settlement-card-label">Cash in hand</div>
          <div className="settlement-card-amount">{fmt(data.cashTotal)}</div>
          <div className="settlement-card-sub">{data.cashCount} entries</div>
        </div>
        <div className="settlement-card">
          <div className="settlement-card-label">In account</div>
          <div className="settlement-card-amount">{fmt(data.digitalTotal)}</div>
          <div className="settlement-card-sub">{data.digitalCount} entries</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div>
          <div className="section-strip">Method breakdown</div>
          {Object.keys(data.methodBreakdown).length === 0 ? (
            <div className="empty-sub" style={{ padding: 12 }}>
              No digital entries yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {Object.entries(data.methodBreakdown).map(([m, v]) => (
                <div
                  key={m}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "var(--surface-alt)",
                    borderRadius: 10,
                  }}
                >
                  <div>
                    <strong>{m}</strong>{" "}
                    <span className="text-xs text-muted">({v.count})</span>
                  </div>
                  <div className="amount-tag">{fmt(v.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="section-strip">Cash denominations</div>
          {Object.keys(data.denomBreakdown).length === 0 ? (
            <div className="empty-sub" style={{ padding: 12 }}>
              No denomination info recorded.
            </div>
          ) : (
            <div className="denom-grid">
              {Object.entries(data.denomBreakdown)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([d, qty]) => (
                  <div key={d} className="denom-row">
                    <span className="denom-label">₹{d}</span>
                    <span>× {qty}</span>
                    <span className="denom-sub">{fmt(Number(d) * qty)}</span>
                  </div>
                ))}
            </div>
          )}
          <div className="denom-total-bar" style={{ marginTop: 10 }}>
            <span>Cash total</span>
            <span>{fmt(data.cashTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
