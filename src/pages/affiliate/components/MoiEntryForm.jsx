import { useEffect, useMemo, useState } from "react";
import { DENOMS, PAYMENT_METHODS, denomTotal, emptyDenoms, fmt } from "../../../utils/helpers.js";

const RELATIONS = ["Uncle", "Aunt", "Friend", "Colleague", "Neighbor", "Relative", "Brother", "Sister", "Other"];

const emptyVal = {
  giver_name: "",
  amount: 0,
  phone: "",
  address: "",
  relation: "",
  method: "CASH",
  note: "",
  denoms: emptyDenoms(),
};

export default function MoiEntryForm({ id, value, onSubmit }) {
  const [state, setState] = useState(emptyVal);
  const [showDenoms, setShowDenoms] = useState(false);

  useEffect(() => {
    if (value) {
      setState({
        ...emptyVal,
        ...value,
        amount: Number(value.amount || 0),
        denoms: value.denoms ? { ...emptyDenoms(), ...value.denoms } : emptyDenoms(),
      });
      setShowDenoms(!!value.denoms && value.method === "CASH");
    } else {
      setState(emptyVal);
    }
  }, [value]);

  const denomSum = useMemo(() => denomTotal(state.denoms), [state.denoms]);

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      giver_name: state.giver_name.trim(),
      amount: Number(state.amount),
      phone: state.phone?.trim() || null,
      address: state.address?.trim() || null,
      relation: state.relation || null,
      method: state.method,
      note: state.note?.trim() || null,
      denoms: state.method === "CASH" && showDenoms ? state.denoms : null,
    };
    onSubmit(payload);
  };

  const setDenomQty = (d, qty) => {
    const n = Math.max(0, Number(qty) || 0);
    const next = { ...state.denoms, [String(d)]: n };
    const total = denomTotal(next);
    setState((s) => ({
      ...s,
      denoms: next,
      amount: showDenoms ? total : s.amount,
    }));
  };

  return (
    <form id={id} onSubmit={submit}>
      <div className="form-grid">
        <div className="form-group full">
          <label>Gift giver name</label>
          <input
            value={state.giver_name}
            onChange={(e) => setState({ ...state, giver_name: e.target.value })}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            min="0"
            value={state.amount}
            onChange={(e) => setState({ ...state, amount: Number(e.target.value) })}
            required
          />
        </div>
        <div className="form-group">
          <label>Payment method</label>
          <select
            value={state.method}
            onChange={(e) => {
              setState({ ...state, method: e.target.value });
              if (e.target.value !== "CASH") setShowDenoms(false);
            }}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={state.phone || ""} onChange={(e) => setState({ ...state, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Relation</label>
          <select value={state.relation || ""} onChange={(e) => setState({ ...state, relation: e.target.value })}>
            <option value="">—</option>
            {RELATIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group full">
          <label>Address</label>
          <input value={state.address || ""} onChange={(e) => setState({ ...state, address: e.target.value })} />
        </div>
        <div className="form-group full">
          <label>Note (optional)</label>
          <textarea rows={2} value={state.note || ""} onChange={(e) => setState({ ...state, note: e.target.value })} />
        </div>
      </div>

      {state.method === "CASH" && (
        <div className="denom-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div>
              <div className="section-title">Cash denomination (optional)</div>
              <div className="text-xs text-muted">Enter qty of each note/coin — amount auto-fills.</div>
            </div>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowDenoms((v) => !v)}>
              {showDenoms ? "Hide" : "Enter denominations"}
            </button>
          </div>
          {showDenoms && (
            <>
              <div className="denom-grid">
                {DENOMS.map((d) => (
                  <div key={d} className="denom-row">
                    <span className="denom-label">₹{d}</span>
                    <input
                      className="denom-qty"
                      type="number"
                      min="0"
                      value={state.denoms[String(d)] || 0}
                      onChange={(e) => setDenomQty(d, e.target.value)}
                    />
                    <span className="denom-sub">{fmt(d * (state.denoms[String(d)] || 0))}</span>
                  </div>
                ))}
              </div>
              <div className="denom-total-bar">
                <span>Denomination total</span>
                <span>{fmt(denomSum)}</span>
              </div>
              {denomSum !== Number(state.amount) && (
                <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>
                  Denomination total doesn't match amount.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </form>
  );
}
