import { useEffect, useState } from "react";
import { moiApi } from "../../../api/client";
import { fmtDateTime } from "../../../utils/helpers";
import Spinner from "../../../components/ui/Spinner";
import ErrorBanner from "../../../components/ui/ErrorBanner";
import type { AuditLog, MoiEntry } from "../../../types/domain";

interface EntryHistoryProps {
  eventId: string;
  entry: MoiEntry;
}

export default function EntryHistory({ eventId, entry }: EntryHistoryProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    moiApi
      .history(eventId, entry.id)
      .then(setLogs)
      .catch((err) => setError(err.message || "Failed to load history"))
      .finally(() => setLoading(false));
  }, [eventId, entry.id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (logs.length === 0) return <div style={{ padding: 16 }}>No history available for this entry.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
      {logs.map((log) => (
        <div key={log.id} style={{ background: "var(--surface-alt)", padding: 12, borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`badge badge-${getBadgeType(log.action)}`}>{log.action}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{log.actor?.name || "Unknown"}</span>
            </div>
            <span className="text-xs text-muted">{fmtDateTime(log.created_at)}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            {renderMetadata(log.action, log.metadata)}
          </div>
        </div>
      ))}
    </div>
  );
}

function getBadgeType(action: string) {
  switch (action) {
    case "CREATE": return "success";
    case "UPDATE": return "warning";
    case "VOID": return "danger";
    case "RESTORE": return "success";
    case "DELETE": return "danger";
    default: return "neutral";
  }
}

function renderMetadata(action: string, metadata: any) {
  if (!metadata) return null;
  if (action === "CREATE") return "Entry created.";
  if (action === "VOID") return "Entry was voided.";
  if (action === "RESTORE") return "Entry was restored.";
  if (action === "DELETE") return "Entry was permanently deleted.";
  
  if (action === "UPDATE") {
    const changes: string[] = [];
    const old = metadata.old || {};
    const n = metadata.new || {};
    
    // Compare basic fields
    const fields = ["giver_name", "amount", "phone", "address", "relation", "method", "note"];
    fields.forEach(f => {
      if (old[f] !== n[f]) {
        changes.push(`${f}: ${old[f] || "empty"} → ${n[f] || "empty"}`);
      }
    });

    if (changes.length === 0) return "No changes recorded.";
    return (
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {changes.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
    );
  }
  
  return null;
}
