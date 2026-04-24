import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, BadgeDollarSign, Package2, Settings, ScrollText } from "lucide-react";
import AppLayout from "../../components/AppLayout.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminAffiliates from "./AdminAffiliates.jsx";
import AdminEvents from "./AdminEvents.jsx";
import AdminRevenue from "./AdminRevenue.jsx";
import AdminPlans from "./AdminPlans.jsx";
import AdminSettings from "./AdminSettings.jsx";
import AdminAudit from "./AdminAudit.jsx";

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
