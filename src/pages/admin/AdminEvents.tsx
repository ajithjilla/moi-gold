import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { adminApi } from "../../api/client";
import { fmtDate, statusBadgeClass } from "../../utils/helpers";
import Spinner from "../../components/ui/Spinner";
import Empty from "../../components/ui/Empty";
import ErrorBanner from "../../components/ui/ErrorBanner";

export default function AdminEvents() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    adminApi
      .events()
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q) ||
      r.owner_name?.toLowerCase().includes(q) ||
      r.venue?.toLowerCase().includes(q) ||
      r.affiliate?.user?.name?.toLowerCase().includes(q)
    );
  });

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">All Events</div>
          <div className="page-sub">Events across all affiliates.</div>
        </div>
      </div>

      <ErrorBanner message={err} onDismiss={() => setErr("")} />

      <div className="card">
        <div className="card-header">
          <div className="search-input" style={{ flex: 1, maxWidth: 380 }}>
            <Search size={16} />
            <input
              className="input"
              placeholder="Search by event, venue, owner, or affiliate"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted">{filtered.length} of {rows.length}</div>
        </div>
        {filtered.length === 0 ? (
          <Empty title="No events" description="Events will appear here as affiliates create them." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Owner</th>
                  <th>Affiliate</th>
                  <th className="num">Moi count</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{e.name}</div>
                      <div className="text-xs text-muted">{fmtDate(e.created_at)}</div>
                    </td>
                    <td>
                      <span className="event-badge">{e.type}</span>
                    </td>
                    <td>{fmtDate(e.date)}</td>
                    <td>{e.venue || "—"}</td>
                    <td>
                      {e.owner_name}
                      {e.owner_phone && <div className="text-xs text-muted">{e.owner_phone}</div>}
                    </td>
                    <td>{e.affiliate?.user?.name || "—"}</td>
                    <td className="num">{e._count?.moi_entries || 0}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(e.status)}`}>{e.status}</span>
                    </td>
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
