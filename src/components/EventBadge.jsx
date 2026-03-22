import { EVENT_TYPES } from "../data/constants.js";

export default function EventBadge({ type }) {
  const t = EVENT_TYPES.find((e) => e.value === type);
  if (!t) return null;
  return (
    <span className={`badge ${t.badge}`}>
      {t.emoji} {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}
