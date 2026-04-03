import { useState, useEffect } from "react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Mukta:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #C8922A;
    --gold-light: #F0C060;
    --gold-dark: #8B6010;
    --crimson: #8B1A1A;
    --crimson-light: #C0392B;
    --deep: #1A0A00;
    --cream: #FDF6E3;
    --cream2: #F5E6C8;
    --text: #2C1810;
    --muted: #7A5C3A;
    --white: #FFFFFF;
    --success: #2E7D32;
    --card-bg: rgba(255,255,255,0.95);
    --shadow: 0 4px 24px rgba(139,26,26,0.10);
    --radius: 16px;
  }

  body { font-family: 'Mukta', sans-serif; background: var(--cream); color: var(--text); }

  .app { min-height: 100vh; }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--cream2); }
  ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 3px; }

  /* PATTERN BG */
  .pattern-bg {
    background-color: var(--crimson);
    background-image: radial-gradient(circle at 20% 50%, rgba(200,146,42,0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(200,146,42,0.2) 0%, transparent 40%),
                      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8922A' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  /* NAVBAR */
  .navbar {
    background: var(--deep);
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid var(--gold-dark);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .navbar-brand { display: flex; align-items: center; gap: 10px; }
  .navbar-logo {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--gold), var(--gold-dark));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    color: var(--deep);
    font-size: 20px;
  }
  .navbar-title { font-family: 'Playfair Display', serif; color: var(--gold-light); font-size: 20px; font-weight: 700; }
  .navbar-subtitle { color: var(--muted); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }
  .navbar-user { display: flex; align-items: center; gap: 12px; }
  .navbar-badge {
    background: var(--gold-dark);
    color: var(--cream);
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .btn-logout {
    background: transparent;
    border: 1px solid var(--crimson-light);
    color: var(--crimson-light);
    padding: 6px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-family: 'Mukta', sans-serif;
    transition: all 0.2s;
  }
  .btn-logout:hover { background: var(--crimson-light); color: white; }

  /* SIDEBAR */
  .layout { display: flex; min-height: calc(100vh - 64px); }
  .sidebar {
    width: 220px;
    background: var(--deep);
    padding: 24px 0;
    border-right: 1px solid var(--gold-dark);
    flex-shrink: 0;
  }
  .sidebar-section { padding: 8px 16px; margin-bottom: 4px; }
  .sidebar-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; padding: 0 8px; }
  .sidebar-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    border-radius: 10px;
    cursor: pointer;
    color: #8a7060;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    margin: 2px 8px;
  }
  .sidebar-item:hover { background: rgba(200,146,42,0.1); color: var(--gold-light); }
  .sidebar-item.active { background: linear-gradient(135deg, var(--gold-dark), #6B4A08); color: var(--gold-light); }
  .sidebar-icon { font-size: 18px; }

  /* MAIN CONTENT */
  .main { flex: 1; padding: 28px 32px; overflow-y: auto; background: var(--cream); }

  /* CARDS */
  .card {
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(200,146,42,0.12);
  }
  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--crimson);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* STAT CARDS */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card {
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 20px;
    border: 1px solid rgba(200,146,42,0.15);
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--gold), var(--gold-light));
  }
  .stat-icon { font-size: 28px; margin-bottom: 8px; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--crimson); }
  .stat-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

  /* BUTTONS */
  .btn {
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Mukta', sans-serif;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--crimson), var(--crimson-light));
    color: white;
    box-shadow: 0 4px 14px rgba(139,26,26,0.3);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,26,26,0.4); }
  .btn-gold {
    background: linear-gradient(135deg, var(--gold-dark), var(--gold));
    color: var(--deep);
    box-shadow: 0 4px 14px rgba(200,146,42,0.3);
  }
  .btn-gold:hover { transform: translateY(-1px); }
  .btn-outline {
    background: transparent;
    border: 1.5px solid var(--gold);
    color: var(--gold-dark);
  }
  .btn-outline:hover { background: var(--gold); color: var(--deep); }
  .btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 8px; }
  .btn-danger { background: #c62828; color: white; }
  .btn-success { background: var(--success); color: white; }

  /* TABLE */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead tr { background: linear-gradient(135deg, var(--crimson), #6B0000); }
  thead th { color: var(--gold-light); padding: 12px 16px; text-align: left; font-weight: 600; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
  tbody tr { border-bottom: 1px solid rgba(200,146,42,0.1); transition: background 0.15s; }
  tbody tr:hover { background: rgba(200,146,42,0.05); }
  tbody td { padding: 12px 16px; color: var(--text); }

  /* BADGE */
  .badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .badge-active { background: #E8F5E9; color: #2E7D32; }
  .badge-pending { background: #FFF8E1; color: #F57F17; }
  .badge-expired { background: #FFEBEE; color: #C62828; }
  .badge-wedding { background: #FCE4EC; color: #880E4F; }
  .badge-engagement { background: #E8EAF6; color: #283593; }
  .badge-ear { background: #FFF3E0; color: #E65100; }
  .badge-cradle { background: #E0F2F1; color: #00695C; }
  .badge-house { background: #F3E5F5; color: #6A1B9A; }
  .badge-birthday { background: #E3F2FD; color: #0D47A1; }

  /* FORM */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  input, select, textarea {
    padding: 10px 14px;
    border: 1.5px solid rgba(200,146,42,0.2);
    border-radius: 10px;
    font-family: 'Mukta', sans-serif;
    font-size: 14px;
    color: var(--text);
    background: white;
    transition: border-color 0.2s;
    outline: none;
  }
  input:focus, select:focus, textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,146,42,0.1); }
  textarea { resize: vertical; min-height: 80px; }

  /* LOGIN */
  .login-page {
    min-height: 100vh;
    display: flex;
  }
  .login-left {
    width: 45%;
    padding: 60px 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .login-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }
  .login-brand { margin-bottom: 48px; }
  .login-logo-big {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, var(--gold), var(--gold-dark));
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    font-size: 32px;
    color: var(--deep);
    margin-bottom: 16px;
    box-shadow: 0 8px 32px rgba(200,146,42,0.4);
  }
  .login-app-name { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--cream); line-height: 1.1; }
  .login-tagline { color: var(--gold-light); font-size: 14px; margin-top: 8px; opacity: 0.8; }
  .login-features { margin-top: 48px; display: flex; flex-direction: column; gap: 16px; }
  .login-feature { display: flex; align-items: flex-start; gap: 12px; }
  .feature-icon { font-size: 22px; margin-top: 2px; }
  .feature-text-title { color: var(--gold-light); font-weight: 600; font-size: 14px; }
  .feature-text-sub { color: rgba(200,146,42,0.6); font-size: 12px; margin-top: 2px; }

  .login-card {
    background: white;
    border-radius: 24px;
    padding: 40px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(26,10,0,0.3);
  }
  .login-card-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: var(--crimson); margin-bottom: 6px; }
  .login-card-sub { color: var(--muted); font-size: 13px; margin-bottom: 28px; }
  .role-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
  .role-tab {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    border: 1.5px solid rgba(200,146,42,0.2);
    background: transparent;
    cursor: pointer;
    font-family: 'Mukta', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--muted);
    transition: all 0.2s;
    text-align: center;
  }
  .role-tab.active { background: linear-gradient(135deg, var(--crimson), var(--crimson-light)); color: white; border-color: transparent; }

  /* PAGE HEADER */
  .page-header { margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--crimson); }
  .page-sub { color: var(--muted); font-size: 14px; margin-top: 4px; }

  /* SECTION TITLE */
  .section-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

  /* DIVIDER */
  .divider { height: 1px; background: rgba(200,146,42,0.15); margin: 20px 0; }

  /* MODAL OVERLAY */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(26,10,0,0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 200;
    padding: 20px;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: var(--cream);
    border-radius: 20px;
    padding: 32px;
    width: 100%;
    max-width: 680px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 30px 80px rgba(26,10,0,0.4);
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--crimson); }
  .btn-close { background: transparent; border: none; font-size: 22px; cursor: pointer; color: var(--muted); padding: 4px 8px; border-radius: 8px; }
  .btn-close:hover { background: rgba(200,146,42,0.1); }

  /* MOBILE VIEW WRAPPER */
  .mobile-view {
    max-width: 380px;
    margin: 0 auto;
    background: white;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(26,10,0,0.3);
    border: 6px solid var(--deep);
  }
  .mobile-header {
    background: linear-gradient(135deg, var(--crimson), #6B0000);
    padding: 24px 20px 32px;
    text-align: center;
    position: relative;
  }
  .mobile-header::after {
    content: '';
    position: absolute;
    bottom: -20px; left: 0; right: 0;
    height: 40px;
    background: white;
    border-radius: 20px 20px 0 0;
  }
  .mobile-event-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: white; }
  .mobile-event-type { color: var(--gold-light); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
  .mobile-date { color: rgba(255,255,255,0.7); font-size: 12px; }
  .mobile-body { padding: 28px 16px 16px; }
  .mobile-total {
    background: linear-gradient(135deg, var(--gold-dark), var(--gold));
    border-radius: 14px;
    padding: 16px;
    text-align: center;
    margin-bottom: 16px;
  }
  .mobile-total-label { color: var(--deep); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; }
  .mobile-total-amount { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: var(--deep); }
  .mobile-total-sub { font-size: 12px; color: rgba(26,10,0,0.6); margin-top: 2px; }
  .mobile-gift-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--cream);
    margin-bottom: 8px;
    border: 1px solid rgba(200,146,42,0.1);
  }
  .mobile-giver-name { font-weight: 600; font-size: 14px; color: var(--text); }
  .mobile-giver-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .mobile-amount { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--crimson); }

  /* SEARCH BAR */
  .search-wrap { position: relative; }
  .search-wrap input { padding-left: 38px; width: 100%; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 16px; }

  /* TOAST */
  .toast {
    position: fixed;
    bottom: 24px; right: 24px;
    background: var(--success);
    color: white;
    padding: 14px 20px;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 300;
    animation: slideUp 0.3s ease;
    display: flex; align-items: center; gap: 8px;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* EMPTY STATE */
  .empty-state { text-align: center; padding: 48px; color: var(--muted); }
  .empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }
  .empty-text { font-size: 16px; font-weight: 600; }
  .empty-sub { font-size: 13px; margin-top: 4px; }

  /* AMOUNTS */
  .amount-positive { color: var(--success); font-weight: 700; }
  .amount-tag { background: #E8F5E9; color: var(--success); padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }

  /* PLAN CARDS */
  .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .plan-card {
    border-radius: 16px;
    padding: 24px;
    border: 2px solid rgba(200,146,42,0.15);
    background: white;
    position: relative;
    overflow: hidden;
  }
  .plan-card.featured { border-color: var(--gold); }
  .plan-card.featured::before { content: 'POPULAR'; position: absolute; top: 12px; right: -20px; background: var(--gold); color: var(--deep); font-size: 9px; font-weight: 800; padding: 3px 28px; transform: rotate(45deg) translateX(10px); letter-spacing: 1px; }
  .plan-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--crimson); margin-bottom: 8px; }
  .plan-price { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: var(--text); }
  .plan-period { font-size: 12px; color: var(--muted); }
  .plan-features { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
  .plan-feature { font-size: 13px; color: var(--text); display: flex; gap: 6px; }

  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-4 { gap: 16px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-3 { margin-bottom: 12px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .mt-3 { margin-top: 12px; }
  .mt-4 { margin-top: 16px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .text-sm { font-size: 13px; }
  .text-xs { font-size: 11px; }
  .font-bold { font-weight: 700; }
  .text-crimson { color: var(--crimson); }
  .text-muted { color: var(--muted); }
  .text-gold { color: var(--gold); }

  /* SECTION HEADER STRIP */
  .section-strip {
    background: linear-gradient(90deg, var(--cream2), transparent);
    border-left: 4px solid var(--gold);
    padding: 10px 16px;
    border-radius: 0 10px 10px 0;
    margin-bottom: 16px;
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--crimson);
  }

  @media (max-width: 768px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .plans-grid { grid-template-columns: 1fr; }
    .login-left { display: none; }
    .form-grid { grid-template-columns: 1fr; }
  }
`;

// ============ DATA ============
const EVENT_TYPES = [
  { value: "wedding", label: "திருமணம் (Wedding)", emoji: "💍", badge: "badge-wedding" },
  { value: "engagement", label: "நிச்சயதார்த்தம் (Engagement)", emoji: "💑", badge: "badge-engagement" },
  { value: "ear", label: "காது குத்து (Ear Piercing)", emoji: "💎", badge: "badge-ear" },
  { value: "cradle", label: "தொட்டில் விழா (Cradle Ceremony)", emoji: "🍼", badge: "badge-cradle" },
  { value: "housewarming", label: "கிரகப்பிரவேசம் (Housewarming)", emoji: "🏠", badge: "badge-house" },
  { value: "birthday", label: "பிறந்தநாள் (Birthday)", emoji: "🎂", badge: "badge-birthday" },
];

const initialEvents = [
  { id: 1, name: "Murugan & Kavitha Wedding", type: "wedding", date: "2025-02-10", venue: "Madurai Palace", owner: "Murugan S", ownerPhone: "9876543210", ownerEmail: "murugan@gmail.com", affiliateId: 1, status: "completed" },
  { id: 2, name: "Priya's Ear Piercing Ceremony", type: "ear", date: "2025-02-18", venue: "Chennai Community Hall", owner: "Rajesh P", ownerPhone: "9865432100", ownerEmail: "rajesh@gmail.com", affiliateId: 1, status: "active" },
  { id: 3, name: "Karthik & Deepa Engagement", type: "engagement", date: "2025-03-05", venue: "Coimbatore Convention", owner: "Karthik R", ownerPhone: "9823456710", ownerEmail: "karthik@gmail.com", affiliateId: 2, status: "upcoming" },
];

const initialMoi = [
  { id: 1, eventId: 1, name: "Anbu Selvan", amount: 2000, phone: "9876501234", address: "12, Anna Nagar, Chennai", relation: "Uncle", method: "Cash", note: "Blessings" },
  { id: 2, eventId: 1, name: "Muthu Lakshmi", amount: 5000, phone: "9865430012", address: "5, Gandhi St, Madurai", relation: "Friend", method: "GPay", note: "" },
  { id: 3, eventId: 1, name: "Subramanian K", amount: 1500, phone: "9812345678", address: "78, Nehru Road, Trichy", relation: "Colleague", method: "Cash", note: "With love" },
  { id: 4, eventId: 2, name: "Viji Ramasamy", amount: 3000, phone: "9800123456", address: "3, Temple St, Thanjavur", relation: "Aunt", method: "Cash", note: "" },
  { id: 5, eventId: 2, name: "Durai Murugan", amount: 500, phone: "9755432100", address: "22, Main Road, Salem", relation: "Neighbor", method: "PhonePe", note: "" },
];

const initialAffiliates = [
  { id: 1, name: "Ravi Kumar", email: "ravi@gmail.com", phone: "9811234567", plan: "pro", status: "active", joinDate: "2024-11-01", eventsCount: 12, revenue: 3600 },
  { id: 2, name: "Prabhakaran S", email: "prabha@gmail.com", phone: "9822345678", plan: "basic", status: "active", joinDate: "2024-12-15", eventsCount: 5, revenue: 1500 },
  { id: 3, name: "Sivakami R", email: "siva@gmail.com", phone: "9833456789", plan: "pro", status: "pending", joinDate: "2025-01-20", eventsCount: 0, revenue: 0 },
];

// ============ HELPERS ============
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const eventBadge = (type) => {
  const t = EVENT_TYPES.find((e) => e.value === type);
  return t ? <span className={`badge ${t.badge}`}>{t.emoji} {t.value.charAt(0).toUpperCase() + t.value.slice(1)}</span> : null;
};

// ============ TOAST ============
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className="toast">✅ {msg}</div>;
}

// ============ LOGIN PAGE ============
function LoginPage({ onLogin }) {
  const [role, setRole] = useState("affiliate");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const roleMap = {
    admin: { email: "admin@moitech.in", pass: "admin123" },
    affiliate: { email: "ravi@gmail.com", pass: "ravi123" },
    owner: { email: "murugan@gmail.com", pass: "owner123" },
  };

  const handleLogin = () => {
    const demo = roleMap[role];
    if (email === demo.email && pass === demo.pass) {
      onLogin(role);
    } else {
      // auto-fill demo creds for demo purposes
      onLogin(role);
    }
  };

  const demos = { admin: roleMap.admin, affiliate: roleMap.affiliate, owner: roleMap.owner };

  return (
    <div className="login-page pattern-bg">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-big">M</div>
          <div className="login-app-name">மொய்<br />Moi Tech</div>
          <div className="login-tagline">Digital Gift Tracking for Tamil Nadu Functions</div>
        </div>
        <div className="login-features">
          {[
            { icon: "💍", title: "All Functions Covered", sub: "Wedding, Engagement, Ear Piercing, Cradle & more" },
            { icon: "📊", title: "Real-time Tracking", sub: "Event owners view gifts live on mobile" },
            { icon: "🖨️", title: "Print & Export", sub: "PDF reports for families at end of function" },
            { icon: "🌐", title: "Tamil + English", sub: "Bilingual interface for ease of use" },
          ].map((f, i) => (
            <div className="login-feature" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div>
                <div className="feature-text-title">{f.title}</div>
                <div className="feature-text-sub">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right" style={{ background: "rgba(26,10,0,0.2)", backdropFilter: "blur(10px)" }}>
        <div className="login-card">
          <div className="login-card-title">Welcome Back</div>
          <div className="login-card-sub">Sign in to your Moi Tech account</div>

          <div className="role-tabs">
            {[["admin", "🛡️ Admin"], ["affiliate", "💼 Affiliate"], ["owner", "📱 Event Owner"]].map(([r, label]) => (
              <button key={r} className={`role-tab ${role === r ? "active" : ""}`} onClick={() => { setRole(r); setEmail(demos[r].email); setPass(demos[r].pass); }}>{label}</button>
            ))}
          </div>

          <div style={{ marginBottom: 24, background: "rgba(200,146,42,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "var(--gold-dark)" }}>
            🔑 Demo: <strong>{demos[role].email}</strong> / <strong>{demos[role].pass}</strong>
          </div>

          <div className="form-group mb-3">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
          </div>
          <div className="form-group mb-4">
            <label>Password</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Enter password" />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={handleLogin}>
            Sign In →
          </button>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--muted)" }}>
            Need an account? Contact <strong style={{ color: "var(--gold-dark)" }}>admin@moitech.in</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ NAVBAR ============
function Navbar({ role, userName, onLogout }) {
  const roleLabel = { admin: "Super Admin", affiliate: "Affiliate", owner: "Event Owner" }[role];
  return (
    <div className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">M</div>
        <div>
          <div className="navbar-title">Moi Tech</div>
          <div className="navbar-subtitle">மொய் Management System</div>
        </div>
      </div>
      <div className="navbar-user">
        <span className="navbar-badge">{roleLabel}</span>
        <span style={{ color: "var(--cream)", fontSize: 14 }}>{userName}</span>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

// ============ ADMIN DASHBOARD ============
function AdminDashboard({ affiliates, setAffiliates, events, moi }) {
  const [page, setPage] = useState("overview");
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAff, setNewAff] = useState({ name: "", email: "", phone: "", plan: "basic" });

  const totalRevenue = affiliates.reduce((s, a) => s + a.revenue, 0);
  const totalMoiCollected = moi.reduce((s, m) => s + m.amount, 0);

  const addAffiliate = () => {
    setAffiliates([...affiliates, { ...newAff, id: Date.now(), status: "pending", joinDate: new Date().toISOString().split("T")[0], eventsCount: 0, revenue: 0 }]);
    setShowModal(false);
    setToast("Affiliate added successfully!");
    setNewAff({ name: "", email: "", phone: "", plan: "basic" });
  };

  const menuItems = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "affiliates", icon: "👥", label: "Affiliates" },
    { id: "events", icon: "🎉", label: "All Events" },
    { id: "revenue", icon: "💰", label: "Revenue" },
    { id: "plans", icon: "📋", label: "Plans" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-label" style={{ padding: "0 24px", marginBottom: 12 }}>Navigation</div>
        {menuItems.map((m) => (
          <div key={m.id} className={`sidebar-item ${page === m.id ? "active" : ""}`} onClick={() => setPage(m.id)}>
            <span className="sidebar-icon">{m.icon}</span> {m.label}
          </div>
        ))}
      </div>

      <div className="main">
        {page === "overview" && (
          <>
            <div className="page-header">
              <div><div className="page-title">📊 Dashboard Overview</div><div className="page-sub">Welcome back! Here's what's happening today.</div></div>
            </div>

            <div className="stats-grid">
              {[
                { icon: "👥", value: affiliates.length, label: "Total Affiliates" },
                { icon: "🎉", value: events.length, label: "Total Events" },
                { icon: "🎁", value: moi.length, label: "Moi Entries" },
                { icon: "💰", value: fmt(totalRevenue), label: "Total Revenue" },
              ].map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">🌟 Top Affiliates</div>
                {affiliates.sort((a, b) => b.revenue - a.revenue).slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center justify-between mb-3" style={{ padding: "10px 0", borderBottom: "1px solid rgba(200,146,42,0.1)" }}>
                    <div>
                      <div className="font-bold" style={{ fontSize: 14 }}>{a.name}</div>
                      <div className="text-xs text-muted">{a.eventsCount} events · {a.plan.toUpperCase()} plan</div>
                    </div>
                    <div className="amount-tag">{fmt(a.revenue)}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-title">🎉 Recent Events</div>
                {events.slice(0, 3).map((e) => (
                  <div key={e.id} className="flex items-center justify-between mb-3" style={{ padding: "10px 0", borderBottom: "1px solid rgba(200,146,42,0.1)" }}>
                    <div>
                      <div className="font-bold" style={{ fontSize: 14 }}>{e.name}</div>
                      <div className="text-xs text-muted">{e.date} · {e.venue}</div>
                    </div>
                    {eventBadge(e.type)}
                  </div>
                ))}
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-title">💳 Gift Collections Summary</div>
              <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {[
                  { label: "Total Moi Collected", value: fmt(totalMoiCollected) },
                  { label: "Avg. per Event", value: fmt(Math.round(totalMoiCollected / Math.max(events.length, 1))) },
                  { label: "Avg. per Entry", value: fmt(Math.round(totalMoiCollected / Math.max(moi.length, 1))) },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "16px", borderRight: i < 2 ? "1px solid rgba(200,146,42,0.15)" : "none" }}>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 700, color: "var(--crimson)" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {page === "affiliates" && (
          <>
            <div className="page-header">
              <div><div className="page-title">👥 Affiliates</div><div className="page-sub">Manage your registered affiliates</div></div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Affiliate</button>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>Name</th><th>Email</th><th>Phone</th><th>Plan</th><th>Status</th><th>Events</th><th>Revenue</th><th>Joined</th>
                  </tr></thead>
                  <tbody>
                    {affiliates.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.name}</strong></td>
                        <td style={{ color: "var(--muted)" }}>{a.email}</td>
                        <td>{a.phone}</td>
                        <td><span className="badge badge-active">{a.plan.toUpperCase()}</span></td>
                        <td><span className={`badge badge-${a.status === "active" ? "active" : a.status === "pending" ? "pending" : "expired"}`}>{a.status}</span></td>
                        <td>{a.eventsCount}</td>
                        <td className="amount-positive">{fmt(a.revenue)}</td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{a.joinDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {page === "events" && (
          <>
            <div className="page-header">
              <div><div className="page-title">🎉 All Events</div><div className="page-sub">Events across all affiliates</div></div>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Event Name</th><th>Type</th><th>Date</th><th>Venue</th><th>Owner</th><th>Moi Count</th><th>Total Moi</th><th>Status</th></tr></thead>
                  <tbody>
                    {events.map((e) => {
                      const eMoi = moi.filter((m) => m.eventId === e.id);
                      return (
                        <tr key={e.id}>
                          <td><strong>{e.name}</strong></td>
                          <td>{eventBadge(e.type)}</td>
                          <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.date}</td>
                          <td style={{ fontSize: 12 }}>{e.venue}</td>
                          <td>{e.owner}</td>
                          <td>{eMoi.length}</td>
                          <td className="amount-positive">{fmt(eMoi.reduce((s, m) => s + m.amount, 0))}</td>
                          <td><span className={`badge badge-${e.status === "completed" ? "active" : e.status === "active" ? "pending" : "expired"}`}>{e.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {page === "revenue" && (
          <>
            <div className="page-header">
              <div><div className="page-title">💰 Revenue</div><div className="page-sub">Your subscription earnings</div></div>
            </div>
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {[
                { icon: "💰", value: fmt(totalRevenue), label: "Total Revenue" },
                { icon: "📅", value: fmt(1800), label: "This Month" },
                { icon: "📈", value: affiliates.filter((a) => a.status === "active").length, label: "Active Subscribers" },
              ].map((s, i) => <div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>)}
            </div>
            <div className="card mt-4">
              <div className="card-title">💳 Revenue by Affiliate</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Affiliate</th><th>Plan</th><th>Events</th><th>Revenue</th><th>Status</th></tr></thead>
                  <tbody>
                    {affiliates.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.name}</strong></td>
                        <td><span className="badge badge-active">{a.plan.toUpperCase()}</span></td>
                        <td>{a.eventsCount}</td>
                        <td className="amount-positive">{fmt(a.revenue)}</td>
                        <td><span className={`badge badge-${a.status === "active" ? "active" : "pending"}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {page === "plans" && (
          <>
            <div className="page-header">
              <div><div className="page-title">📋 Subscription Plans</div><div className="page-sub">Manage your pricing plans</div></div>
            </div>
            <div className="plans-grid">
              {[
                { name: "Basic", price: "₹299", period: "/month", features: ["Up to 5 events/month", "50 Moi entries/event", "PDF Export", "Email support"], featured: false },
                { name: "Pro", price: "₹599", period: "/month", features: ["Unlimited events", "Unlimited Moi entries", "PDF + Excel Export", "WhatsApp notifications", "Priority support", "Tamil language UI"], featured: true },
                { name: "Enterprise", price: "₹1299", period: "/month", features: ["Everything in Pro", "Multiple operators", "Custom branding", "Dedicated support", "API access", "Analytics dashboard"], featured: false },
              ].map((p, i) => (
                <div key={i} className={`plan-card ${p.featured ? "featured" : ""}`}>
                  <div className="plan-name">{p.name}</div>
                  <div><span className="plan-price">{p.price}</span> <span className="plan-period">{p.period}</span></div>
                  <div className="divider" />
                  <div className="plan-features">
                    {p.features.map((f, j) => <div key={j} className="plan-feature"><span>✅</span><span>{f}</span></div>)}
                  </div>
                  <button className={`btn ${p.featured ? "btn-primary" : "btn-outline"} mt-4`} style={{ width: "100%", justifyContent: "center" }}>Select Plan</button>
                </div>
              ))}
            </div>
          </>
        )}

        {page === "settings" && (
          <div className="card">
            <div className="card-title">⚙️ System Settings</div>
            <div className="form-grid">
              <div className="form-group"><label>App Name</label><input defaultValue="Moi Tech" /></div>
              <div className="form-group"><label>Admin Email</label><input defaultValue="admin@moitech.in" /></div>
              <div className="form-group"><label>WhatsApp API Key</label><input placeholder="Enter API key" /></div>
              <div className="form-group"><label>Currency</label><select><option>INR (₹)</option></select></div>
              <div className="form-group full"><label>Welcome Message (Tamil)</label><textarea defaultValue="வாழ்த்துக்கள்! உங்கள் மொய் பட்டியல் புதுப்பிக்கப்பட்டது." /></div>
            </div>
            <button className="btn btn-primary mt-4">Save Settings</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">➕ Add New Affiliate</div>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>Full Name</label><input value={newAff.name} onChange={(e) => setNewAff({ ...newAff, name: e.target.value })} placeholder="Enter name" /></div>
              <div className="form-group"><label>Email</label><input value={newAff.email} onChange={(e) => setNewAff({ ...newAff, email: e.target.value })} placeholder="Enter email" /></div>
              <div className="form-group"><label>Phone</label><input value={newAff.phone} onChange={(e) => setNewAff({ ...newAff, phone: e.target.value })} placeholder="Enter phone" /></div>
              <div className="form-group"><label>Plan</label>
                <select value={newAff.plan} onChange={(e) => setNewAff({ ...newAff, plan: e.target.value })}>
                  <option value="basic">Basic - ₹299/mo</option>
                  <option value="pro">Pro - ₹599/mo</option>
                  <option value="enterprise">Enterprise - ₹1299/mo</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={addAffiliate}>Add Affiliate</button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ============ AFFILIATE DASHBOARD ============
function AffiliateDashboard({ events, setEvents, moi, setMoi }) {
  const [page, setPage] = useState("events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMoiModal, setShowMoiModal] = useState(false);
  const [editingMoi, setEditingMoi] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const myEvents = events.filter((e) => e.affiliateId === 1);

  const [newEvent, setNewEvent] = useState({ name: "", type: "wedding", date: "", venue: "", owner: "", ownerPhone: "", ownerEmail: "" });
  const [newMoi, setNewMoi] = useState({ name: "", amount: "", phone: "", address: "", relation: "", method: "Cash", note: "" });

  const addEvent = () => {
    setEvents([...events, { ...newEvent, id: Date.now(), affiliateId: 1, status: "upcoming" }]);
    setShowEventModal(false);
    setToast("Event created successfully!");
    setNewEvent({ name: "", type: "wedding", date: "", venue: "", owner: "", ownerPhone: "", ownerEmail: "" });
  };

  const saveMoi = () => {
    if (editingMoi) {
      setMoi(moi.map((m) => m.id === editingMoi.id ? { ...editingMoi, ...newMoi, amount: Number(newMoi.amount) } : m));
      setToast("Moi entry updated!");
    } else {
      setMoi([...moi, { ...newMoi, id: Date.now(), eventId: selectedEvent.id, amount: Number(newMoi.amount) }]);
      setToast("Moi entry added!");
    }
    setShowMoiModal(false);
    setEditingMoi(null);
    setNewMoi({ name: "", amount: "", phone: "", address: "", relation: "", method: "Cash", note: "" });
  };

  const openEdit = (m) => {
    setEditingMoi(m);
    setNewMoi({ name: m.name, amount: m.amount, phone: m.phone, address: m.address, relation: m.relation, method: m.method, note: m.note });
    setShowMoiModal(true);
  };

  const deleteMoi = (id) => { setMoi(moi.filter((m) => m.id !== id)); setToast("Entry deleted."); };

  const eventMoi = selectedEvent ? moi.filter((m) => m.eventId === selectedEvent.id) : [];
  const filteredMoi = eventMoi.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));
  const totalMoi = eventMoi.reduce((s, m) => s + m.amount, 0);

  const menuItems = [
    { id: "events", icon: "🎉", label: "My Events" },
    { id: "moi", icon: "🎁", label: "Moi Entry" },
    { id: "reports", icon: "📄", label: "Reports" },
  ];

  return (
    <div className="layout">
      <div className="sidebar">
        {menuItems.map((m) => (
          <div key={m.id} className={`sidebar-item ${page === m.id ? "active" : ""}`} onClick={() => { setPage(m.id); if (m.id !== "moi") setSelectedEvent(null); }}>
            <span className="sidebar-icon">{m.icon}</span> {m.label}
          </div>
        ))}
        {selectedEvent && page === "moi" && (
          <>
            <div className="divider" style={{ margin: "12px 16px" }} />
            <div style={{ padding: "8px 24px" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Active Event</div>
              <div style={{ fontSize: 13, color: "var(--gold-light)", fontWeight: 600 }}>{selectedEvent.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{eventMoi.length} entries · {fmt(totalMoi)}</div>
            </div>
          </>
        )}
      </div>

      <div className="main">
        {page === "events" && (
          <>
            <div className="page-header">
              <div><div className="page-title">🎉 My Events</div><div className="page-sub">Manage your function events</div></div>
              <button className="btn btn-primary" onClick={() => setShowEventModal(true)}>+ New Event</button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
              {[
                { icon: "🎉", value: myEvents.length, label: "Total Events" },
                { icon: "🎁", value: moi.filter((m) => myEvents.some((e) => e.id === m.eventId)).length, label: "Total Moi Entries" },
                { icon: "💰", value: fmt(moi.filter((m) => myEvents.some((e) => e.id === m.eventId)).reduce((s, m) => s + m.amount, 0)), label: "Total Moi Amount" },
              ].map((s, i) => <div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>)}
            </div>

            <div className="grid-2">
              {myEvents.map((e) => {
                const eMoi = moi.filter((m) => m.eventId === e.id);
                const total = eMoi.reduce((s, m) => s + m.amount, 0);
                const et = EVENT_TYPES.find((t) => t.value === e.type);
                return (
                  <div key={e.id} className="card" style={{ cursor: "pointer" }}>
                    <div className="flex items-center justify-between mb-3">
                      {eventBadge(e.type)}
                      <span className={`badge badge-${e.status === "completed" ? "active" : e.status === "active" ? "pending" : "expired"}`}>{e.status}</span>
                    </div>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>📅 {e.date} · 📍 {e.venue}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>👤 {e.owner} · 📞 {e.ownerPhone}</div>
                    <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(200,146,42,0.15)", paddingTop: 12 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Playfair Display, serif", color: "var(--crimson)" }}>{fmt(total)}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{eMoi.length} entries</div>
                      </div>
                      <button className="btn btn-gold btn-sm" onClick={() => { setSelectedEvent(e); setPage("moi"); }}>Enter Moi →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {page === "moi" && (
          <>
            {!selectedEvent ? (
              <>
                <div className="page-header">
                  <div><div className="page-title">🎁 Moi Entry</div><div className="page-sub">Select an event to enter gift details</div></div>
                </div>
                <div className="grid-2">
                  {myEvents.map((e) => (
                    <div key={e.id} className="card" style={{ cursor: "pointer" }} onClick={() => setSelectedEvent(e)}>
                      <div className="flex items-center gap-2 mb-2">{eventBadge(e.type)}</div>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 16, fontWeight: 700 }}>{e.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>📅 {e.date} · 📍 {e.venue}</div>
                      <button className="btn btn-primary btn-sm mt-4">Open Event →</button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="page-header">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <button className="btn btn-outline btn-sm" onClick={() => setSelectedEvent(null)}>← Back</button>
                      {eventBadge(selectedEvent.type)}
                    </div>
                    <div className="page-title">{selectedEvent.name}</div>
                    <div className="page-sub">📅 {selectedEvent.date} · 📍 {selectedEvent.venue} · 👤 {selectedEvent.owner}</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => { setEditingMoi(null); setNewMoi({ name: "", amount: "", phone: "", address: "", relation: "", method: "Cash", note: "" }); setShowMoiModal(true); }}>+ Add Moi Entry</button>
                </div>

                <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
                  {[
                    { icon: "🎁", value: eventMoi.length, label: "Total Entries" },
                    { icon: "💰", value: fmt(totalMoi), label: "Total Moi Amount" },
                    { icon: "📊", value: fmt(Math.round(totalMoi / Math.max(eventMoi.length, 1))), label: "Avg. per Entry" },
                  ].map((s, i) => <div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>)}
                </div>

                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="section-title">🎁 Moi Entries List</div>
                    <div className="search-wrap" style={{ width: 240 }}>
                      <span className="search-icon">🔍</span>
                      <input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                  </div>

                  {filteredMoi.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">🎁</div><div className="empty-text">No entries yet</div><div className="empty-sub">Click "Add Moi Entry" to start tracking</div></div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>#</th><th>Name</th><th>Amount</th><th>Phone</th><th>Address</th><th>Relation</th><th>Method</th><th>Actions</th></tr></thead>
                        <tbody>
                          {filteredMoi.map((m, i) => (
                            <tr key={m.id}>
                              <td style={{ color: "var(--muted)", fontWeight: 700 }}>{i + 1}</td>
                              <td><strong>{m.name}</strong>{m.note && <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.note}</div>}</td>
                              <td><span className="amount-tag">{fmt(m.amount)}</span></td>
                              <td style={{ fontSize: 13 }}>{m.phone}</td>
                              <td style={{ fontSize: 12, color: "var(--muted)", maxWidth: 150 }}>{m.address}</td>
                              <td style={{ fontSize: 12 }}>{m.relation}</td>
                              <td><span className="badge badge-pending">{m.method}</span></td>
                              <td>
                                <div className="flex gap-2">
                                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}>✏️ Edit</button>
                                  <button className="btn btn-danger btn-sm" onClick={() => deleteMoi(m.id)}>🗑️</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {page === "reports" && (
          <>
            <div className="page-header">
              <div><div className="page-title">📄 Reports</div><div className="page-sub">Export and print your Moi lists</div></div>
            </div>
            <div className="card">
              <div className="card-title">📋 Event Reports</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Event</th><th>Type</th><th>Date</th><th>Entries</th><th>Total Amount</th><th>Export</th></tr></thead>
                  <tbody>
                    {myEvents.map((e) => {
                      const eMoi = moi.filter((m) => m.eventId === e.id);
                      return (
                        <tr key={e.id}>
                          <td><strong>{e.name}</strong></td>
                          <td>{eventBadge(e.type)}</td>
                          <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.date}</td>
                          <td>{eMoi.length}</td>
                          <td className="amount-positive">{fmt(eMoi.reduce((s, m) => s + m.amount, 0))}</td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-gold btn-sm">🖨️ Print</button>
                              <button className="btn btn-outline btn-sm">📥 PDF</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🎉 Create New Event</div>
              <button className="btn-close" onClick={() => setShowEventModal(false)}>✕</button>
            </div>
            <div className="section-strip">Event Details</div>
            <div className="form-grid mb-4">
              <div className="form-group full"><label>Event / Function Name</label><input value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} placeholder="e.g. Murugan & Kavitha Wedding" /></div>
              <div className="form-group"><label>Event Type</label>
                <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
                  {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Event Date</label><input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} /></div>
              <div className="form-group full"><label>Venue</label><input value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} placeholder="Hall name, city" /></div>
            </div>
            <div className="section-strip">Event Owner Details</div>
            <div className="form-grid">
              <div className="form-group"><label>Owner / Host Name</label><input value={newEvent.owner} onChange={(e) => setNewEvent({ ...newEvent, owner: e.target.value })} placeholder="Full name" /></div>
              <div className="form-group"><label>Owner Phone</label><input value={newEvent.ownerPhone} onChange={(e) => setNewEvent({ ...newEvent, ownerPhone: e.target.value })} placeholder="Mobile number" /></div>
              <div className="form-group full"><label>Owner Email (for login)</label><input value={newEvent.ownerEmail} onChange={(e) => setNewEvent({ ...newEvent, ownerEmail: e.target.value })} placeholder="Email for event owner login" /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={addEvent}>Create Event</button>
              <button className="btn btn-outline" onClick={() => setShowEventModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showMoiModal && (
        <div className="modal-overlay" onClick={() => setShowMoiModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingMoi ? "✏️ Edit Moi Entry" : "🎁 Add Moi Entry"}</div>
              <button className="btn-close" onClick={() => setShowMoiModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>Gift Giver Name (மொய் கொடுப்பவர்)</label><input value={newMoi.name} onChange={(e) => setNewMoi({ ...newMoi, name: e.target.value })} placeholder="Full name" /></div>
              <div className="form-group"><label>Amount / தொகை (₹)</label><input type="number" value={newMoi.amount} onChange={(e) => setNewMoi({ ...newMoi, amount: e.target.value })} placeholder="Enter amount" /></div>
              <div className="form-group"><label>Phone Number</label><input value={newMoi.phone} onChange={(e) => setNewMoi({ ...newMoi, phone: e.target.value })} placeholder="Mobile number" /></div>
              <div className="form-group"><label>Relation</label>
                <select value={newMoi.relation} onChange={(e) => setNewMoi({ ...newMoi, relation: e.target.value })}>
                  {["Uncle", "Aunt", "Friend", "Colleague", "Neighbor", "Relative", "Brother", "Sister", "Other"].map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Payment Method</label>
                <select value={newMoi.method} onChange={(e) => setNewMoi({ ...newMoi, method: e.target.value })}>
                  {["Cash", "GPay", "PhonePe", "Paytm", "NEFT", "Cheque"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group full"><label>Address</label><input value={newMoi.address} onChange={(e) => setNewMoi({ ...newMoi, address: e.target.value })} placeholder="City / Area" /></div>
              <div className="form-group full"><label>Note (Optional)</label><input value={newMoi.note} onChange={(e) => setNewMoi({ ...newMoi, note: e.target.value })} placeholder="Any note or message" /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={saveMoi}>{editingMoi ? "Update Entry" : "Add Entry"}</button>
              <button className="btn btn-outline" onClick={() => setShowMoiModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ============ EVENT OWNER VIEW (MOBILE) ============
function OwnerView({ events, moi }) {
  const myEvent = events.find((e) => e.ownerEmail === "murugan@gmail.com") || events[0];
  const eventMoi = moi.filter((m) => m.eventId === myEvent?.id);
  const total = eventMoi.reduce((s, m) => s + m.amount, 0);
  const [search, setSearch] = useState("");
  const filtered = eventMoi.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="main" style={{ background: "linear-gradient(135deg, #f0e6d0 0%, #e8d5b0 100%)", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 20px" }}>
      <div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>📱 Event Owner Mobile View</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>This is how the event owner sees their Moi list on mobile</div>
        </div>

        <div className="mobile-view">
          <div className="mobile-header">
            <div className="mobile-event-type">{EVENT_TYPES.find((t) => t.value === myEvent?.type)?.label || "Function"}</div>
            <div className="mobile-event-name">{myEvent?.name}</div>
            <div className="mobile-date">📅 {myEvent?.date} · 📍 {myEvent?.venue}</div>
          </div>

          <div className="mobile-body">
            <div className="mobile-total">
              <div className="mobile-total-label">மொத்த மொய் தொகை</div>
              <div className="mobile-total-amount">{fmt(total)}</div>
              <div className="mobile-total-sub">{eventMoi.length} gift givers · Live updating</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { icon: "🎁", value: eventMoi.length, label: "Entries" },
                { icon: "📊", value: fmt(Math.round(total / Math.max(eventMoi.length, 1))), label: "Average" },
              ].map((s, i) => (
                <div key={i} style={{ background: "var(--cream)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
                  <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: 16, color: "var(--crimson)" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ position: "relative", marginBottom: 12 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
              <input placeholder="Search gift giver..." style={{ width: "100%", paddingLeft: 32, fontSize: 13 }} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {filtered.map((m, i) => (
                <div key={m.id} className="mobile-gift-item">
                  <div>
                    <div className="mobile-giver-name">{i + 1}. {m.name}</div>
                    <div className="mobile-giver-sub">📞 {m.phone} · {m.relation}</div>
                  </div>
                  <div className="mobile-amount">{fmt(m.amount)}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: "12px", background: "rgba(200,146,42,0.1)", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--gold-dark)", fontWeight: 600 }}>🔴 LIVE · Auto-refreshing every 30 seconds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [role, setRole] = useState(null);
  const [events, setEvents] = useState(initialEvents);
  const [moi, setMoi] = useState(initialMoi);
  const [affiliates, setAffiliates] = useState(initialAffiliates);

  const users = { admin: "Admin", affiliate: "Ravi Kumar", owner: "Murugan S" };

  if (!role) return (
    <>
      <style>{style}</style>
      <LoginPage onLogin={setRole} />
    </>
  );

  return (
    <>
      <style>{style}</style>
      <div className="app">
        <Navbar role={role} userName={users[role]} onLogout={() => setRole(null)} />
        {role === "admin" && <AdminDashboard affiliates={affiliates} setAffiliates={setAffiliates} events={events} moi={moi} />}
        {role === "affiliate" && <AffiliateDashboard events={events} setEvents={setEvents} moi={moi} setMoi={setMoi} />}
        {role === "owner" && <OwnerView events={events} moi={moi} />}
      </div>
    </>
  );
}
