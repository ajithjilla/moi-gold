import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--cream)",
        padding: 24,
      }}
    >
      <div className="card" style={{ maxWidth: 480, textAlign: "center" }}>
        <div
          className="topbar-logo"
          style={{ width: 64, height: 64, fontSize: 32, margin: "0 auto 16px" }}
        >
          M
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            color: "var(--crimson)",
            marginBottom: 8,
          }}
        >
          Page not found
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Go home
        </Link>
      </div>
    </div>
  );
}
