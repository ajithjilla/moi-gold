import { Routes, Route, Navigate } from "react-router-dom";
import { CalendarDays, Gift, FileText, Wallet, UserCog } from "lucide-react";
import AppLayout from "../../components/AppLayout.jsx";
import AffiliateEvents from "./AffiliateEvents.jsx";
import EventDetail from "./EventDetail.jsx";
import AffiliateReports from "./AffiliateReports.jsx";
import AffiliateSettlement from "./AffiliateSettlement.jsx";
import AffiliateProfile from "./AffiliateProfile.jsx";

const MENU = [
  { to: "/affiliate", label: "My Events", icon: CalendarDays, end: true },
  { to: "/affiliate/reports", label: "Reports", icon: FileText },
  { to: "/affiliate/settlement", label: "Settlement", icon: Wallet },
  { to: "/affiliate/profile", label: "Profile", icon: UserCog },
];

export default function AffiliateApp() {
  return (
    <AppLayout menu={MENU}>
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
