import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
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
import { useLanguage } from "../../context/useLanguage";
import type { Settlement } from "../../types/domain";

export default function EventDetail() {
  const { t } = useLanguage();
  const { eventId } = useParams();
  const navigate = useNavigate();

  const TABS = useMemo(
    () =>
      [
        { id: "entries" as const, label: t("eventDetail.moiTab"), icon: Gift },
        { id: "writers" as const, label: t("eventDetail.writersTab"), icon: Users },
        { id: "settlement" as const, label: t("eventDetail.settleTab"), icon: Calculator },
      ] as { id: "entries" | "writers" | "settlement"; label: string; icon: ComponentType<{ size?: number }> }[],
    [t]
  );

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
      setErr(e instanceof Error ? e.message : t("common.somethingWrong"));
    } finally {
      setLoading(false);
    }
  }, [eventId, t]);
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
      toast.success(t("eventDetail.toastEntryAdded"));
      setAddOpen(false);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    } finally {
      setSaving(false);
    }
  };

  const updateEntry = async (payload) => {
    setSaving(true);
    try {
      await moiApi.update(eventId, editing.id, payload);
      toast.success(t("eventDetail.toastEntryUpdated"));
      setEditing(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    } finally {
      setSaving(false);
    }
  };

  const voidEntry = async () => {
    setSaving(true);
    try {
      await moiApi.void(eventId, voiding.id);
      toast.success(t("eventDetail.toastEntryVoided"));
      setVoiding(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    } finally {
      setSaving(false);
    }
  };

  const restoreEntry = async (entry) => {
    try {
      await moiApi.restore(eventId, entry.id);
      toast.success(t("eventDetail.toastEntryRestored"));
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    }
  };

  const hardDelete = async () => {
    setSaving(true);
    try {
      await moiApi.remove(eventId, deleting.id);
      toast.success(t("eventDetail.toastEntryDeleted"));
      setDeleting(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    } finally {
      setSaving(false);
    }
  };

  const toggleShare = async (enabled) => {
    try {
      const res = await affiliateApi.toggleShare(eventId, enabled);
      setEvent((ev) => ({ ...ev, share_enabled: res.share_enabled, share_token: res.share_token }));
      toast.success(enabled ? t("eventDetail.toastPublicOn") : t("eventDetail.toastPublicOff"));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    }
  };

  const regenShare = async () => {
    try {
      const res = await affiliateApi.regenerateShare(eventId);
      setEvent((ev) => ({ ...ev, share_token: res.share_token }));
      toast.success(t("eventDetail.toastShareRegen"));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    }
  };

  const toggleWriters = async (enabled) => {
    try {
      await affiliateApi.toggleWriterAccess(eventId, enabled);
      setEvent((ev) => ({ ...ev, writer_access_enabled: enabled }));
      toast.success(enabled ? t("eventDetail.toastWriterOn") : t("eventDetail.toastWriterOff"));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
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
      toast.error(e instanceof Error ? e.message : t("common.somethingWrong"));
    }
  };

  const copyShareLink = () => {
    if (!event?.share_token) return;
    const url = `${window.location.origin}/share/${event.share_token}`;
    navigator.clipboard.writeText(url);
    toast.success(t("eventDetail.shareCopied"));
  };

  const [sendingWa, setSendingWa] = useState<string | null>(null);
  const sendWhatsApp = async (entryId: string, _giverName: string) => {
    setSendingWa(entryId);
    try {
      const res = await moiApi.sendWhatsApp(eventId, entryId);
      toast.success(res.message);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("eventDetail.whatsappFailed"));
    } finally {
      setSendingWa(null);
    }
  };

  if (loading) return <Spinner />;
  if (!event) return <ErrorBanner message={err || t("eventDetail.eventNotFound")} />;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/affiliate")}>
            <ArrowLeft size={14} /> {t("eventDetail.back")}
          </button>
          <div className="page-title" style={{ marginTop: 8 }}>{event.name}</div>
          <div className="page-sub">
            {fmtDate(event.date)} · {event.venue || "—"} ·{" "}
            {t("eventDetail.ownerLabel").replace("{name}", event.owner_name)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={exportCsv}>
            <FileSpreadsheet size={14} /> {t("eventDetail.exportCsv")}
          </button>
          <button className="btn btn-outline" onClick={() => window.print()}>
            <Printer size={14} /> {t("eventDetail.print")}
          </button>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> {t("eventDetail.addMoi")}
          </button>
        </div>
      </div>

      <ErrorBanner message={err} onDismiss={() => setErr("")} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t("eventDetail.totalEntries")}</div>
          <div className="stat-value">{totals.count}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">{t("eventDetail.totalMoi")}</div>
          <div className="stat-value">{fmt(totals.total)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("eventDetail.avgPerEntry")}</div>
          <div className="stat-value">{fmt(totals.avg)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="section-title">{t("eventDetail.accessSharing")}</div>
            <div className="text-xs text-muted">{t("eventDetail.accessHelp")}</div>
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
              <div style={{ fontWeight: 700, fontSize: 13 }}>{t("eventDetail.writerRecord")}</div>
              <div className="text-xs text-muted">
                {event.writer_access_enabled ? t("eventDetail.writerRecordOn") : t("eventDetail.writerRecordOff")}
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
                <div style={{ fontWeight: 700, fontSize: 13 }}>{t("eventDetail.publicLink")}</div>
                <div className="text-xs text-muted">{t("eventDetail.publicLinkHelp")}</div>
              </div>
              <Toggle checked={event.share_enabled} onChange={toggleShare} />
            </div>
            {event.share_enabled && event.share_token && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button className="btn btn-sm btn-outline" onClick={copyShareLink}>
                  <Link2 size={12} /> {t("eventDetail.copyLink")}
                </button>
                <button className="btn btn-sm btn-ghost" onClick={regenShare}>
                  <RefreshCw size={12} /> {t("eventDetail.regenerate")}
                </button>
                <Link className="btn btn-sm btn-ghost" to={`/share/${event.share_token}`} target="_blank" rel="noreferrer">
                  {t("eventDetail.open")}
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
                    placeholder={t("eventDetail.searchPlaceholder")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={showVoided} onChange={(e) => setShowVoided(e.target.checked)} />
                  {t("eventDetail.showVoided")}
                </label>
              </div>

              {visibleEntries.length === 0 ? (
                <Empty title={t("eventDetail.emptyNoEntries")} description={t("eventDetail.emptyNoEntriesDesc")} />
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t("eventDetail.giver")}</th>
                        <th>{t("eventDetail.phone")}</th>
                        <th>{t("eventDetail.thRelation")}</th>
                        <th>{t("affiliate.thMethod")}</th>
                        <th>{t("eventDetail.thWriter")}</th>
                        <th>{t("eventDetail.when")}</th>
                        <th className="num">{t("affiliate.thAmount")}</th>
                        <th className="num">{t("common.actions")}</th>
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
                                  <button
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => setEditing(e)}
                                    title={t("eventDetail.editTooltip")}
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => setVoiding(e)}
                                    title={t("eventDetail.voidTooltip")}
                                  >
                                    <Ban size={12} />
                                  </button>
                                </>
                              )}
                              {e.voided && (
                                <button
                                  className="btn btn-sm btn-ghost"
                                  onClick={() => restoreEntry(e)}
                                  title={t("eventDetail.restoreTooltip")}
                                >
                                  <Undo2 size={12} />
                                </button>
                              )}
                              {e.phone && (
                                <button
                                  className="btn btn-sm btn-ghost"
                                  onClick={() => sendWhatsApp(e.id, e.giver_name)}
                                  disabled={sendingWa === e.id}
                                  title={t("eventDetail.sendWhatsapp").replace("{name}", e.giver_name)}
                                  style={{ color: "#25D366" }}
                                >
                                  <MessageCircle size={12} />
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-danger-outline"
                                onClick={() => setDeleting(e)}
                                title={t("eventDetail.deleteTooltip")}
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
        title={t("eventDetail.addModalTitle")}
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddOpen(false)} disabled={saving}>
              {t("common.cancel")}
            </button>
            <button className="btn btn-primary" form="moi-form-add" type="submit" disabled={saving}>
              {saving ? t("eventDetail.saving") : t("eventDetail.addEntryBtn")}
            </button>
          </>
        }
      >
        <MoiEntryForm id="moi-form-add" onSubmit={addEntry} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title={t("eventDetail.editModalTitle")}
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)} disabled={saving}>
              {t("common.cancel")}
            </button>
            <button className="btn btn-primary" form="moi-form-edit" type="submit" disabled={saving}>
              {saving ? t("eventDetail.saving") : t("eventDetail.saveEntry")}
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
        title={t("eventDetail.voidTitle")}
        message={t("eventDetail.voidMsg")}
        confirmLabel={t("eventDetail.voidButton")}
        destructive
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => !saving && setDeleting(null)}
        onConfirm={hardDelete}
        loading={saving}
        title={t("eventDetail.deletePermanentTitle")}
        message={t("eventDetail.deletePermanentMsg")}
        confirmLabel={t("common.delete")}
        destructive
      />
    </div>
  );
}

