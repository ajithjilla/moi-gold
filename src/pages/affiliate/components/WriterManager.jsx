import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import { affiliateApi } from "../../../api/client.js";
import Spinner from "../../../components/ui/Spinner.jsx";
import Empty from "../../../components/ui/Empty.jsx";

export default function WriterManager({ eventId }) {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setWriters(await affiliateApi.writers(eventId));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);
  useEffect(() => {
    load();
  }, [load]);

  const addWriter = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Phone is required");
      return;
    }
    setSaving(true);
    try {
      await affiliateApi.assignWriter(eventId, { phone: phone.trim(), name: name.trim() || undefined });
      toast.success("Writer added");
      setPhone("");
      setName("");
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (w) => {
    try {
      await affiliateApi.removeWriter(eventId, w.id);
      toast.success("Writer removed");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div className="section-title">Event writers</div>
        <div className="text-xs text-muted">Writers can record Moi entries on this event.</div>
      </div>

      <form onSubmit={addWriter} className="form-grid" style={{ alignItems: "end" }}>
        <div className="form-group">
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" required />
        </div>
        <div className="form-group">
          <label>Name (if new)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Writer's name" />
        </div>
        <div className="form-group full" style={{ alignSelf: "end" }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            <UserPlus size={16} /> {saving ? "Adding…" : "Add writer"}
          </button>
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : writers.length === 0 ? (
        <Empty title="No writers yet" description="Add a writer by their mobile number." />
      ) : (
        <div className="writers-list" style={{ marginTop: 16 }}>
          {writers.map((w) => (
            <span className="writer-chip" key={w.id}>
              <strong>{w.user?.name || "—"}</strong>
              <span className="writer-chip-phone">{w.user?.phone}</span>
              <button title="Remove" onClick={() => remove(w)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
