import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { publicApi } from "../../api/client";
import Spinner from "../../components/ui/Spinner";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { fmt } from "../../utils/helpers";

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    publicApi
      .plans()
      .then(setPlans)
      .catch((e) => setErr(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Subscription Plans</div>
          <div className="page-sub">Plans and features offered to affiliates.</div>
        </div>
      </div>
      <ErrorBanner message={err} />

      <div className="grid-3">
        {plans.map((p) => (
          <div key={p.id} className={`plan-card${p.featured ? " featured" : ""}`}>
            <div className="plan-name">{p.name}</div>
            <div>
              <span className="plan-price">{fmt(p.price)}</span>
              <span className="plan-period">/{p.period}</span>
            </div>
            <ul className="plan-features">
              {p.features.map((f) => (
                <li key={f} className="plan-feature">
                  <Check size={14} /> <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
