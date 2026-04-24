import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, CalendarDays, Gift, BadgeDollarSign } from "lucide-react";
import { adminApi } from "../../api/client.js";
import { fmt, fmtDate } from "../../utils/helpers.js";
import Spinner from "../../components/ui/Spinner.jsx";
import ErrorBanner from "../../components/ui/ErrorBanner.jsx";
import Empty from "../../components/ui/Empty.jsx";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState(null);
  const [series, setSeries] = useState([]);
  const [events, setEvents] = useState([]);
  const [affiliates, setAffiliates] = useState([]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const [s, sr, ev, aff] = await Promise.all([
        adminApi.stats(),
        adminApi.revenueSeries(),
        adminApi.events(),
        adminApi.affiliates(),
      ]);
      setStats(s);
      setSeries(sr);
      setEvents(ev);
      setAffiliates(aff);
    } catch (e) {
      setErr(e.message || "Failed to load dashboard");
      toast.error(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;

  const totalMoi = stats?.totalMoi || 0;
  const avgPerEvent = stats?.events ? totalMoi / stats.events : 0;
  const avgPerEntry = stats?.moiEntries ? totalMoi / stats.moiEntries : 0;

  const topAffiliates = [...affiliates]
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    .slice(0, 5);

  const maxSeries = Math.max(1, ...series.map((s) => s.amount));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard Overview</div>
          <div className="page-sub">Everything happening across Moi Tech.</div>
        </div>
      </div>

      <ErrorBanner message={err} onDismiss={() => setErr("")} />

      <div className="stats-grid">
        <StatCard icon={Users} label="Total Affiliates" value={stats?.affiliates || 0} sub={`${stats?.activeAffiliates || 0} active`} />
        <StatCard icon={CalendarDays} label="Total Events" value={stats?.events || 0} sub={`${stats?.activeEvents || 0} active`} />
        <StatCard icon={Gift} label="Moi Entries" value={(stats?.moiEntries || 0).toLocaleString("en-IN")} />
        <StatCard icon={BadgeDollarSign} label="Platform Revenue" value={fmt(stats?.totalRevenue || 0)} variant="success" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue by month</div>
            <div className="text-xs text-muted">{series.length} months</div>
          </div>
          {series.length === 0 ? (
            <Empty title="No revenue data" description="Events and Moi entries will appear here." />
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, minHeight: 160 }}>
              {series.map((s) => (
                <div key={s.month} style={{ flex: 1, textAlign: "center" }} title={`${s.month}: ${fmt(s.amount)}`}>
                  <div
                    style={{
                      background: "linear-gradient(180deg, var(--gold), var(--gold-dark))",
                      height: `${Math.max(4, (s.amount / maxSeries) * 140)}px`,
                      borderRadius: 6,
                    }}
                  />
                  <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                    {s.month.slice(5)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Top Affiliates</div>
          {topAffiliates.length === 0 ? (
            <Empty title="No affiliates yet" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topAffiliates.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "var(--surface-alt)",
                    borderRadius: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{a.user?.name || "—"}</div>
                    <div className="text-xs text-muted">
                      {a._count?.events || 0} events · {a.plan}
                    </div>
                  </div>
                  <div className="amount-tag">{fmt(a.revenue || 0)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Recent Events</div>
          <div className="text-xs text-muted">Showing latest 10</div>
        </div>
        {events.length === 0 ? (
          <Empty title="No events" description="Events created by affiliates will appear here." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Affiliate</th>
                  <th>Moi count</th>
                  <th className="num">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 10).map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{e.name}</div>
                      <div className="text-xs text-muted">{e.venue}</div>
                    </td>
                    <td>
                      <span className="event-badge">{e.type}</span>
                    </td>
                    <td>{fmtDate(e.date)}</td>
                    <td>{e.affiliate?.user?.name || "—"}</td>
                    <td>{e._count?.moi_entries || 0}</td>
                    <td className="num">
                      <span className={`badge badge-${e.status?.toLowerCase() || "neutral"}`}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid-3" style={{ marginTop: 16 }}>
        <SummaryTile label="Total Moi Collected" value={fmt(totalMoi)} />
        <SummaryTile label="Avg. per Event" value={fmt(Math.round(avgPerEvent))} />
        <SummaryTile label="Avg. per Entry" value={fmt(Math.round(avgPerEntry))} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, variant }) {
  const Icon = icon;
  return (
    <div className={`stat-card${variant ? " " + variant : ""}`}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-delta">{sub}</div>}
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ marginTop: 6 }}>
        {value}
      </div>
    </div>
  );
}
