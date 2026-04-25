import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { DENOMS, PAYMENT_METHODS, denomTotal, emptyDenoms, fmt } from "../../../utils/helpers";
import { useLanguage } from "../../../context/useLanguage";
import type { Denoms, MoiEntry, MoiEntryPayload, PaymentMethod } from "../../../types/domain";

const RELATIONS = ["Uncle", "Aunt", "Friend", "Colleague", "Neighbor", "Relative", "Brother", "Sister", "Other"];

interface MoiEntryFormState {
  giver_name: string;
  amount: number;
  phone: string;
  address: string;
  relation: string;
  method: PaymentMethod;
  note: string;
  denoms: Denoms;
}

const emptyVal: MoiEntryFormState = {
  giver_name: "",
  amount: 0,
  phone: "",
  address: "",
  relation: "",
  method: "CASH",
  note: "",
  denoms: emptyDenoms(),
};

export default function MoiEntryForm({
  id,
  value,
  onSubmit,
}: {
  id: string;
  value?: Partial<MoiEntryPayload | MoiEntry> | null;
  onSubmit: (_payload: MoiEntryPayload) => void | Promise<void>;
}) {
  const { t } = useLanguage();
  const [state, setState] = useState<MoiEntryFormState>(emptyVal);
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
  const denomMismatch =
    state.method === "CASH" && showDenoms && denomSum > 0 && denomSum !== Number(state.amount);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amount = Number(state.amount);
    if (!state.giver_name.trim()) {
      toast.error(t("moiForm.giverRequired"));
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t("moiForm.amountInvalid"));
      return;
    }
    const useDenoms = state.method === "CASH" && showDenoms && denomSum > 0;
    if (useDenoms && denomSum !== amount) {
      toast.error(
        t("moiForm.denomMismatch").replace("{d}", fmt(denomSum)).replace("{a}", fmt(amount))
      );
      return;
    }
    const cleanedDenoms = useDenoms
      ? Object.fromEntries(
          Object.entries(state.denoms).filter(([, qty]) => Number(qty) > 0)
        )
      : null;
    const payload = {
      giver_name: state.giver_name.trim(),
      amount,
      phone: state.phone?.trim() || null,
      address: state.address?.trim() || null,
      relation: state.relation || null,
      method: state.method,
      note: state.note?.trim() || null,
      denoms: cleanedDenoms,
    };
    onSubmit(payload);
  };

  const setDenomQty = (d: number, qty: string | number) => {
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
          <label>{t("moiForm.giverLabel")}</label>
          <input
            value={state.giver_name}
            onChange={(e) => setState({ ...state, giver_name: e.target.value })}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>{t("moiForm.amountLabel")}</label>
          <input
            type="number"
            min="0"
            value={state.amount}
            onChange={(e) => setState({ ...state, amount: Number(e.target.value) })}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("moiForm.paymentMethod")}</label>
          <select
            value={state.method}
            onChange={(e) => {
              const method = e.target.value as PaymentMethod;
              setState({ ...state, method });
              if (method !== "CASH") setShowDenoms(false);
            }}
          >
            {PAYMENT_METHODS.map((m, i) => (
              <option key={m} value={m}>
                {t(`paymentMethods.${i}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>{t("moiForm.phone")}</label>
          <input value={state.phone || ""} onChange={(e) => setState({ ...state, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>{t("moiForm.relation")}</label>
          <select value={state.relation || ""} onChange={(e) => setState({ ...state, relation: e.target.value })}>
            <option value="">—</option>
            {RELATIONS.map((r, i) => (
              <option key={r} value={r}>
                {t(`relations.${i}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group full">
          <label>{t("moiForm.address")}</label>
          <input value={state.address || ""} onChange={(e) => setState({ ...state, address: e.target.value })} />
        </div>
        <div className="form-group full">
          <label>{t("moiForm.note")}</label>
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
              <div className="section-title">{t("moiForm.denomSection")}</div>
              <div className="text-xs text-muted">{t("moiForm.denomHint")}</div>
            </div>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowDenoms((v) => !v)}>
              {showDenoms ? t("moiForm.hide") : t("moiForm.enterDenoms")}
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
                <span>{t("moiForm.denomTotal")}</span>
                <span>{fmt(denomSum)}</span>
              </div>
              {denomMismatch && (
                <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>
                  {t("moiForm.denomMismatch")
                    .replace("{d}", fmt(denomSum))
                    .replace("{a}", fmt(Number(state.amount)))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </form>
  );
}
