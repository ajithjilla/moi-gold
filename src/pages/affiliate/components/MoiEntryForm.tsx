import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, Calculator, Check, AlertTriangle } from "lucide-react";
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
  const [view, setView] = useState<"form" | "denom">("form");

  useEffect(() => {
    if (value) {
      setState({
        ...emptyVal,
        ...value,
        amount: Number(value.amount || 0),
        denoms: value.denoms ? { ...emptyDenoms(), ...value.denoms } : emptyDenoms(),
      });
    } else {
      setState(emptyVal);
    }
    setView("form");
  }, [value]);

  const denomSum = useMemo(() => denomTotal(state.denoms), [state.denoms]);
  const requiresDenom = state.method === "CASH";
  const denomEntered = denomSum > 0;
  const denomMatched = denomEntered && denomSum === Number(state.amount);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amount = Number(state.amount);
    if (!state.giver_name.trim()) {
      toast.error(t("moiForm.giverRequired"));
      setView("form");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t("moiForm.amountInvalid"));
      setView("form");
      return;
    }
    if (requiresDenom) {
      if (!denomEntered) {
        toast.error(t("moiForm.denomRequired"));
        setView("denom");
        return;
      }
      if (!denomMatched) {
        toast.error(
          t("moiForm.denomMismatch").replace("{d}", fmt(denomSum)).replace("{a}", fmt(amount))
        );
        setView("denom");
        return;
      }
    }

    const cleanedDenoms = requiresDenom
      ? Object.fromEntries(Object.entries(state.denoms).filter(([, qty]) => Number(qty) > 0))
      : null;

    const payload: MoiEntryPayload = {
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
    setState((s) => ({ ...s, denoms: next }));
  };

  const handleMethodChange = (method: PaymentMethod) => {
    setState((s) => ({
      ...s,
      method,
      denoms: method === "CASH" ? s.denoms : emptyDenoms(),
    }));
    if (method !== "CASH") setView("form");
  };

  const onConfirmDenom = () => {
    if (!denomEntered) {
      toast.error(t("moiForm.denomRequired"));
      return;
    }
    setState((s) => ({ ...s, amount: denomSum }));
    setView("form");
  };

  const denomStatusKey = !denomEntered
    ? "moiForm.denomNotEntered"
    : denomMatched
      ? "moiForm.denomMatched"
      : "moiForm.denomMismatchShort";

  return (
    <form id={id} onSubmit={submit} className="moi-form">
      {view === "form" ? (
        <div className="form-grid form-grid-compact">
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
            <label>{t("moiForm.paymentMethod")}</label>
            <select
              value={state.method}
              onChange={(e) => handleMethodChange(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map((m, i) => (
                <option key={m} value={m}>
                  {t(`paymentMethods.${i}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t("moiForm.amountLabel")}</label>
            <input
              type="number"
              min="0"
              value={state.amount || ""}
              onChange={(e) => setState({ ...state, amount: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("moiForm.phone")}</label>
            <input
              value={state.phone || ""}
              onChange={(e) => setState({ ...state, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>{t("moiForm.relation")}</label>
            <select
              value={state.relation || ""}
              onChange={(e) => setState({ ...state, relation: e.target.value })}
            >
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
            <input
              value={state.address || ""}
              onChange={(e) => setState({ ...state, address: e.target.value })}
            />
          </div>

          <div className="form-group full">
            <label>{t("moiForm.note")}</label>
            <input
              value={state.note || ""}
              onChange={(e) => setState({ ...state, note: e.target.value })}
              placeholder={t("moiForm.notePlaceholder")}
            />
          </div>

          {requiresDenom && (
            <div className="form-group full">
              <button
                type="button"
                className={`denom-trigger ${denomMatched ? "is-matched" : denomEntered ? "is-mismatch" : "is-required"}`}
                onClick={() => setView("denom")}
              >
                <span className="denom-trigger-icon">
                  {denomMatched ? <Check size={18} /> : denomEntered ? <AlertTriangle size={18} /> : <Calculator size={18} />}
                </span>
                <span className="denom-trigger-body">
                  <span className="denom-trigger-title">
                    {t("moiForm.denomSection")}
                    <span className="denom-required">*</span>
                  </span>
                  <span className="denom-trigger-sub">
                    {t(denomStatusKey)
                      .replace("{d}", fmt(denomSum))
                      .replace("{a}", fmt(Number(state.amount) || 0))}
                  </span>
                </span>
                <span className="denom-trigger-cta">
                  {denomEntered ? t("moiForm.editDenoms") : t("moiForm.enterDenoms")}
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="denom-view">
          <div className="denom-view-header">
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => setView("form")}
            >
              <ArrowLeft size={14} /> {t("common.back")}
            </button>
            <div className="denom-view-title">{t("moiForm.denomSection")}</div>
            <div className="denom-view-amount">
              <span className="text-muted text-xs">{t("moiForm.amountLabel")}</span>
              <strong>{fmt(Number(state.amount) || 0)}</strong>
            </div>
          </div>

          <div className="denom-view-hint">{t("moiForm.denomHint")}</div>

          <div className="denom-grid denom-grid-compact">
            {DENOMS.map((d) => (
              <div key={d} className="denom-row">
                <span className="denom-label">₹{d}</span>
                <input
                  className="denom-qty"
                  type="number"
                  min="0"
                  value={state.denoms[String(d)] || ""}
                  onChange={(e) => setDenomQty(d, e.target.value)}
                  placeholder="0"
                />
                <span className="denom-sub">{fmt(d * (state.denoms[String(d)] || 0))}</span>
              </div>
            ))}
          </div>

          <div className={`denom-total-bar ${denomMatched ? "matched" : denomEntered ? "mismatch" : ""}`}>
            <span>{t("moiForm.denomTotal")}</span>
            <span>{fmt(denomSum)}</span>
          </div>

          {denomEntered && !denomMatched && (
            <div className="denom-warn">
              <AlertTriangle size={14} />
              <span>
                {t("moiForm.denomMismatch")
                  .replace("{d}", fmt(denomSum))
                  .replace("{a}", fmt(Number(state.amount) || 0))}
              </span>
              <span className="denom-warn-help">{t("moiForm.denomConfirmHelp")}</span>
            </div>
          )}

          <div className="denom-view-actions">
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={onConfirmDenom}
              disabled={!denomEntered}
            >
              <Check size={16} /> {t("moiForm.confirmDenom")}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
