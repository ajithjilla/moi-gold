import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, Gift, Sparkles } from "lucide-react";
import { publicApi } from "../../api/client";
import { fmt, fmtDate, fmtDateTime } from "../../utils/helpers";
import Spinner from "../../components/ui/Spinner";
import Empty from "../../components/ui/Empty";
import LanguageToggle from "../../components/LanguageToggle";

export default function SharedEventPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    publicApi
      .sharedEvent(token)
      .then((d) => {
        setData(d);
        setErr("");
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !data) return <Spinner label="Loading event…" />;

  if (err) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "var(--cream)" }}>
        <div className="card" style={{ maxWidth: 420, textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--crimson)",
              marginBottom: 10,
            }}
          >
            Unavailable
          </h2>
          <p style={{ color: "var(--text-muted)" }}>{err}</p>
        </div>
      </div>
    );
  }

  const { event, summary, entries = [] } = data || {};
  const filtered = entries.filter(
    (e) => !query || e.giver_name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", paddingBottom: 40 }}>
      <div
        style={{
          background: "linear-gradient(180deg, var(--deep), #0F0600)",
          color: "var(--cream)",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid var(--gold-dark)",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="topbar-logo" style={{ width: 32, height: 32, fontSize: 18 }}>
            M
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--gold-light)", fontSize: 14 }}>Moi Tech</div>
            <div style={{ fontSize: 10, color: "var(--text-light)", letterSpacing: 2, textTransform: "uppercase" }}>
              Live Moi List
            </div>
          </div>
        </div>
        <LanguageToggle />
      </div>

      <div className="owner-card" style={{ marginTop: 24 }}>
        <div className="owner-header">
          <div className="owner-event-type">{event?.type}</div>
          <div className="owner-event-name">{event?.name}</div>
          <div className="owner-date">
            {fmtDate(event?.date)} · {event?.venue || "—"}
          </div>
        </div>
        <div className="owner-body">
          <div className="owner-total">
            <div className="owner-total-label">Total Moi Amount</div>
            <div className="owner-total-amount">{fmt(summary?.total || 0)}</div>
            <div style={{ fontSize: 11, letterSpacing: 1, fontWeight: 700 }}>
              {summary?.count || 0} gift givers
            </div>
          </div>

          <div className="search-input" style={{ marginBottom: 12 }}>
            <Search size={14} />
            <input
              className="input"
              placeholder="Search gift giver…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <Empty icon={Gift} title="No entries yet" description="Entries will appear here as they are recorded." />
          ) : (
            <div>
              {filtered.map((e) => (
                <div key={e.id} className="owner-gift-item">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="owner-giver-name truncate">{e.giver_name}</div>
                    <div className="owner-giver-sub">
                      {e.relation || "—"}
                      {e.phone && ` · ${e.phone}`}
                    </div>
                    {e.note && <div className="owner-giver-sub">📝 {e.note}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="owner-gift-amount">{fmt(e.amount)}</div>
                    <div className="owner-giver-sub">{fmtDateTime(e.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              background: "var(--surface-alt)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <Sparkles size={12} color="var(--gold-dark)" /> Auto-refreshing every 30 seconds
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "var(--text-muted)" }}>
        Powered by Moi Tech · Tamil Nadu Function Digital Moi
      </div>
    </div>
  );
}
