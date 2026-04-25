import { useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, BadgeDollarSign, Package2, Settings, ScrollText } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";
import AppLayout from "../../components/AppLayout";
import AdminDashboard from "./AdminDashboard";
import AdminAffiliates from "./AdminAffiliates";
import AdminEvents from "./AdminEvents";
import AdminRevenue from "./AdminRevenue";
import AdminPlans from "./AdminPlans";
import AdminSettings from "./AdminSettings";
import AdminAudit from "./AdminAudit";

export default function AdminApp() {
  const { t } = useLanguage();
  const menu = useMemo(
    () => [
      { to: "/admin", label: t("admin.menuOverview"), icon: LayoutDashboard, end: true },
      { to: "/admin/affiliates", label: t("admin.menuAffiliates"), icon: Users },
      { to: "/admin/events", label: t("admin.menuEvents"), icon: CalendarDays },
      { to: "/admin/revenue", label: t("admin.menuRevenue"), icon: BadgeDollarSign },
      { to: "/admin/plans", label: t("admin.menuPlans"), icon: Package2 },
      { to: "/admin/audit", label: t("admin.menuAudit"), icon: ScrollText },
      { to: "/admin/settings", label: t("admin.menuSettings"), icon: Settings },
    ],
    [t]
  );
  return (
    <AppLayout menu={menu}>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="affiliates" element={<AdminAffiliates />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="revenue" element={<AdminRevenue />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AppLayout>
  );
}
