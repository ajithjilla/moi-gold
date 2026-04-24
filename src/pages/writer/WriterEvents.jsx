import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { writerApi } from "../../api/client.js";
import { fmtDate, statusBadgeClass } from "../../utils/helpers.js";
import Spinner from "../../components/ui/Spinner.jsx";
import Empty from "../../components/ui/Empty.jsx";

export default function WriterEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    writerApi
      .events()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Events</div>
          <div className="page-sub">Events you are assigned to record Moi for.</div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="card">
          <Empty
            title="No assignments yet"
            description="Once an affiliate assigns you to an event, it will appear here."
          />
        </div>
      ) : (
        <div className="grid-2">
          {events.map((e) => (
            <div className="card" key={e.id}>
              <div className="card-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{e.name}</div>
                  <div className="text-xs text-muted">
                    {fmtDate(e.date)} · {e.venue || "—"}
                  </div>
                </div>
                <span className={`badge ${statusBadgeClass(e.status)}`}>{e.status}</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                <span className="event-badge">{e.type}</span>
                {!e.writer_access_enabled && (
                  <span className="badge badge-warning">
                    <Lock size={10} /> Access disabled
                  </span>
                )}
              </div>
              <div className="modal-footer" style={{ marginTop: 12 }}>
                <Link
                  className={`btn btn-sm ${e.writer_access_enabled ? "btn-primary" : "btn-ghost"}`}
                  to={`/writer/events/${e.id}`}
                >
                  {e.writer_access_enabled ? "Record Moi" : "View"} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
