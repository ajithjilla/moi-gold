import { useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CalendarDays, UserCog } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";
import AppLayout from "../../components/AppLayout";
import WriterEvents from "./WriterEvents";
import WriterEventDetail from "./WriterEventDetail";
import WriterProfile from "./WriterProfile";

export default function WriterApp() {
  const { t } = useLanguage();
  const menu = useMemo(
    () => [
      { to: "/writer", label: t("affiliate.menuEvents"), icon: CalendarDays, end: true },
      { to: "/writer/profile", label: t("nav.profile"), icon: UserCog },
    ],
    [t]
  );
  return (
    <AppLayout menu={menu}>
      <Routes>
        <Route index element={<WriterEvents />} />
        <Route path="events/:eventId" element={<WriterEventDetail />} />
        <Route path="profile" element={<WriterProfile />} />
        <Route path="*" element={<Navigate to="/writer" replace />} />
      </Routes>
    </AppLayout>
  );
}
