import { useState } from "react";
import { EVENT_TYPES } from "../data/constants";
import { fmt } from "../utils/helpers";

export default function OwnerView({ events, moi }) {
  const myEvent = events.find((e) => e.ownerEmail === "murugan@gmail.com") || events[0];
  const eventMoi = moi.filter((m) => m.eventId === myEvent?.id);
  const total = eventMoi.reduce((s, m) => s + m.amount, 0);
  const [search, setSearch] = useState("");
  const filtered = eventMoi.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div
      className="main"
      style={{
        background: "linear-gradient(135deg, #f0e6d0 0%, #e8d5b0 100%)",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      <div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>
            📱 Event Owner Mobile View
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            This is how the event owner sees their Moi list on mobile
          </div>
        </div>

        <div className="mobile-view">
          <div className="mobile-header">
            <div className="mobile-event-type">
              {EVENT_TYPES.find((t) => t.value === myEvent?.type)?.label || "Function"}
            </div>
            <div className="mobile-event-name">{myEvent?.name}</div>
            <div className="mobile-date">📅 {myEvent?.date} · 📍 {myEvent?.venue}</div>
          </div>

          <div className="mobile-body">
            <div className="mobile-total">
              <div className="mobile-total-label">மொத்த மொய் தொகை</div>
              <div className="mobile-total-amount">{fmt(total)}</div>
              <div className="mobile-total-sub">{eventMoi.length} gift givers · Live updating</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { icon: "🎁", value: eventMoi.length, label: "Entries" },
                { icon: "📊", value: fmt(Math.round(total / Math.max(eventMoi.length, 1))), label: "Average" },
              ].map((s, i) => (
                <div key={i} style={{ background: "var(--cream)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
                  <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: 16, color: "var(--crimson)" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ position: "relative", marginBottom: 12 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
              <input
                placeholder="Search gift giver..."
                style={{ width: "100%", paddingLeft: 32, fontSize: 13 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {filtered.map((m, i) => (
                <div key={m.id} className="mobile-gift-item">
                  <div>
                    <div className="mobile-giver-name">{i + 1}. {m.name}</div>
                    <div className="mobile-giver-sub">📞 {m.phone} · {m.relation}</div>
                  </div>
                  <div className="mobile-amount">{fmt(m.amount)}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: "12px", background: "rgba(200,146,42,0.1)", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--gold-dark)", fontWeight: 600 }}>🔴 LIVE · Auto-refreshing every 30 seconds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
