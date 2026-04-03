import { useState } from "react";
import { EVENT_TYPES } from "../data/constants";
import { fmt } from "../utils/helpers";
import EventBadge from "./EventBadge";
import Toast from "./Toast";

const MENU_ITEMS = [
  { id: "events", icon: "🎉", label: "My Events" },
  { id: "moi", icon: "🎁", label: "Moi Entry" },
  { id: "reports", icon: "📄", label: "Reports" },
];

const RELATIONS = ["Uncle", "Aunt", "Friend", "Colleague", "Neighbor", "Relative", "Brother", "Sister", "Other"];
const PAYMENT_METHODS = ["Cash", "GPay", "PhonePe", "Paytm", "NEFT", "Cheque"];

export default function AffiliateDashboard({ events, setEvents, moi, setMoi }) {
  const [page, setPage] = useState("events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMoiModal, setShowMoiModal] = useState(false);
  const [editingMoi, setEditingMoi] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [newEvent, setNewEvent] = useState({ name: "", type: "wedding", date: "", venue: "", owner: "", ownerPhone: "", ownerEmail: "" });
  const [newMoi, setNewMoi] = useState({ name: "", amount: "", phone: "", address: "", relation: "", method: "Cash", note: "" });

  const myEvents = events.filter((e) => e.affiliateId === 1);
  const eventMoi = selectedEvent ? moi.filter((m) => m.eventId === selectedEvent.id) : [];
  const filteredMoi = eventMoi.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));
  const totalMoi = eventMoi.reduce((s, m) => s + m.amount, 0);

  const addEvent = () => {
    setEvents([...events, { ...newEvent, id: Date.now(), affiliateId: 1, status: "upcoming" }]);
    setShowEventModal(false);
    setToast("Event created successfully!");
    setNewEvent({ name: "", type: "wedding", date: "", venue: "", owner: "", ownerPhone: "", ownerEmail: "" });
  };

  const saveMoi = () => {
    if (editingMoi) {
      setMoi(moi.map((m) => (m.id === editingMoi.id ? { ...editingMoi, ...newMoi, amount: Number(newMoi.amount) } : m)));
      setToast("Moi entry updated!");
    } else {
      setMoi([...moi, { ...newMoi, id: Date.now(), eventId: selectedEvent.id, amount: Number(newMoi.amount) }]);
      setToast("Moi entry added!");
    }
    setShowMoiModal(false);
    setEditingMoi(null);
    setNewMoi({ name: "", amount: "", phone: "", address: "", relation: "", method: "Cash", note: "" });
  };

  const openEdit = (m) => {
    setEditingMoi(m);
    setNewMoi({ name: m.name, amount: m.amount, phone: m.phone, address: m.address, relation: m.relation, method: m.method, note: m.note });
    setShowMoiModal(true);
  };

  const deleteMoi = (id) => {
    setMoi(moi.filter((m) => m.id !== id));
    setToast("Entry deleted.");
  };

  const handleMenuClick = (m) => {
    setPage(m.id);
    if (m.id !== "moi") setSelectedEvent(null);
  };

  return (
    <div className="layout">
      <div className="sidebar">
        {MENU_ITEMS.map((m) => (
          <div key={m.id} className={`sidebar-item ${page === m.id ? "active" : ""}`} onClick={() => handleMenuClick(m)}>
            <span className="sidebar-icon">{m.icon}</span> {m.label}
          </div>
        ))}
        {selectedEvent && page === "moi" && (
          <>
            <div className="divider" style={{ margin: "12px 16px" }} />
            <div style={{ padding: "8px 24px" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Active Event</div>
              <div style={{ fontSize: 13, color: "var(--gold-light)", fontWeight: 600 }}>{selectedEvent.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{eventMoi.length} entries · {fmt(totalMoi)}</div>
            </div>
          </>
        )}
      </div>

      <div className="main">
        {page === "events" && (
          <EventsTab
            myEvents={myEvents}
            moi={moi}
            onAddEvent={() => setShowEventModal(true)}
            onSelectEvent={(e) => { setSelectedEvent(e); setPage("moi"); }}
            eventBadge={<EventBadge />}
          />
        )}

        {page === "moi" && (
          <MoiTab
            selectedEvent={selectedEvent}
            myEvents={myEvents}
            eventMoi={eventMoi}
            filteredMoi={filteredMoi}
            totalMoi={totalMoi}
            search={search}
            onSearchChange={setSearch}
            onBack={() => setSelectedEvent(null)}
            onSelectEvent={setSelectedEvent}
            onAddMoi={() => {
              setEditingMoi(null);
              setNewMoi({ name: "", amount: "", phone: "", address: "", relation: "", method: "Cash", note: "" });
              setShowMoiModal(true);
            }}
            onEdit={openEdit}
            onDelete={deleteMoi}
          />
        )}

        {page === "reports" && (
          <ReportsTab myEvents={myEvents} moi={moi} />
        )}
      </div>

      {showEventModal && (
        <EventModal
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onClose={() => setShowEventModal(false)}
          onSubmit={addEvent}
        />
      )}

      {showMoiModal && (
        <MoiModal
          editingMoi={editingMoi}
          newMoi={newMoi}
          setNewMoi={setNewMoi}
          onClose={() => setShowMoiModal(false)}
          onSubmit={saveMoi}
          relations={RELATIONS}
          paymentMethods={PAYMENT_METHODS}
        />
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function EventsTab({ myEvents, moi, onAddEvent, onSelectEvent }) {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">🎉 My Events</div>
          <div className="page-sub">Manage your function events</div>
        </div>
        <button className="btn btn-primary" onClick={onAddEvent}>+ New Event</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
        {[
          { icon: "🎉", value: myEvents.length, label: "Total Events" },
          { icon: "🎁", value: moi.filter((m) => myEvents.some((e) => e.id === m.eventId)).length, label: "Total Moi Entries" },
          { icon: "💰", value: fmt(moi.filter((m) => myEvents.some((e) => e.id === m.eventId)).reduce((s, m) => s + m.amount, 0)), label: "Total Moi Amount" },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {myEvents.map((e) => {
          const eMoi = moi.filter((m) => m.eventId === e.id);
          const total = eMoi.reduce((s, m) => s + m.amount, 0);
          return (
            <div key={e.id} className="card" style={{ cursor: "pointer" }}>
              <div className="flex items-center justify-between mb-3">
                <EventBadge type={e.type} />
                <span className={`badge badge-${e.status === "completed" ? "active" : e.status === "active" ? "pending" : "expired"}`}>{e.status}</span>
              </div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{e.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>📅 {e.date} · 📍 {e.venue}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>👤 {e.owner} · 📞 {e.ownerPhone}</div>
              <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(200,146,42,0.15)", paddingTop: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Playfair Display, serif", color: "var(--crimson)" }}>{fmt(total)}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{eMoi.length} entries</div>
                </div>
                <button className="btn btn-gold btn-sm" onClick={() => onSelectEvent(e)}>Enter Moi →</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function MoiTab({ selectedEvent, myEvents, eventMoi, filteredMoi, totalMoi, search, onSearchChange, onBack, onSelectEvent, onAddMoi, onEdit, onDelete }) {
  if (!selectedEvent) {
    return (
      <>
        <div className="page-header">
          <div>
            <div className="page-title">🎁 Moi Entry</div>
            <div className="page-sub">Select an event to enter gift details</div>
          </div>
        </div>
        <div className="grid-2">
          {myEvents.map((e) => (
            <div key={e.id} className="card" style={{ cursor: "pointer" }} onClick={() => onSelectEvent(e)}>
              <div className="flex items-center gap-2 mb-2"><EventBadge type={e.type} /></div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 16, fontWeight: 700 }}>{e.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>📅 {e.date} · 📍 {e.venue}</div>
              <button className="btn btn-primary btn-sm mt-4">Open Event →</button>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button className="btn btn-outline btn-sm" onClick={onBack}>← Back</button>
            <EventBadge type={selectedEvent.type} />
          </div>
          <div className="page-title">{selectedEvent.name}</div>
          <div className="page-sub">📅 {selectedEvent.date} · 📍 {selectedEvent.venue} · 👤 {selectedEvent.owner}</div>
        </div>
        <button className="btn btn-primary" onClick={onAddMoi}>+ Add Moi Entry</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
        {[
          { icon: "🎁", value: eventMoi.length, label: "Total Entries" },
          { icon: "💰", value: fmt(totalMoi), label: "Total Moi Amount" },
          { icon: "📊", value: fmt(Math.round(totalMoi / Math.max(eventMoi.length, 1))), label: "Avg. per Entry" },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title">🎁 Moi Entries List</div>
          <div className="search-wrap" style={{ width: 240 }}>
            <span className="search-icon">🔍</span>
            <input placeholder="Search by name or phone..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
          </div>
        </div>

        {filteredMoi.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎁</div>
            <div className="empty-text">No entries yet</div>
            <div className="empty-sub">Click "Add Moi Entry" to start tracking</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Amount</th><th>Phone</th><th>Address</th><th>Relation</th><th>Method</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMoi.map((m, i) => (
                  <tr key={m.id}>
                    <td style={{ color: "var(--muted)", fontWeight: 700 }}>{i + 1}</td>
                    <td><strong>{m.name}</strong>{m.note && <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.note}</div>}</td>
                    <td><span className="amount-tag">{fmt(m.amount)}</span></td>
                    <td style={{ fontSize: 13 }}>{m.phone}</td>
                    <td style={{ fontSize: 12, color: "var(--muted)", maxWidth: 150 }}>{m.address}</td>
                    <td style={{ fontSize: 12 }}>{m.relation}</td>
                    <td><span className="badge badge-pending">{m.method}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-outline btn-sm" onClick={() => onEdit(m)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => onDelete(m.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function ReportsTab({ myEvents, moi }) {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">📄 Reports</div>
          <div className="page-sub">Export and print your Moi lists</div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">📋 Event Reports</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Event</th><th>Type</th><th>Date</th><th>Entries</th><th>Total Amount</th><th>Export</th></tr>
            </thead>
            <tbody>
              {myEvents.map((e) => {
                const eMoi = moi.filter((m) => m.eventId === e.id);
                return (
                  <tr key={e.id}>
                    <td><strong>{e.name}</strong></td>
                    <td><EventBadge type={e.type} /></td>
                    <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.date}</td>
                    <td>{eMoi.length}</td>
                    <td className="amount-positive">{fmt(eMoi.reduce((s, m) => s + m.amount, 0))}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-gold btn-sm">🖨️ Print</button>
                        <button className="btn btn-outline btn-sm">📥 PDF</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function EventModal({ newEvent, setNewEvent, onClose, onSubmit }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🎉 Create New Event</div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="section-strip">Event Details</div>
        <div className="form-grid mb-4">
          <div className="form-group full">
            <label>Event / Function Name</label>
            <input value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} placeholder="e.g. Murugan & Kavitha Wedding" />
          </div>
          <div className="form-group">
            <label>Event Type</label>
            <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
              {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Event Date</label>
            <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
          </div>
          <div className="form-group full">
            <label>Venue</label>
            <input value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} placeholder="Hall name, city" />
          </div>
        </div>
        <div className="section-strip">Event Owner Details</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Owner / Host Name</label>
            <input value={newEvent.owner} onChange={(e) => setNewEvent({ ...newEvent, owner: e.target.value })} placeholder="Full name" />
          </div>
          <div className="form-group">
            <label>Owner Phone</label>
            <input value={newEvent.ownerPhone} onChange={(e) => setNewEvent({ ...newEvent, ownerPhone: e.target.value })} placeholder="Mobile number" />
          </div>
          <div className="form-group full">
            <label>Owner Email (for login)</label>
            <input value={newEvent.ownerEmail} onChange={(e) => setNewEvent({ ...newEvent, ownerEmail: e.target.value })} placeholder="Email for event owner login" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="btn btn-primary" onClick={onSubmit}>Create Event</button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function MoiModal({ editingMoi, newMoi, setNewMoi, onClose, onSubmit, relations, paymentMethods }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{editingMoi ? "✏️ Edit Moi Entry" : "🎁 Add Moi Entry"}</div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Gift Giver Name (மொய் கொடுப்பவர்)</label>
            <input value={newMoi.name} onChange={(e) => setNewMoi({ ...newMoi, name: e.target.value })} placeholder="Full name" />
          </div>
          <div className="form-group">
            <label>Amount / தொகை (₹)</label>
            <input type="number" value={newMoi.amount} onChange={(e) => setNewMoi({ ...newMoi, amount: e.target.value })} placeholder="Enter amount" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={newMoi.phone} onChange={(e) => setNewMoi({ ...newMoi, phone: e.target.value })} placeholder="Mobile number" />
          </div>
          <div className="form-group">
            <label>Relation</label>
            <select value={newMoi.relation} onChange={(e) => setNewMoi({ ...newMoi, relation: e.target.value })}>
              {relations.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <select value={newMoi.method} onChange={(e) => setNewMoi({ ...newMoi, method: e.target.value })}>
              {paymentMethods.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group full">
            <label>Address</label>
            <input value={newMoi.address} onChange={(e) => setNewMoi({ ...newMoi, address: e.target.value })} placeholder="City / Area" />
          </div>
          <div className="form-group full">
            <label>Note (Optional)</label>
            <input value={newMoi.note} onChange={(e) => setNewMoi({ ...newMoi, note: e.target.value })} placeholder="Any note or message" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="btn btn-primary" onClick={onSubmit}>{editingMoi ? "Update Entry" : "Add Entry"}</button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
