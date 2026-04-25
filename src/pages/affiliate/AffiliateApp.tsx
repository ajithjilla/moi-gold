import { useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CalendarDays, FileText, Wallet, UserCog } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";
import AppLayout from "../../components/AppLayout";
import AffiliateEvents from "./AffiliateEvents";
import EventDetail from "./EventDetail";
import AffiliateReports from "./AffiliateReports";
import AffiliateSettlement from "./AffiliateSettlement";
import AffiliateProfile from "./AffiliateProfile";

export default function AffiliateApp() {
  const { t } = useLanguage();
  const menu = useMemo(
    () => [
      { to: "/affiliate", label: t("affiliate.menuEvents"), icon: CalendarDays, end: true },
      { to: "/affiliate/reports", label: t("affiliate.menuReports"), icon: FileText },
      { to: "/affiliate/settlement", label: t("affiliate.menuSettlement"), icon: Wallet },
      { to: "/affiliate/profile", label: t("nav.profile"), icon: UserCog },
    ],
    [t]
  );
  return (
    <AppLayout menu={menu}>
      <Routes>
        <Route index element={<AffiliateEvents />} />
        <Route path="events/:eventId" element={<EventDetail />} />
        <Route path="reports" element={<AffiliateReports />} />
        <Route path="settlement" element={<AffiliateSettlement />} />
        <Route path="profile" element={<AffiliateProfile />} />
        <Route path="*" element={<Navigate to="/affiliate" replace />} />
      </Routes>
    </AppLayout>
  );
}