function SettlementPanel({ eventId }: { eventId: string }) {
  const { t } = useLanguage();
  const [data, setData] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    reportsApi
      .settlement(eventId)
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : t("common.somethingWrong")))
      .finally(() => setLoading(false));
  }, [eventId, t]);

  if (loading) return <Spinner />;
  if (err) return <ErrorBanner message={err} />;
  if (!data) return null;

  const subLine = t("settlement.subLine")
    .replace("{total}", String(data.totalEntries))
    .replace("{cash}", String(data.cashCount))
    .replace("{digital}", String(data.digitalCount));

  return (
    <div>
      <div className="settle-hero">
        <div className="settle-hero-label">{t("settlement.heroGrand")}</div>
        <div className="settle-hero-amount">{fmt(data.grandTotal)}</div>
        <div className="settle-hero-sub">{subLine}</div>
      </div>

      <div className="settlement-grid" style={{ marginTop: 16 }}>
        <div className="settlement-card">
          <div className="settlement-card-label">{t("settlement.cashInHand")}</div>
          <div className="settlement-card-amount">{fmt(data.cashTotal)}</div>
          <div className="settlement-card-sub">{t("settlement.cardEntries").replace("{n}", String(data.cashCount))}</div>
        </div>
        <div className="settlement-card">
          <div className="settlement-card-label">{t("settlement.inAccount")}</div>
          <div className="settlement-card-amount">{fmt(data.digitalTotal)}</div>
          <div className="settlement-card-sub">{t("settlement.cardEntries").replace("{n}", String(data.digitalCount))}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div>
          <div className="section-strip">{t("settlement.methodBreakdown")}</div>
          {Object.keys(data.methodBreakdown).length === 0 ? (
            <div className="empty-sub" style={{ padding: 12 }}>
              {t("settlement.noDigitalYet")}
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
          <div className="section-strip">{t("settlement.denomSection")}</div>
          {Object.keys(data.denomBreakdown).length === 0 ? (
            <div className="empty-sub" style={{ padding: 12 }}>
              {t("settlement.noDenomYet")}
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
            <span>{t("settlement.cashTotalBar")}</span>
            <span>{fmt(data.cashTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
