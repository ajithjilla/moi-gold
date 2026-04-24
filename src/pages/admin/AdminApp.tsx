import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, BadgeDollarSign, Package2, Settings, ScrollText } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import AdminDashboard from "./AdminDashboard";
import AdminAffiliates from "./AdminAffiliates";
import AdminEvents from "./AdminEvents";
import AdminRevenue from "./AdminRevenue";
import AdminPlans from "./AdminPlans";
import AdminSettings from "./AdminSettings";
import AdminAudit from "./AdminAudit";

const MENU = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/affiliates", label: "Affiliates", icon: Users },
  { to: "/admin/events", label: "All Events", icon: CalendarDays },
  { to: "/admin/revenue", label: "Revenue", icon: BadgeDollarSign },
  { to: "/admin/plans", label: "Plans", icon: Package2 },
  { to: "/admin/audit", label: "Audit log", icon: ScrollText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminApp() {
  return (
    <AppLayout menu={MENU}>
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
