import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { affiliateApi, reportsApi } from "../../api/client";
import { fmtDate } from "../../utils/helpers";
import Spinner from "../../components/ui/Spinner";
import Empty from "../../components/ui/Empty";

export default function AffiliateReports() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    affiliateApi
      .events()
      .then(setEvents)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = async (ev) => {
    try {
      const blob = await reportsApi.downloadCsv(ev.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moi-${ev.name?.replace(/[^a-z0-9]+/gi, "-") || "export"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-sub">Export and print your Moi lists.</div>
        </div>
      </div>

      <div className="card">
        {events.length === 0 ? (
          <Empty title="No events yet" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Entries</th>
                  <th className="num">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{e.name}</div>
                      <div className="text-xs text-muted">{e.venue}</div>
                    </td>
                    <td>{fmtDate(e.date)}</td>
                    <td>{e._count?.moi_entries || 0}</td>
                    <td className="num">
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => exportCsv(e)}>
                          <FileSpreadsheet size={12} /> CSV
                        </button>
                        <Link className="btn btn-sm btn-ghost" to={`/affiliate/events/${e.id}`}>
                          <ExternalLink size={12} /> Open
                        </Link>
                      </div>
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
