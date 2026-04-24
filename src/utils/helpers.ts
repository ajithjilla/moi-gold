export const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
};

export const fmtDateTime = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-IN");
  } catch {
    return String(d);
  }
};

export const EVENT_TYPES = [
  { value: "WEDDING", labelKey: "eventTypes.wedding", emoji: "💍" },
  { value: "ENGAGEMENT", labelKey: "eventTypes.engagement", emoji: "💑" },
  { value: "EAR", labelKey: "eventTypes.ear", emoji: "💎" },
  { value: "CRADLE", labelKey: "eventTypes.cradle", emoji: "🍼" },
  { value: "HOUSEWARMING", labelKey: "eventTypes.housewarming", emoji: "🏠" },
  { value: "BIRTHDAY", labelKey: "eventTypes.birthday", emoji: "🎂" },
  { value: "OTHER", labelKey: "eventTypes.other", emoji: "🎉" },
];

export const EVENT_TYPE_EMOJI = Object.fromEntries(
  EVENT_TYPES.map((e) => [e.value, e.emoji])
);

export const eventTypeLabel = (type, t) => {
  const e = EVENT_TYPES.find((x) => x.value === type);
  if (!e) return type;
  const translated = t(e.labelKey);
  return `${e.emoji} ${translated || type}`;
};

export const PAYMENT_METHODS = ["CASH", "GPAY", "PHONEPE", "PAYTM", "NEFT", "CHEQUE", "OTHER"];

export const DENOMS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

export const emptyDenoms = () =>
  Object.fromEntries(DENOMS.map((d) => [String(d), 0]));

export const denomTotal = (denoms) =>
  DENOMS.reduce((s, d) => s + d * (denoms?.[String(d)] || denoms?.[d] || 0), 0);

export const statusBadgeClass = (status) => {
  const s = String(status || "").toUpperCase();
  if (["ACTIVE", "COMPLETED"].includes(s)) return "badge-active";
  if (["PENDING", "UPCOMING"].includes(s)) return "badge-pending";
  if (["EXPIRED", "CANCELLED", "SUSPENDED"].includes(s)) return "badge-danger";
  return "badge-neutral";
};
