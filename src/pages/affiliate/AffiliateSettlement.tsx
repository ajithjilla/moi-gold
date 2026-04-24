import { useEffect, useState } from "react";
import { toast } from "sonner";
import { affiliateApi, reportsApi } from "../../api/client";
import { fmt, fmtDate } from "../../utils/helpers";
import Spinner from "../../components/ui/Spinner";
import Empty from "../../components/ui/Empty";

export default function AffiliateSettlement() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    affiliateApi
      .events()
      .then((es) => {
        setEvents(es);
        if (es.length) setSelected(es[0].id);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingData(true);
    reportsApi
      .settlement(selected)
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoadingData(false));
  }, [selected]);

  if (loading) return <Spinner />;
  if (events.length === 0) {
    return (
      <div className="card">
        <Empty title="No events yet" description="Create an event first to view settlement." />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Settlement</div>
          <div className="page-sub">Final cash and account breakdown for an event.</div>
        </div>
        <select
          className="input"
          value={selected || ""}
          onChange={(e) => setSelected(e.target.value)}
          style={{ maxWidth: 320 }}
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} — {fmtDate(e.date)}
            </option>
          ))}
        </select>
      </div>

      {loadingData || !data ? (
        <Spinner />
      ) : (
        <>
          <div className="settle-hero">
            <div className="settle-hero-label">Grand total</div>
            <div className="settle-hero-amount">{fmt(data.grandTotal)}</div>
            <div className="settle-hero-sub">
              {data.totalEntries} entries · {data.cashCount} cash · {data.digitalCount} digital
            </div>
          </div>

          <div className="settlement-grid" style={{ marginTop: 16 }}>
            <div className="settlement-card">
              <div className="settlement-card-label">Cash in hand</div>
              <div className="settlement-card-amount">{fmt(data.cashTotal)}</div>
            </div>
            <div className="settlement-card">
              <div className="settlement-card-label">In account</div>
              <div className="settlement-card-amount">{fmt(data.digitalTotal)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
