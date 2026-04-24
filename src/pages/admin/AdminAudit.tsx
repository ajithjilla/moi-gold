import { useEffect, useState } from "react";
import { adminApi } from "../../api/client";
import { fmtDateTime } from "../../utils/helpers";
import Spinner from "../../components/ui/Spinner";
import Empty from "../../components/ui/Empty";
import ErrorBanner from "../../components/ui/ErrorBanner";

export default function AdminAudit() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    adminApi
      .auditLog(200)
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Audit log</div>
          <div className="page-sub">Recent privileged actions across the platform.</div>
        </div>
      </div>
      <ErrorBanner message={err} />

      <div className="card">
        {rows.length === 0 ? (
          <Empty title="No audit entries yet" description="Sensitive actions will be logged here." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtDateTime(r.created_at)}</td>
                    <td>
                      {r.actor?.name || "System"}
                      {r.actor && <div className="text-xs text-muted">{r.actor.role}</div>}
                    </td>
                    <td>
                      <code>{r.action}</code>
                    </td>
                    <td>{r.entity ? `${r.entity}${r.entity_id ? "#" + r.entity_id : ""}` : "—"}</td>
                    <td>
                      <code style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {r.metadata ? JSON.stringify(r.metadata).slice(0, 160) : "—"}
                      </code>
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
