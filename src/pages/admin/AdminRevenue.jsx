import { useEffect, useState } from "react";
import { adminApi } from "../../api/client.js";
import { fmt } from "../../utils/helpers.js";
import Spinner from "../../components/ui/Spinner.jsx";
import Empty from "../../components/ui/Empty.jsx";
import ErrorBanner from "../../components/ui/ErrorBanner.jsx";

export default function AdminRevenue() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [series, setSeries] = useState([]);
  const [affiliates, setAffiliates] = useState([]);

  useEffect(() => {
    Promise.all([adminApi.revenueSeries(), adminApi.affiliates()])
      .then(([sr, aff]) => {
        setSeries(sr);
        setAffiliates(aff);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const thisMonth = series.find((s) => s.month === thisMonthKey)?.amount || 0;
  const total = affiliates.reduce((s, a) => s + (a.revenue || 0), 0);
  const activeSubscribers = affiliates.filter((a) => a.status === "ACTIVE").length;
  const maxSeries = Math.max(1, ...series.map((s) => s.amount));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Revenue</div>
          <div className="page-sub">Subscription earnings & monthly trend.</div>
        </div>
      </div>
      <ErrorBanner message={err} />

      <div className="stats-grid">
        <Tile label="Total Revenue" value={fmt(total)} variant="success" />
        <Tile label="This Month (Moi total)" value={fmt(thisMonth)} />
        <Tile label="Active Subscribers" value={activeSubscribers} />
      </div>

      <div className="card">
        <div className="card-title">Revenue by affiliate</div>
        {affiliates.length === 0 ? (
          <Empty title="No affiliates" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...affiliates]
              .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
              .map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "var(--surface-alt)",
                    borderRadius: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{a.user?.name}</div>
                    <div className="text-xs text-muted">{a.plan} · {a._count?.events || 0} events</div>
                  </div>
                  <div className="amount-tag">{fmt(a.revenue || 0)}</div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Monthly Moi collected</div>
        {series.length === 0 ? (
          <Empty title="No data yet" />
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, minHeight: 220 }}>
            {series.map((s) => (
              <div key={s.month} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    background: "linear-gradient(180deg, var(--crimson), var(--gold-dark))",
                    height: `${Math.max(4, (s.amount / maxSeries) * 200)}px`,
                    borderRadius: 6,
                  }}
                  title={fmt(s.amount)}
                />
                <div className="text-xs text-muted" style={{ marginTop: 6 }}>
                  {s.month}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Tile({ label, value, variant }) {
  return (
    <div className={`stat-card${variant ? " " + variant : ""}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
