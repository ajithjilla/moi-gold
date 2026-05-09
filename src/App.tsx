import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { useAuth } from "./context/useAuth";
import { useLanguage } from "./context/useLanguage";
import Spinner from "./components/ui/Spinner";
import LoginPage from "./components/LoginPage";
import AdminApp from "./pages/admin/AdminApp";
import AffiliateApp from "./pages/affiliate/AffiliateApp";
import WriterApp from "./pages/writer/WriterApp";
import SharedEventPage from "./pages/public/SharedEventPage";
import NotFound from "./pages/NotFound";
import type { Role } from "./types/domain";

function AppLoading() {
  const { t } = useLanguage();
  return <Spinner label={t("common.loading")} />;
}

function RequireAuth({ role, children }: { role?: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AppLoading />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user.role !== role) {
    return <Navigate to={defaultRouteForRole(user.role)} replace />;
  }
  return children;
}

function defaultRouteForRole(role?: Role) {
  if (role === "ADMIN") return "/admin";
  if (role === "AFFILIATE") return "/affiliate";
  if (role === "USER") return "/writer";
  return "/login";
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <AppLoading />;
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
