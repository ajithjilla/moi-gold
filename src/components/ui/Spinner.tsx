export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="loading-center">
      <div className="spinner" />
      {label && <div style={{ marginTop: 12, fontSize: 13 }}>{label}</div>}
    </div>
  );
}
