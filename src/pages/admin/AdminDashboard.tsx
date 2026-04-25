import { useCallback, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { toast } from "sonner";
import { Users, CalendarDays, Gift, BadgeDollarSign } from "lucide-react";
import { adminApi } from "../../api/client";
import { useLanguage } from "../../context/useLanguage";
import { fmt, fmtDate } from "../../utils/helpers";
import Spinner from "../../components/ui/Spinner";
import ErrorBanner from "../../components/ui/ErrorBanner";
import Empty from "../../components/ui/Empty";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState(null);
  const [series, setSeries] = useState([]);
  const [events, setEvents] = useState([]);
  const [affiliates, setAffiliates] = useState([]);

  const load = useCallback(async () => {
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("admin.loadDashboardFailed");
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner label={t("admin.loadingDashboard")} />;

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
          <div className="page-title">{t("admin.dashTitle")}</div>
          <div className="page-sub">{t("admin.dashSubPlatform")}</div>
        </div>
      </div>

      <ErrorBanner message={err} onDismiss={() => setErr("")} />

      <div className="stats-grid">
        <StatCard
          icon={Users}
          label={t("admin.statAffiliates")}
          value={stats?.affiliates || 0}
          sub={`${stats?.activeAffiliates || 0} ${t("common.activeCount")}`}
        />
        <StatCard
          icon={CalendarDays}
          label={t("admin.statEvents")}
          value={stats?.events || 0}
          sub={`${stats?.activeEvents || 0} ${t("common.activeCount")}`}
        />
        <StatCard
          icon={Gift}
          label={t("admin.statMoiEntries")}
          value={(stats?.moiEntries || 0).toLocaleString("en-IN")}
        />
        <StatCard
          icon={BadgeDollarSign}
          label={t("admin.platformRevenue")}
          value={fmt(stats?.totalRevenue || 0)}
          variant="success"
        />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t("admin.revenueByMonth")}</div>
            <div className="text-xs text-muted">
              {series.length} {t("common.months")}
            </div>
          </div>
          {series.length === 0 ? (
            <Empty title={t("admin.noRevenueData")} description={t("admin.noRevenueDataDesc")} />
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
          <div className="card-title">{t("admin.topAffiliates")}</div>
          {topAffiliates.length === 0 ? (
            <Empty title={t("admin.noAffiliatesYet")} />
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
                      {a._count?.events || 0} {t("admin.affiliateEventsList")} · {a.plan}
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
          <div className="card-title">{t("admin.recentEvents")}</div>
          <div className="text-xs text-muted">{t("admin.recentEventsSub")}</div>
        </div>
        {events.length === 0 ? (
          <Empty title={t("admin.noEventsAdmin")} description={t("admin.noEventsAdminDesc")} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("admin.thEvent")}</th>
                  <th>{t("admin.thType")}</th>
                  <th>{t("admin.thDate")}</th>
                  <th>{t("admin.thAffiliate")}</th>
                  <th>{t("admin.moiCountShort")}</th>
                  <th className="num">{t("common.status")}</th>
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
        <SummaryTile label={t("admin.totalMoiCollected")} value={fmt(totalMoi)} />
        <SummaryTile label={t("admin.avgPerEvent")} value={fmt(Math.round(avgPerEvent))} />
        <SummaryTile label={t("admin.avgPerEntry")} value={fmt(Math.round(avgPerEntry))} />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  variant,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  variant?: string;
}) {
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

function SummaryTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ marginTop: 6 }}>
        {value}
      </div>
    </div>
  );
}
