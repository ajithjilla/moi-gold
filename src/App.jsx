import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "./context/useAuth.js";
import Spinner from "./components/ui/Spinner.jsx";
import LoginPage from "./components/LoginPage.jsx";
import AdminApp from "./pages/admin/AdminApp.jsx";
import AffiliateApp from "./pages/affiliate/AffiliateApp.jsx";
import WriterApp from "./pages/writer/WriterApp.jsx";
import SharedEventPage from "./pages/public/SharedEventPage.jsx";
import NotFound from "./pages/NotFound.jsx";

function RequireAuth({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Loading…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={defaultRouteForRole(user.role)} replace />;
  }
  return children;
}

function defaultRouteForRole(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "AFFILIATE") return "/affiliate";
  if (role === "USER") return "/writer";
  return "/login";
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Loading…" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={defaultRouteForRole(user.role)} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" closeButton />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/share/:token" element={<SharedEventPage />} />
        <Route
          path="/admin/*"
          element={
            <RequireAuth role="ADMIN">
              <AdminApp />
            </RequireAuth>
          }
        />
        <Route
          path="/affiliate/*"
          element={
            <RequireAuth role="AFFILIATE">
              <AffiliateApp />
            </RequireAuth>
          }
        />
        <Route
          path="/writer/*"
          element={
            <RequireAuth role="USER">
              <WriterApp />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
