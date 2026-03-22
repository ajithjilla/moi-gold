import { useState } from "react";
import { fmt } from "../utils/helpers.js";
import EventBadge from "./EventBadge.jsx";
import Toast from "./Toast.jsx";

const MENU_ITEMS = [
  { id: "overview", icon: "📊", label: "Overview" },
  { id: "affiliates", icon: "👥", label: "Affiliates" },
  { id: "events", icon: "🎉", label: "All Events" },
  { id: "revenue", icon: "💰", label: "Revenue" },
  { id: "plans", icon: "📋", label: "Plans" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

const PLANS = [
  { name: "Basic", price: "₹299", period: "/month", features: ["Up to 5 events/month", "50 Moi entries/event", "PDF Export", "Email support"], featured: false },
  { name: "Pro", price: "₹599", period: "/month", features: ["Unlimited events", "Unlimited Moi entries", "PDF + Excel Export", "WhatsApp notifications", "Priority support", "Tamil language UI"], featured: true },
  { name: "Enterprise", price: "₹1299", period: "/month", features: ["Everything in Pro", "Multiple operators", "Custom branding", "Dedicated support", "API access", "Analytics dashboard"], featured: false },
];

export default function AdminDashboard({ affiliates, setAffiliates, events, moi }) {
  const [page, setPage] = useState("overview");
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAff, setNewAff] = useState({ name: "", email: "", phone: "", plan: "basic" });

  const totalRevenue = affiliates.reduce((s, a) => s + a.revenue, 0);
  const totalMoiCollected = moi.reduce((s, m) => s + m.amount, 0);

  const addAffiliate = () => {
    setAffiliates([...affiliates, { ...newAff, id: Date.now(), status: "pending", joinDate: new Date().toISOString().split("T")[0], eventsCount: 0, revenue: 0 }]);
    setShowModal(false);
    setToast("Affiliate added successfully!");
    setNewAff({ name: "", email: "", phone: "", plan: "basic" });
  };

  const getStatusBadge = (status) => {
    const cls = status === "active" ? "active" : status === "pending" ? "pending" : "expired";
    return `badge-${cls}`;
  };

  const getEventStatusBadge = (status) => {
    const cls = status === "completed" ? "active" : status === "active" ? "pending" : "expired";
    return `badge-${cls}`;
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-label" style={{ padding: "0 24px", marginBottom: 12 }}>Navigation</div>
        {MENU_ITEMS.map((m) => (
          <div key={m.id} className={`sidebar-item ${page === m.id ? "active" : ""}`} onClick={() => setPage(m.id)}>
            <span className="sidebar-icon">{m.icon}</span> {m.label}
          </div>
        ))}
      </div>

      <div className="main">
        {page === "overview" && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">📊 Dashboard Overview</div>
                <div className="page-sub">Welcome back! Here&apos;s what&apos;s happening today.</div>
              </div>
            </div>

            <div className="stats-grid">
              {[
                { icon: "👥", value: affiliates.length, label: "Total Affiliates" },
                { icon: "🎉", value: events.length, label: "Total Events" },
                { icon: "🎁", value: moi.length, label: "Moi Entries" },
                { icon: "💰", value: fmt(totalRevenue), label: "Total Revenue" },
              ].map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">🌟 Top Affiliates</div>
                {[...affiliates].sort((a, b) => b.revenue - a.revenue).slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center justify-between mb-3" style={{ padding: "10px 0", borderBottom: "1px solid rgba(200,146,42,0.1)" }}>
                    <div>
                      <div className="font-bold" style={{ fontSize: 14 }}>{a.name}</div>
                      <div className="text-xs text-muted">{a.eventsCount} events · {a.plan.toUpperCase()} plan</div>
                    </div>
                    <div className="amount-tag">{fmt(a.revenue)}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-title">🎉 Recent Events</div>
                {events.slice(0, 3).map((e) => (
                  <div key={e.id} className="flex items-center justify-between mb-3" style={{ padding: "10px 0", borderBottom: "1px solid rgba(200,146,42,0.1)" }}>
                    <div>
                      <div className="font-bold" style={{ fontSize: 14 }}>{e.name}</div>
                      <div className="text-xs text-muted">{e.date} · {e.venue}</div>
                    </div>
                    <EventBadge type={e.type} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-title">💳 Gift Collections Summary</div>
              <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {[
                  { label: "Total Moi Collected", value: fmt(totalMoiCollected) },
                  { label: "Avg. per Event", value: fmt(Math.round(totalMoiCollected / Math.max(events.length, 1))) },
                  { label: "Avg. per Entry", value: fmt(Math.round(totalMoiCollected / Math.max(moi.length, 1))) },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "16px", borderRight: i < 2 ? "1px solid rgba(200,146,42,0.15)" : "none" }}>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 700, color: "var(--crimson)" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {page === "affiliates" && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">👥 Affiliates</div>
                <div className="page-sub">Manage your registered affiliates</div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Affiliate</button>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Phone</th><th>Plan</th><th>Status</th><th>Events</th><th>Revenue</th><th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.name}</strong></td>
                        <td style={{ color: "var(--muted)" }}>{a.email}</td>
                        <td>{a.phone}</td>
                        <td><span className="badge badge-active">{a.plan.toUpperCase()}</span></td>
                        <td><span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                        <td>{a.eventsCount}</td>
                        <td className="amount-positive">{fmt(a.revenue)}</td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{a.joinDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {page === "events" && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">🎉 All Events</div>
                <div className="page-sub">Events across all affiliates</div>
              </div>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Event Name</th><th>Type</th><th>Date</th><th>Venue</th><th>Owner</th><th>Moi Count</th><th>Total Moi</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => {
                      const eMoi = moi.filter((m) => m.eventId === e.id);
                      return (
                        <tr key={e.id}>
                          <td><strong>{e.name}</strong></td>
                          <td><EventBadge type={e.type} /></td>
                          <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.date}</td>
                          <td style={{ fontSize: 12 }}>{e.venue}</td>
                          <td>{e.owner}</td>
                          <td>{eMoi.length}</td>
                          <td className="amount-positive">{fmt(eMoi.reduce((s, m) => s + m.amount, 0))}</td>
                          <td><span className={`badge ${getEventStatusBadge(e.status)}`}>{e.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {page === "revenue" && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">💰 Revenue</div>
                <div className="page-sub">Your subscription earnings</div>
              </div>
            </div>
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {[
                { icon: "💰", value: fmt(totalRevenue), label: "Total Revenue" },
                { icon: "📅", value: fmt(1800), label: "This Month" },
                { icon: "📈", value: affiliates.filter((a) => a.status === "active").length, label: "Active Subscribers" },
              ].map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card mt-4">
              <div className="card-title">💳 Revenue by Affiliate</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Affiliate</th><th>Plan</th><th>Events</th><th>Revenue</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.name}</strong></td>
                        <td><span className="badge badge-active">{a.plan.toUpperCase()}</span></td>
                        <td>{a.eventsCount}</td>
                        <td className="amount-positive">{fmt(a.revenue)}</td>
                        <td><span className={`badge ${a.status === "active" ? "active" : "pending"}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {page === "plans" && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">📋 Subscription Plans</div>
                <div className="page-sub">Manage your pricing plans</div>
              </div>
            </div>
            <div className="plans-grid">
              {PLANS.map((p, i) => (
                <div key={i} className={`plan-card ${p.featured ? "featured" : ""}`}>
                  <div className="plan-name">{p.name}</div>
                  <div><span className="plan-price">{p.price}</span> <span className="plan-period">{p.period}</span></div>
                  <div className="divider" />
                  <div className="plan-features">
                    {p.features.map((f, j) => (
                      <div key={j} className="plan-feature">
                        <span>✅</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`btn ${p.featured ? "btn-primary" : "btn-outline"} mt-4`} style={{ width: "100%", justifyContent: "center" }}>Select Plan</button>
                </div>
              ))}
            </div>
          </>
        )}

        {page === "settings" && (
          <div className="card">
            <div className="card-title">⚙️ System Settings</div>
            <div className="form-grid">
              <div className="form-group"><label>App Name</label><input defaultValue="Moi Tech" /></div>
              <div className="form-group"><label>Admin Email</label><input defaultValue="admin@moitech.in" /></div>
              <div className="form-group"><label>WhatsApp API Key</label><input placeholder="Enter API key" /></div>
              <div className="form-group"><label>Currency</label><select><option>INR (₹)</option></select></div>
              <div className="form-group full"><label>Welcome Message (Tamil)</label><textarea defaultValue="வாழ்த்துக்கள்! உங்கள் மொய் பட்டியல் புதுப்பிக்கப்பட்டது." /></div>
            </div>
            <button className="btn btn-primary mt-4">Save Settings</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">➕ Add New Affiliate</div>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input value={newAff.name} onChange={(e) => setNewAff({ ...newAff, name: e.target.value })} placeholder="Enter name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={newAff.email} onChange={(e) => setNewAff({ ...newAff, email: e.target.value })} placeholder="Enter email" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={newAff.phone} onChange={(e) => setNewAff({ ...newAff, phone: e.target.value })} placeholder="Enter phone" />
              </div>
              <div className="form-group">
                <label>Plan</label>
                <select value={newAff.plan} onChange={(e) => setNewAff({ ...newAff, plan: e.target.value })}>
                  <option value="basic">Basic - ₹299/mo</option>
                  <option value="pro">Pro - ₹599/mo</option>
                  <option value="enterprise">Enterprise - ₹1299/mo</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={addAffiliate}>Add Affiliate</button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
