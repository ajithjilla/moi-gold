import { useState, useEffect } from "react";
import { writerApi, moiApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/useLanguage.js";

const EVENT_TYPE_EMOJI = {
  WEDDING: "💍", ENGAGEMENT: "💑", EAR: "💎",
  CRADLE: "🍼", HOUSEWARMING: "🏠", BIRTHDAY: "🎂",
};

const PAYMENT_METHODS = ["CASH", "GPAY", "PHONEPE", "PAYTM", "NEFT", "CHEQUE"];
const RELATIONS = ["Uncle", "Aunt", "Friend", "Colleague", "Neighbor", "Relative", "Brother", "Sister", "Other"];
const DENOMS = [500, 200, 100, 50, 20, 10, 5, 2, 1];
const emptyDenoms = () => Object.fromEntries(DENOMS.map((d) => [String(d), 0]));
const denomSum = (d) => DENOMS.reduce((s, k) => s + k * (d?.[String(k)] || 0), 0);
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const blankEntry = () => ({
  giver_name: "", amount: "", phone: "", address: "",
  relation: RELATIONS[0], method: "CASH", note: "",
  denoms: emptyDenoms(),
});

export default function WriterView() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankEntry());
  const [showDenoms, setShowDenoms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    writerApi.events()
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingEvents(false));
  }, []);

  const openEvent = async (ev) => {
    setSelectedEvent(ev);
    setLoadingEntries(true);
    setEntries([]);
    try {
      const data = await moiApi.list(ev.id);
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSubmit = async () => {
    if (!form.giver_name || !form.amount) {
      showToast("Name and amount are required"); return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        denoms: form.method === "CASH" ? form.denoms : null,
      };
      const entry = await moiApi.create(selectedEvent.id, payload);
      setEntries((prev) => [entry, ...prev]);
      setForm(blankEntry());
      setShowForm(false);
      setShowDenoms(false);
      showToast("Moi entry added!");
    } catch (e) {
      showToast(e.message || "Failed to add entry");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvents) {
    return (
      <div className="main" style={{ padding: 40, textAlign: "center" }}>
        <div style={{ color: "var(--muted)", fontSize: 16 }}>Loading your events...</div>
      </div>
    );
  }

  // ─── Event List ───────────────────────────────────────────────────────────
  if (!selectedEvent) {
    return (
      <div className="main">
        <div className="page-header">
          <div>
            <div className="page-title">✍️ My Writer Events</div>
            <div className="page-sub">Events you are assigned to enter moi for</div>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 12, padding: "16px 20px", color: "#dc2626", marginBottom: 20 }}>
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-text">No events assigned</div>
            <div className="empty-sub">Ask your affiliate to assign you to an event.</div>
          </div>
        ) : (
          <div className="grid-2">
            {events.map((ev) => (
              <div key={ev.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: 22 }}>{EVENT_TYPE_EMOJI[ev.type] || "🎉"}</span>
                  <span className={`badge ${ev.writer_access_enabled ? "badge-active" : "badge-expired"}`}>
                    {ev.writer_access_enabled ? "✅ Entry Open" : "🔒 Closed"}
                  </span>
                </div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{ev.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
                  📅 {new Date(ev.date).toLocaleDateString("en-IN")} · 📍 {ev.venue}
                </div>
                <button
                  className="btn btn-gold btn-sm"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => openEvent(ev)}
                >
                  {ev.writer_access_enabled ? "Open & Enter Moi →" : "View Event →"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Entry Form ───────────────────────────────────────────────────────────
  return (
    <div className="main">
      {toast && (
        <div className="toast">✅ {toast}</div>
      )}

      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button className="btn btn-outline btn-sm" onClick={() => { setSelectedEvent(null); setEntries([]); setShowForm(false); }}>
              ← Back
            </button>
            <span style={{ fontSize: 20 }}>{EVENT_TYPE_EMOJI[selectedEvent.type] || "🎉"}</span>
          </div>
          <div className="page-title">{selectedEvent.name}</div>
          <div className="page-sub">📅 {new Date(selectedEvent.date).toLocaleDateString("en-IN")} · 📍 {selectedEvent.venue}</div>
        </div>
        {selectedEvent.writer_access_enabled && (
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setForm(blankEntry()); setShowDenoms(false); }}>
            + Add Moi Entry
          </button>
        )}
      </div>

      {/* Access Closed Banner */}
      {!selectedEvent.writer_access_enabled && (
        <div style={{ background: "rgba(139,26,26,0.08)", border: "1px solid rgba(139,26,26,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🔒</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Entry is currently closed</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>The affiliate has not opened writer access for this event yet.</div>
          </div>
        </div>
      )}

      {/* Entry Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🎁 Add Moi Entry</div>
              <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Gift Giver Name *</label>
                <input value={form.giver_name} onChange={(e) => setForm({ ...form, giver_name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Enter amount" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Mobile number" />
              </div>
              <div className="form-group">
                <label>Relation</label>
                <select value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })}>
                  {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value, denoms: emptyDenoms() })}>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="City / Area" />
              </div>
              <div className="form-group full">
                <label>Note</label>
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional note" />
              </div>

              {form.method === "CASH" && (
                <div className="form-group full">
                  <button className="btn btn-outline btn-sm" style={{ marginBottom: 8 }} onClick={() => setShowDenoms((v) => !v)}>
                    {showDenoms ? "Hide denomination" : "Enter denomination"}
                  </button>
                  {showDenoms && (
                    <div className="denom-section">
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>Enter qty of each note — amount auto-fills</div>
                      <div className="denom-grid">
                        {DENOMS.map((d) => {
                          const qty = form.denoms?.[String(d)] || 0;
                          const sub = d * qty;
                          return (
                            <div key={d} className="denom-row">
                              <span className="denom-label">₹{d}</span>
                              <input
                                type="number" min="0" className="denom-qty" value={qty || ""}
                                placeholder="0"
                                onChange={(e) => {
                                  const nd = { ...form.denoms, [String(d)]: Number(e.target.value) || 0 };
                                  const auto = denomSum(nd);
                                  setForm({ ...form, denoms: nd, amount: auto > 0 ? auto : form.amount });
                                }}
                              />
                              {sub > 0 && <span className="denom-sub">={fmt(sub)}</span>}
                            </div>
                          );
                        })}
                      </div>
                      {denomSum(form.denoms) > 0 && (
                        <div className="denom-total-bar"><span>Total</span><span>{fmt(denomSum(form.denoms))}</span></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving..." : "Add Entry"}
              </button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* My Entries Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title">My Entries</div>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{entries.length} entries</span>
        </div>

        {loadingEntries ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎁</div>
            <div className="empty-text">No entries yet</div>
            {selectedEvent.writer_access_enabled && <div className="empty-sub">Click "+ Add Moi Entry" to start</div>}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Amount</th><th>Phone</th><th>Relation</th><th>Method</th></tr>
              </thead>
              <tbody>
                {entries.map((m, i) => (
                  <tr key={m.id} className={m.voided ? "moi-voided" : ""}>
                    <td style={{ color: "var(--muted)", fontWeight: 700 }}>{i + 1}</td>
                    <td>
                      <strong>{m.giver_name}</strong>
                      {m.voided && <span className="badge badge-expired" style={{ marginLeft: 6, fontSize: 9 }}>VOIDED</span>}
                      {m.note && <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.note}</div>}
                    </td>
                    <td><span className="amount-tag">{fmt(m.amount)}</span></td>
                    <td style={{ fontSize: 13 }}>{m.phone}</td>
                    <td style={{ fontSize: 12 }}>{m.relation}</td>
                    <td><span className="badge badge-pending">{m.method}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
