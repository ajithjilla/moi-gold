import { Routes, Route, Navigate } from "react-router-dom";
import { CalendarDays, UserCog } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import WriterEvents from "./WriterEvents";
import WriterEventDetail from "./WriterEventDetail";
import WriterProfile from "./WriterProfile";

const MENU = [
  { to: "/writer", label: "My Events", icon: CalendarDays, end: true },
  { to: "/writer/profile", label: "Profile", icon: UserCog },
];

export default function WriterApp() {
  return (
    <AppLayout menu={MENU}>
      <Routes>
        <Route index element={<WriterEvents />} />
        <Route path="events/:eventId" element={<WriterEventDetail />} />
        <Route path="profile" element={<WriterProfile />} />
        <Route path="*" element={<Navigate to="/writer" replace />} />
      </Routes>
    </AppLayout>
  );
}
