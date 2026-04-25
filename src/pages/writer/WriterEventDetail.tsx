import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit2, Search, MessageCircle } from "lucide-react";
import { writerApi, moiApi } from "../../api/client";
import { fmt, fmtDate, fmtDateTime } from "../../utils/helpers";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import Empty from "../../components/ui/Empty";
import ErrorBanner from "../../components/ui/ErrorBanner";
import MoiEntryForm from "../affiliate/components/MoiEntryForm";
import { useLanguage } from "../../context/useLanguage";

export default function WriterEventDetail() {
  const { t } = useLanguage();
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ev, st, m] = await Promise.all([writerApi.event(eventId), writerApi.stats(eventId), moiApi.list(eventId)]);
      setEvent(ev);
      setStats(st);
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

  const add = async (payload) => {
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

  const update = async (payload) => {
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

  const [sendingWa, setSendingWa] = useState<string | null>(null);
  const sendWhatsApp = async (entryId: string, _giverName: string) => {
    setSendingWa(entryId);
    try {
      const res = await moiApi.sendWhatsApp(eventId, entryId);
      toast.success(res.message);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("writerEvent.whatsappFailed"));
    } finally {
      setSendingWa(null);
    }
  };

  if (loading) return <Spinner />;
  if (!event) return <ErrorBanner message={err || t("eventDetail.eventNotFound")} />;

  const filtered = entries.filter(
    (e) =>
      !query ||
      e.giver_name?.toLowerCase().includes(query.toLowerCase()) ||
      e.phone?.includes(query)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/writer")}>
            <ArrowLeft size={14} /> {t("eventDetail.back")}
          </button>
          <div className="page-title" style={{ marginTop: 8 }}>{event.name}</div>
          <div className="page-sub">
            {fmtDate(event.date)} · {event.venue || "—"}
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setAddOpen(true)}
          disabled={!event.writer_access_enabled}
        >
          <Plus size={14} /> {t("writerEvent.addMoi")}
        </button>
      </div>

      {!event.writer_access_enabled && <ErrorBanner message={t("writerEvent.disabledBanner")} />}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t("writerEvent.myEntries")}</div>
          <div className="stat-value">{stats?.myCount || 0}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">{t("writerEvent.myTotal")}</div>
          <div className="stat-value">{fmt(stats?.myTotal || 0)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="section-title">{t("writerEvent.listTitle")}</div>
            <div className="text-xs text-muted">{t("writerEvent.listHelp")}</div>
          </div>
          <div className="search-input" style={{ maxWidth: 280 }}>
            <Search size={16} />
            <input
              className="input"
              placeholder={t("writerEvent.searchPh")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <Empty title={t("writerEvent.noEntries")} description={t("writerEvent.noEntriesHelp")} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("affiliate.thHash")}</th>
                  <th>{t("eventDetail.giver")}</th>
                  <th>{t("eventDetail.phone")}</th>
                  <th>{t("affiliate.thMethod")}</th>
                  <th>{t("eventDetail.when")}</th>
                  <th className="num">{t("affiliate.thAmount")}</th>
                  <th className="num">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{e.giver_name}</div>
                      {e.relation && <div className="text-xs text-muted">{e.relation}</div>}
                    </td>
                    <td>{e.phone || "—"}</td>
                    <td>
                      <span className="badge badge-neutral">{e.method}</span>
                    </td>
                    <td className="text-xs">{fmtDateTime(e.created_at)}</td>
                    <td className="num">
                      <span className="amount-tag">{fmt(e.amount)}</span>
                    </td>
                    <td className="num">
                      <div style={{ display: "inline-flex", gap: 4 }}>
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
                          className="btn btn-sm btn-ghost"
                          onClick={() => setEditing(e)}
                          disabled={!event.writer_access_enabled || e.voided}
                          title={
                            !event.writer_access_enabled
                              ? t("writerEvent.accessDisabled")
                              : t("eventDetail.editTooltip")
                          }
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        title={t("writerEvent.addModal")}
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddOpen(false)} disabled={saving}>
              {t("common.cancel")}
            </button>
            <button className="btn btn-primary" form="writer-moi-add" type="submit" disabled={saving}>
              {saving ? t("writerEvent.saving") : t("writerEvent.saveBtn")}
            </button>
          </>
        }
      >
        <MoiEntryForm id="writer-moi-add" onSubmit={add} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title={t("writerEvent.editModal")}
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)} disabled={saving}>
              {t("common.cancel")}
            </button>
            <button className="btn btn-primary" form="writer-moi-edit" type="submit" disabled={saving}>
              {saving ? t("writerEvent.saving") : t("eventDetail.saveEntry")}
            </button>
          </>
        }
      >
        {editing && <MoiEntryForm id="writer-moi-edit" value={editing} onSubmit={update} />}
      </Modal>
    </div>
  );
}
