export default function Toggle({ checked, onChange, disabled, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="toggle">
        <input
          type="checkbox"
          checked={!!checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className="toggle-slider" />
      </span>
      {label && <span style={{ fontSize: 13 }}>{label}</span>}
    </label>
  );
}
