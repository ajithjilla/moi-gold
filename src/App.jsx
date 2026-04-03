import { useState, useEffect } from "react";
import { useLanguage } from "./context/useLanguage.js";
import LanguageToggle from "./components/LanguageToggle.jsx";

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
    position: relative;
  }
  .login-lang { position: absolute; top: 16px; right: 16px; z-index: 20; }
  .lang-toggle {
    display: inline-flex;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(200,146,42,0.35);
  }
  .lang-toggle button {
    background: rgba(255,255,255,0.08);
    color: var(--muted);
    border: none;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Mukta', sans-serif;
  }
  .lang-toggle button.active { background: var(--gold); color: var(--deep); }
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
  .plan-card.featured::before { content: attr(data-popular); position: absolute; top: 12px; right: -20px; background: var(--gold); color: var(--deep); font-size: 9px; font-weight: 800; padding: 3px 28px; transform: rotate(45deg) translateX(10px); letter-spacing: 1px; }
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

  /* ===== DARK MODE ===== */
  html[data-theme="dark"] {
    --cream: #110800;
    --cream2: #1c0f05;
    --card-bg: rgba(22,14,5,0.97);
    --text: #EDD9A3;
    --muted: #B08040;
    --shadow: 0 4px 24px rgba(0,0,0,0.6);
  }
  html[data-theme="dark"] body { background: #110800; }
  html[data-theme="dark"] input,
  html[data-theme="dark"] select,
  html[data-theme="dark"] textarea { background: #1c0f05; color: #EDD9A3; border-color: rgba(200,146,42,0.3); }
  html[data-theme="dark"] .login-card { background: #1a0f05; }
  html[data-theme="dark"] .login-card-title { color: var(--gold); }
  html[data-theme="dark"] .plan-card { background: #1c0f05; }
  html[data-theme="dark"] .mobile-view { border-color: var(--gold-dark); }
  html[data-theme="dark"] .modal { background: #1c0f05; }
  html[data-theme="dark"] .section-strip { background: linear-gradient(90deg, #1c0f05, transparent); }

  /* THEME TOGGLE */
  .btn-theme {
    background: transparent;
    border: 1px solid var(--gold-dark);
    color: var(--gold-light);
    padding: 5px 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
    line-height: 1;
  }
  .btn-theme:hover { background: rgba(200,146,42,0.15); }

  /* VOIDED ROWS */
  tr.moi-voided td { text-decoration: line-through; opacity: 0.4; }

  /* DENOMINATION */
  .denom-section { margin-top: 10px; padding: 14px; background: rgba(200,146,42,0.06); border-radius: 12px; border: 1px solid rgba(200,146,42,0.15); }
  .denom-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
  .denom-row { display: flex; align-items: center; gap: 6px; background: var(--card-bg); border-radius: 8px; padding: 6px 10px; border: 1px solid rgba(200,146,42,0.12); }
  .denom-label { font-size: 12px; font-weight: 700; color: var(--gold-dark); min-width: 38px; }
  .denom-qty { width: 50px !important; padding: 4px 6px !important; text-align: center; font-size: 13px !important; min-width: 0 !important; }
  .denom-sub { font-size: 11px; color: var(--muted); white-space: nowrap; }
  .denom-total-bar { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 8px 12px; background: rgba(200,146,42,0.12); border-radius: 8px; font-size: 13px; font-weight: 700; color: var(--gold-dark); }

  /* SETTLEMENT */
  .settlement-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .settlement-card { border-radius: var(--radius); padding: 28px 24px; text-align: center; }
  .settle-cash { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border: 2px solid #43A047; }
  .settle-bank { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border: 2px solid #1E88E5; }
  html[data-theme="dark"] .settle-cash { background: linear-gradient(135deg, #0a1f0d, #112416); border-color: #43A047; }
  html[data-theme="dark"] .settle-bank { background: linear-gradient(135deg, #0a1526, #0e1e36); border-color: #1E88E5; }
  .settle-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
  .settle-cash .settle-label { color: #2E7D32; }
  .settle-bank .settle-label { color: #1565C0; }
  html[data-theme="dark"] .settle-cash .settle-label { color: #66BB6A; }
  html[data-theme="dark"] .settle-bank .settle-label { color: #42A5F5; }
  .settle-amount { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; }
  .settle-cash .settle-amount { color: #2E7D32; }
  .settle-bank .settle-amount { color: #1565C0; }
  html[data-theme="dark"] .settle-cash .settle-amount { color: #66BB6A; }
  html[data-theme="dark"] .settle-bank .settle-amount { color: #42A5F5; }
  .settle-sub { font-size: 12px; margin-top: 6px; opacity: 0.65; }
  .settle-total-card { background: linear-gradient(135deg, var(--crimson), #6B0000); color: white; border-radius: var(--radius); padding: 24px; text-align: center; margin-bottom: 24px; }
  .settle-total-card .settle-amount { color: var(--gold-light); }
  .method-breakdown-table td { padding: 10px 14px; }

  /* WRITER CHIPS */
  .writers-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; min-height: 28px; }
  .writer-chip { display: inline-flex; align-items: center; gap: 7px; background: rgba(200,146,42,0.10); border: 1px solid rgba(200,146,42,0.30); border-radius: 20px; padding: 4px 8px 4px 12px; font-size: 12px; font-weight: 600; color: var(--gold-dark); }
  html[data-theme="dark"] .writer-chip { color: var(--gold-light); background: rgba(200,146,42,0.15); }
  .writer-chip .chip-phone { font-size: 10px; color: var(--muted); font-weight: 400; }
  .chip-remove { background: none; border: none; cursor: pointer; color: var(--muted); font-size: 15px; padding: 0; line-height: 1; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }
  .chip-remove:hover { color: #dc2626; background: rgba(220,38,38,0.12); }
  .writer-mini-form { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: end; margin-top: 8px; }
  .writer-mini-form input { font-size: 13px !important; padding: 8px 10px !important; }
  .written-by-tag { font-size: 10px; color: var(--gold-dark); margin-top: 3px; font-weight: 600; opacity: 0.8; }
  html[data-theme="dark"] .written-by-tag { color: var(--gold-light); }
`;

// ============ DATA ============
const EVENT_TYPE_META = [
  { value: "wedding", emoji: "💍", badge: "badge-wedding" },
  { value: "engagement", emoji: "💑", badge: "badge-engagement" },
  { value: "ear", emoji: "💎", badge: "badge-ear" },
  { value: "cradle", emoji: "🍼", badge: "badge-cradle" },
  { value: "housewarming", emoji: "🏠", badge: "badge-house" },
  { value: "birthday", emoji: "🎂", badge: "badge-birthday" },
];

// ============ DENOMINATION ============
const DENOMS = [500, 200, 100, 50, 20, 10, 5, 2, 1];
const emptyDenoms = () => Object.fromEntries(DENOMS.map((d) => [d, 0]));
const denomSum = (denoms) => DENOMS.reduce((s, d) => s + d * (denoms?.[d] || 0), 0);

const initialEvents = [
  { id: 1, name: "Murugan & Kavitha Wedding", type: "wedding", date: "2025-02-10", venue: "Madurai Palace", owner: "Murugan S", ownerPhone: "9876543210", ownerEmail: "murugan@gmail.com", affiliateId: 1, status: "completed", writers: [{ id: "w1", name: "Ravi Kumar", phone: "9876500001" }, { id: "w2", name: "Senthil M", phone: "9876500002" }] },
  { id: 2, name: "Priya's Ear Piercing Ceremony", type: "ear", date: "2025-02-18", venue: "Chennai Community Hall", owner: "Rajesh P", ownerPhone: "9865432100", ownerEmail: "rajesh@gmail.com", affiliateId: 1, status: "active", writers: [{ id: "w3", name: "Priya D", phone: "9865400001" }] },
  { id: 3, name: "Karthik & Deepa Engagement", type: "engagement", date: "2025-03-05", venue: "Coimbatore Convention", owner: "Karthik R", ownerPhone: "9823456710", ownerEmail: "karthik@gmail.com", affiliateId: 2, status: "upcoming", writers: [] },
];

const initialMoi = [
  { id: 1, eventId: 1, name: "Anbu Selvan", amount: 2000, phone: "9876501234", address: "12, Anna Nagar, Chennai", relation: "Uncle", method: "Cash", note: "Blessings", voided: false, denoms: { 500: 4, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 }, writtenBy: { name: "Ravi Kumar", phone: "9876500001" } },
  { id: 2, eventId: 1, name: "Muthu Lakshmi", amount: 5000, phone: "9865430012", address: "5, Gandhi St, Madurai", relation: "Friend", method: "GPay", note: "", voided: false, denoms: emptyDenoms(), writtenBy: { name: "Senthil M", phone: "9876500002" } },
  { id: 3, eventId: 1, name: "Subramanian K", amount: 1500, phone: "9812345678", address: "78, Nehru Road, Trichy", relation: "Colleague", method: "Cash", note: "With love", voided: false, denoms: { 500: 3, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 }, writtenBy: { name: "Ravi Kumar", phone: "9876500001" } },
  { id: 4, eventId: 2, name: "Viji Ramasamy", amount: 3000, phone: "9800123456", address: "3, Temple St, Thanjavur", relation: "Aunt", method: "Cash", note: "", voided: false, denoms: { 500: 6, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 }, writtenBy: { name: "Priya D", phone: "9865400001" } },
  { id: 5, eventId: 2, name: "Durai Murugan", amount: 500, phone: "9755432100", address: "22, Main Road, Salem", relation: "Neighbor", method: "PhonePe", note: "", voided: false, denoms: emptyDenoms(), writtenBy: { name: "Priya D", phone: "9865400001" } },
];

const initialAffiliates = [
  { id: 1, name: "Ravi Kumar", email: "ravi@gmail.com", phone: "9811234567", plan: "pro", status: "active", joinDate: "2024-11-01", eventsCount: 12, revenue: 3600 },
  { id: 2, name: "Prabhakaran S", email: "prabha@gmail.com", phone: "9822345678", plan: "basic", status: "active", joinDate: "2024-12-15", eventsCount: 5, revenue: 1500 },
  { id: 3, name: "Sivakami R", email: "siva@gmail.com", phone: "9833456789", plan: "pro", status: "pending", joinDate: "2025-01-20", eventsCount: 0, revenue: 0 },
];

// ============ HELPERS ============
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const eventBadge = (type, t) => {
  const meta = EVENT_TYPE_META.find((e) => e.value === type);
  if (!meta) return null;
  const label = t(`eventTypes.${type}`);
  return (
    <span className={`badge ${meta.badge}`}>
      {meta.emoji} {label}
    </span>
  );
};

// ============ RECEIPT PRINT ============
const printReceiptFn = (entry, event) => {
  const denomLines = entry.denoms
    ? DENOMS.filter((d) => entry.denoms[d] > 0)
        .map((d) => `<tr><td style="padding:3px 8px">₹${d} × ${entry.denoms[d]}</td><td style="padding:3px 8px;text-align:right;font-weight:700">₹${(Number(d) * Number(entry.denoms[d])).toLocaleString("en-IN")}</td></tr>`)
        .join("")
    : "";
  const w = window.open("", "_blank", "width=440,height=700");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Moi Receipt</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:24px;color:#2C1810;background:#fff}
.hdr{text-align:center;border-bottom:2px dashed #C8922A;padding-bottom:14px;margin-bottom:16px}
.logo{font-size:26px;font-weight:900;color:#8B1A1A}
.sub{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A5C3A;margin-top:2px}
.rcpt-no{font-size:10px;color:#7A5C3A;margin-top:6px}
.row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0e0c0;font-size:13px}
.lbl{color:#7A5C3A;font-weight:600}.val{font-weight:700}
.amt{text-align:center;background:linear-gradient(135deg,#C8922A,#8B6010);color:#fff;border-radius:10px;padding:14px;margin:14px 0}
.amt-big{font-size:32px;font-weight:900}.amt-method{font-size:11px;opacity:.8;margin-top:2px}
.denom-tbl{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px}
.ftr{text-align:center;margin-top:18px;padding-top:12px;border-top:2px dashed #C8922A;font-size:11px;color:#7A5C3A}
@media print{body{padding:6px}}</style></head><body>
<div class="hdr"><div class="logo">மொய் Tech</div><div class="sub">Moi Management System</div>
<div class="rcpt-no">Receipt #${String(entry.id).slice(-8).toUpperCase()} &nbsp;|&nbsp; ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</div></div>
<div style="margin-bottom:12px">
<div class="row"><span class="lbl">Event</span><span class="val">${event?.name||""}</span></div>
<div class="row"><span class="lbl">Date</span><span class="val">${event?.date||""}</span></div>
<div class="row"><span class="lbl">Venue</span><span class="val">${event?.venue||""}</span></div></div>
<div class="amt"><div class="amt-big">₹${Number(entry.amount).toLocaleString("en-IN")}</div><div class="amt-method">${entry.method}</div></div>
<div style="margin-bottom:12px">
<div class="row"><span class="lbl">From</span><span class="val">${entry.name}</span></div>
<div class="row"><span class="lbl">Phone</span><span class="val">${entry.phone}</span></div>
<div class="row"><span class="lbl">Relation</span><span class="val">${entry.relation}</span></div>
${entry.address?`<div class="row"><span class="lbl">Address</span><span class="val">${entry.address}</span></div>`:""}
${entry.note?`<div class="row"><span class="lbl">Note</span><span class="val">${entry.note}</span></div>`:""}</div>
${denomLines?`<div style="margin-bottom:12px"><div style="font-size:11px;font-weight:700;color:#7A5C3A;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Cash Denomination</div>
<table class="denom-tbl">${denomLines}</table></div>`:""}
<div class="ftr"><div>வாழ்த்துக்கள்! · Congratulations!</div><div style="margin-top:4px">Powered by Moi Tech</div></div>
</body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); }, 500);
};

// ============ PDF REPORT ============
const generateEventPDF = (eventData, moiData) => {
  const active = moiData.filter((m) => !m.voided);
  const total = active.reduce((s, m) => s + m.amount, 0);
  const now = new Date().toLocaleString("en-IN");
  const rows = active.map((m, i) =>
    `<tr><td>${i+1}</td><td>${m.name}</td><td style="font-weight:700">₹${Number(m.amount).toLocaleString("en-IN")}</td><td>${m.phone}</td><td>${m.relation}</td><td>${m.method}</td><td>${m.note||""}</td></tr>`
  ).join("");
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Event Report</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:28px;color:#2C1810}
h1{font-size:22px;color:#8B1A1A;margin-bottom:4px}
.meta{font-size:12px;color:#7A5C3A;margin-bottom:20px;line-height:1.8}
table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px}
thead tr{background:#8B1A1A;color:#F0C060}
thead th{padding:10px 12px;text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase}
tbody tr:nth-child(even){background:#fdf6e3}tbody tr:hover{background:#f5e6c8}
tbody td{padding:9px 12px;border-bottom:1px solid #f0e0c0}
.summary{background:linear-gradient(135deg,#C8922A,#8B6010);color:#fff;border-radius:10px;padding:18px 24px;display:flex;gap:40px}
.s-item{text-align:center}.s-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.8}
.s-value{font-size:24px;font-weight:900;margin-top:4px}
.ftr{margin-top:20px;font-size:10px;color:#7A5C3A;text-align:center;border-top:1px dashed #C8922A;padding-top:12px}
@media print{.no-print{display:none}}</style></head><body>
<h1>Moi Tech – Event Report</h1>
<div class="meta">
  <strong>${eventData.name}</strong><br>
  Date: ${eventData.date} &nbsp;|&nbsp; Venue: ${eventData.venue}<br>
  Owner: ${eventData.owner} &nbsp;|&nbsp; Phone: ${eventData.ownerPhone}<br>
  Generated: ${now}
</div>
<table><thead><tr><th>#</th><th>Name</th><th>Amount</th><th>Phone</th><th>Relation</th><th>Method</th><th>Note</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="summary">
  <div class="s-item"><div class="s-label">Total Moi</div><div class="s-value">₹${total.toLocaleString("en-IN")}</div></div>
  <div class="s-item"><div class="s-label">Total Entries</div><div class="s-value">${active.length}</div></div>
  <div class="s-item"><div class="s-label">Avg. per Entry</div><div class="s-value">₹${active.length?Math.round(total/active.length).toLocaleString("en-IN"):"0"}</div></div>
</div>
<div class="ftr">Voided entries excluded · Powered by Moi Tech</div>
<div class="no-print" style="text-align:center;margin-top:20px">
  <button onclick="window.print()" style="background:#8B1A1A;color:#F0C060;border:none;padding:10px 28px;font-size:14px;border-radius:8px;cursor:pointer">🖨️ Print / Save as PDF</button>
</div></body></html>`);
  w.document.close();
};

// ============ TOAST ============
function Toast({ msg, onClose }) {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return <div className="toast">✅ {msg}</div>;
}

// ============ LOGIN PAGE ============
function LoginPage({ onLogin }) {
  const { t } = useLanguage();
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

  const loginFeaturesRaw = t("loginFeatures");
  const featureList = Array.isArray(loginFeaturesRaw) ? loginFeaturesRaw : [];
  const featureIcons = ["💍", "📊", "🖨️", "🌐"];

  return (
    <div className="login-page pattern-bg">
      <div className="login-lang">
        <LanguageToggle />
      </div>
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-big">M</div>
          <div className="login-app-name">மொய்<br />Moi Tech</div>
          <div className="login-tagline">{t("login.tagline")}</div>
        </div>
        <div className="login-features">
          {featureList.map((f, i) => (
            <div className="login-feature" key={i}>
              <div className="feature-icon">{featureIcons[i] ?? "✨"}</div>
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
          <div className="login-card-title">{t("login.welcomeBack")}</div>
          <div className="login-card-sub">{t("login.signInSub")}</div>

          <div className="role-tabs">
            {[
              ["admin", t("login.roleAdmin")],
              ["affiliate", t("login.roleAffiliate")],
              ["owner", t("login.roleOwner")],
            ].map(([r, label]) => (
              <button key={r} className={`role-tab ${role === r ? "active" : ""}`} onClick={() => { setRole(r); setEmail(demos[r].email); setPass(demos[r].pass); }}>{label}</button>
            ))}
          </div>

          <div style={{ marginBottom: 24, background: "rgba(200,146,42,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "var(--gold-dark)" }}>
            🔑 {t("login.demo")} <strong>{demos[role].email}</strong> / <strong>{demos[role].pass}</strong>
          </div>

          <div className="form-group mb-3">
            <label>{t("login.email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("login.emailPh")} />
          </div>
          <div className="form-group mb-4">
            <label>{t("login.password")}</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder={t("login.passwordPh")} />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={handleLogin}>
            {t("login.signIn")}
          </button>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--muted)" }}>
            {t("login.needAccount")} <strong style={{ color: "var(--gold-dark)" }}>admin@moitech.in</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ NAVBAR ============
function Navbar({ role, userName, onLogout, theme, toggleTheme }) {
  const { t } = useLanguage();
  const roleLabel = { admin: t("nav.superAdmin"), affiliate: t("nav.affiliate"), owner: t("nav.eventOwner") }[role];
  return (
    <div className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">M</div>
        <div>
          <div className="navbar-title">{t("nav.brandTitle")}</div>
          <div className="navbar-subtitle">{t("nav.brandSubtitle")}</div>
        </div>
      </div>
      <div className="navbar-user">
        <button className="btn-theme" onClick={toggleTheme} title={t("theme.toggle")}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <LanguageToggle />
        <span className="navbar-badge">{roleLabel}</span>
        <span style={{ color: "var(--cream)", fontSize: 14 }}>{userName}</span>
        <button className="btn-logout" onClick={onLogout}>{t("nav.logout")}</button>
      </div>
    </div>
  );
}

// ============ ADMIN DASHBOARD ============
function AdminDashboard({ affiliates, setAffiliates, events, moi }) {
  const { t } = useLanguage();
  const [page, setPage] = useState("overview");
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAff, setNewAff] = useState({ name: "", email: "", phone: "", plan: "basic" });

  const totalRevenue = affiliates.reduce((s, a) => s + a.revenue, 0);
  const totalMoiCollected = moi.reduce((s, m) => s + m.amount, 0);

  const addAffiliate = () => {
    setAffiliates([...affiliates, { ...newAff, id: crypto.randomUUID(), status: "pending", joinDate: new Date().toISOString().split("T")[0], eventsCount: 0, revenue: 0 }]);
    setShowModal(false);
    setToast(t("admin.toastAffiliateAdded"));
    setNewAff({ name: "", email: "", phone: "", plan: "basic" });
  };

  const menuItems = [
    { id: "overview", icon: "📊", label: t("admin.menuOverview") },
    { id: "affiliates", icon: "👥", label: t("admin.menuAffiliates") },
    { id: "events", icon: "🎉", label: t("admin.menuEvents") },
    { id: "revenue", icon: "💰", label: t("admin.menuRevenue") },
    { id: "plans", icon: "📋", label: t("admin.menuPlans") },
    { id: "settings", icon: "⚙️", label: t("admin.menuSettings") },
  ];

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-label" style={{ padding: "0 24px", marginBottom: 12 }}>{t("admin.navLabel")}</div>
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
              <div><div className="page-title">{t("admin.dashTitle")}</div><div className="page-sub">{t("admin.dashSub")}</div></div>
            </div>

            <div className="stats-grid">
              {[
                { icon: "👥", value: affiliates.length, label: t("admin.statAffiliates") },
                { icon: "🎉", value: events.length, label: t("admin.statEvents") },
                { icon: "🎁", value: moi.length, label: t("admin.statMoiEntries") },
                { icon: "💰", value: fmt(totalRevenue), label: t("admin.statRevenue") },
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
                <div className="card-title">{t("admin.topAffiliates")}</div>
                {affiliates.sort((a, b) => b.revenue - a.revenue).slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center justify-between mb-3" style={{ padding: "10px 0", borderBottom: "1px solid rgba(200,146,42,0.1)" }}>
                    <div>
                      <div className="font-bold" style={{ fontSize: 14 }}>{a.name}</div>
                      <div className="text-xs text-muted">{a.eventsCount} {t("admin.eventsSuffix")} · {a.plan.toUpperCase()} {t("admin.planWord")}</div>
                    </div>
                    <div className="amount-tag">{fmt(a.revenue)}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-title">{t("admin.recentEvents")}</div>
                {events.slice(0, 3).map((e) => (
                  <div key={e.id} className="flex items-center justify-between mb-3" style={{ padding: "10px 0", borderBottom: "1px solid rgba(200,146,42,0.1)" }}>
                    <div>
                      <div className="font-bold" style={{ fontSize: 14 }}>{e.name}</div>
                      <div className="text-xs text-muted">{e.date} · {e.venue}</div>
                    </div>
                    {eventBadge(e.type, t)}
                  </div>
                ))}
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-title">{t("admin.giftSummary")}</div>
              <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {[
                  { label: t("admin.totalMoiCollected"), value: fmt(totalMoiCollected) },
                  { label: t("admin.avgPerEvent"), value: fmt(Math.round(totalMoiCollected / Math.max(events.length, 1))) },
                  { label: t("admin.avgPerEntry"), value: fmt(Math.round(totalMoiCollected / Math.max(moi.length, 1))) },
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
              <div><div className="page-title">{t("admin.affiliatesTitle")}</div><div className="page-sub">{t("admin.affiliatesSub")}</div></div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>{t("admin.addAffiliate")}</button>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>{t("admin.thName")}</th><th>{t("admin.thEmail")}</th><th>{t("admin.thPhone")}</th><th>{t("admin.thPlan")}</th><th>{t("admin.thStatus")}</th><th>{t("admin.thEvents")}</th><th>{t("admin.thRevenue")}</th><th>{t("admin.thJoined")}</th>
                  </tr></thead>
                  <tbody>
                    {affiliates.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.name}</strong></td>
                        <td style={{ color: "var(--muted)" }}>{a.email}</td>
                        <td>{a.phone}</td>
                        <td><span className="badge badge-active">{a.plan.toUpperCase()}</span></td>
                        <td><span className={`badge badge-${a.status === "active" ? "active" : a.status === "pending" ? "pending" : "expired"}`}>{t(`status.${a.status}`)}</span></td>
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
              <div><div className="page-title">{t("admin.allEventsTitle")}</div><div className="page-sub">{t("admin.allEventsSub")}</div></div>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>{t("admin.thEventName")}</th><th>{t("admin.thType")}</th><th>{t("admin.thDate")}</th><th>{t("admin.thVenue")}</th><th>{t("admin.thOwner")}</th><th>{t("admin.thMoiCount")}</th><th>{t("admin.thTotalMoi")}</th><th>{t("admin.thStatus")}</th></tr></thead>
                  <tbody>
                    {events.map((e) => {
                      const eMoi = moi.filter((m) => m.eventId === e.id);
                      return (
                        <tr key={e.id}>
                          <td><strong>{e.name}</strong></td>
                          <td>{eventBadge(e.type, t)}</td>
                          <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.date}</td>
                          <td style={{ fontSize: 12 }}>{e.venue}</td>
                          <td>{e.owner}</td>
                          <td>{eMoi.length}</td>
                          <td className="amount-positive">{fmt(eMoi.reduce((s, m) => s + m.amount, 0))}</td>
                          <td><span className={`badge badge-${e.status === "completed" ? "active" : e.status === "active" ? "pending" : "expired"}`}>{t(`status.${e.status}`)}</span></td>
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
              <div><div className="page-title">{t("admin.revenueTitle")}</div><div className="page-sub">{t("admin.revenueSub")}</div></div>
            </div>
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {[
                { icon: "💰", value: fmt(totalRevenue), label: t("admin.statRevenue") },
                { icon: "📅", value: fmt(1800), label: t("admin.thisMonth") },
                { icon: "📈", value: affiliates.filter((a) => a.status === "active").length, label: t("admin.activeSubscribers") },
              ].map((s, i) => <div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>)}
            </div>
            <div className="card mt-4">
              <div className="card-title">{t("admin.revByAffiliate")}</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>{t("admin.menuAffiliates")}</th><th>{t("admin.thPlan")}</th><th>{t("admin.thEvents")}</th><th>{t("admin.thRevenue")}</th><th>{t("admin.thStatus")}</th></tr></thead>
                  <tbody>
                    {affiliates.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.name}</strong></td>
                        <td><span className="badge badge-active">{a.plan.toUpperCase()}</span></td>
                        <td>{a.eventsCount}</td>
                        <td className="amount-positive">{fmt(a.revenue)}</td>
                        <td><span className={`badge badge-${a.status === "active" ? "active" : "pending"}`}>{t(`status.${a.status}`)}</span></td>
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
              <div><div className="page-title">{t("admin.plansTitle")}</div><div className="page-sub">{t("admin.plansSub")}</div></div>
            </div>
            <div className="plans-grid">
              {[
                { name: t("admin.planBasic"), price: "₹299", features: t("plans.basic.features"), featured: false },
                { name: t("admin.planPro"), price: "₹599", features: t("plans.pro.features"), featured: true },
                { name: t("admin.planEnterprise"), price: "₹1299", features: t("plans.enterprise.features"), featured: false },
              ].map((p, i) => (
                <div key={i} className={`plan-card ${p.featured ? "featured" : ""}`} data-popular={p.featured ? t("admin.popular") : undefined}>
                  <div className="plan-name">{p.name}</div>
                  <div><span className="plan-price">{p.price}</span> <span className="plan-period">{t("admin.perMonth")}</span></div>
                  <div className="divider" />
                  <div className="plan-features">
                    {(Array.isArray(p.features) ? p.features : []).map((f, j) => <div key={j} className="plan-feature"><span>✅</span><span>{f}</span></div>)}
                  </div>
                  <button className={`btn ${p.featured ? "btn-primary" : "btn-outline"} mt-4`} style={{ width: "100%", justifyContent: "center" }}>{t("admin.selectPlan")}</button>
                </div>
              ))}
            </div>
          </>
        )}

        {page === "settings" && (
          <div className="card">
            <div className="card-title">{t("admin.settingsTitle")}</div>
            <div className="form-grid">
              <div className="form-group"><label>{t("admin.labelAppName")}</label><input defaultValue="Moi Tech" /></div>
              <div className="form-group"><label>{t("admin.labelAdminEmail")}</label><input defaultValue="admin@moitech.in" /></div>
              <div className="form-group"><label>{t("admin.labelWhatsapp")}</label><input placeholder={t("admin.placeholderApi")} /></div>
              <div className="form-group"><label>{t("admin.labelCurrency")}</label><select><option>{t("admin.currencyInr")}</option></select></div>
              <div className="form-group full"><label>{t("admin.labelWelcomeTa")}</label><textarea defaultValue="வாழ்த்துக்கள்! உங்கள் மொய் பட்டியல் புதுப்பிக்கப்பட்டது." /></div>
            </div>
            <button className="btn btn-primary mt-4">{t("admin.saveSettings")}</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{t("admin.modalAddTitle")}</div>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>{t("admin.labelFullName")}</label><input value={newAff.name} onChange={(e) => setNewAff({ ...newAff, name: e.target.value })} placeholder={t("admin.phName")} /></div>
              <div className="form-group"><label>{t("admin.labelEmail")}</label><input value={newAff.email} onChange={(e) => setNewAff({ ...newAff, email: e.target.value })} placeholder={t("admin.phEmail")} /></div>
              <div className="form-group"><label>{t("admin.labelPhone")}</label><input value={newAff.phone} onChange={(e) => setNewAff({ ...newAff, phone: e.target.value })} placeholder={t("admin.phPhone")} /></div>
              <div className="form-group"><label>{t("admin.labelPlan")}</label>
                <select value={newAff.plan} onChange={(e) => setNewAff({ ...newAff, plan: e.target.value })}>
                  <option value="basic">{t("admin.planOptBasic")}</option>
                  <option value="pro">{t("admin.planOptPro")}</option>
                  <option value="enterprise">{t("admin.planOptEnt")}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={addAffiliate}>{t("admin.btnAddAffiliate")}</button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>{t("admin.cancel")}</button>
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
  const { t } = useLanguage();
  const relations = Array.isArray(t("relations")) ? t("relations") : [];
  const paymentMethods = Array.isArray(t("paymentMethods")) ? t("paymentMethods") : [];
  const defaultRelation = relations[0] ?? "";
  const defaultMethod = paymentMethods[0] ?? "Cash";

  const [page, setPage] = useState("events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMoiModal, setShowMoiModal] = useState(false);
  const [editingMoi, setEditingMoi] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [showVoided, setShowVoided] = useState(false);
  const [showDenoms, setShowDenoms] = useState(false);
  const [writerDraft, setWriterDraft] = useState({ name: "", phone: "" });
  const [showWritersModal, setShowWritersModal] = useState(false);
  const [editingWritersEventId, setEditingWritersEventId] = useState(null);
  const [editingWritersList, setEditingWritersList] = useState([]);
  const [writerEditDraft, setWriterEditDraft] = useState({ name: "", phone: "" });
  const [inlineEditingWriterId, setInlineEditingWriterId] = useState(null);
  const [inlineEditDraft, setInlineEditDraft] = useState({ name: "", phone: "" });

  const myEvents = events.filter((e) => e.affiliateId === 1);

  const blankMoi = () => ({ name: "", amount: "", phone: "", address: "", relation: defaultRelation, method: defaultMethod, note: "", voided: false, denoms: emptyDenoms(), writtenBy: { name: "", phone: "" } });
  const [newEvent, setNewEvent] = useState({ name: "", type: "wedding", date: "", venue: "", owner: "", ownerPhone: "", ownerEmail: "", writers: [] });
  const [newMoi, setNewMoi] = useState(blankMoi());

  const addWriterToEvent = () => {
    if (!writerDraft.name.trim()) return;
    setNewEvent((ev) => ({ ...ev, writers: [...(ev.writers || []), { id: crypto.randomUUID(), name: writerDraft.name.trim(), phone: writerDraft.phone.trim() }] }));
    setWriterDraft({ name: "", phone: "" });
  };

  const removeWriterFromEvent = (wid) => {
    setNewEvent((ev) => ({ ...ev, writers: (ev.writers || []).filter((w) => w.id !== wid) }));
  };

  const openWritersModal = (ev) => {
    setEditingWritersEventId(ev.id);
    setEditingWritersList(JSON.parse(JSON.stringify(ev.writers || [])));
    setWriterEditDraft({ name: "", phone: "" });
    setInlineEditingWriterId(null);
    setShowWritersModal(true);
  };

  const addWriterToEditing = () => {
    if (!writerEditDraft.name.trim()) return;
    setEditingWritersList((list) => [...list, { id: crypto.randomUUID(), name: writerEditDraft.name.trim(), phone: writerEditDraft.phone.trim() }]);
    setWriterEditDraft({ name: "", phone: "" });
  };

  const removeWriterFromEditing = (wid) => {
    setEditingWritersList((list) => list.filter((w) => w.id !== wid));
    if (inlineEditingWriterId === wid) setInlineEditingWriterId(null);
  };

  const startInlineEdit = (w) => {
    setInlineEditingWriterId(w.id);
    setInlineEditDraft({ name: w.name, phone: w.phone });
  };

  const saveInlineEdit = (wid) => {
    if (!inlineEditDraft.name.trim()) return;
    setEditingWritersList((list) => list.map((w) => w.id === wid ? { ...w, name: inlineEditDraft.name.trim(), phone: inlineEditDraft.phone.trim() } : w));
    setInlineEditingWriterId(null);
  };

  const saveWriters = () => {
    setEvents((evs) => evs.map((ev) => ev.id === editingWritersEventId ? { ...ev, writers: editingWritersList } : ev));
    if (selectedEvent && selectedEvent.id === editingWritersEventId) {
      setSelectedEvent((ev) => ({ ...ev, writers: editingWritersList }));
    }
    setShowWritersModal(false);
    setToast(t("writer.toastSaved"));
  };

  const addEvent = () => {
    setEvents([...events, { ...newEvent, id: crypto.randomUUID(), affiliateId: 1, status: "upcoming" }]);
    setShowEventModal(false);
    setToast(t("affiliate.toastEventCreated"));
    setNewEvent({ name: "", type: "wedding", date: "", venue: "", owner: "", ownerPhone: "", ownerEmail: "", writers: [] });
    setWriterDraft({ name: "", phone: "" });
  };

  const saveMoi = () => {
    const amount = Number(newMoi.amount);
    if (editingMoi) {
      setMoi(moi.map((m) => m.id === editingMoi.id ? { ...editingMoi, ...newMoi, amount } : m));
      setToast(t("affiliate.toastMoiUpdated"));
    } else {
      setMoi([...moi, { ...newMoi, id: crypto.randomUUID(), eventId: selectedEvent.id, amount, voided: false }]);
      setToast(t("affiliate.toastMoiAdded"));
    }
    setShowMoiModal(false);
    setEditingMoi(null);
    setNewMoi(blankMoi());
    setShowDenoms(false);
  };

  const openEdit = (m) => {
    setEditingMoi(m);
    setNewMoi({ name: m.name, amount: m.amount, phone: m.phone, address: m.address, relation: m.relation, method: m.method, note: m.note, voided: m.voided, denoms: m.denoms || emptyDenoms(), writtenBy: m.writtenBy || { name: "", phone: "" } });
    setShowDenoms(denomSum(m.denoms) > 0);
    setShowMoiModal(true);
  };

  const voidMoi = (id) => {
    if (!window.confirm(t("void.confirmMsg"))) return;
    setMoi(moi.map((m) => m.id === id ? { ...m, voided: true } : m));
    setToast(t("void.toastVoided"));
  };

  const eventMoiAll = selectedEvent ? moi.filter((m) => m.eventId === selectedEvent.id) : [];
  const eventMoi = eventMoiAll.filter((m) => !m.voided);
  const displayMoi = showVoided ? eventMoiAll : eventMoi;
  const filteredMoi = displayMoi.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));
  const totalMoi = eventMoi.reduce((s, m) => s + m.amount, 0);

  const menuItems = [
    { id: "events", icon: "🎉", label: t("affiliate.menuEvents") },
    { id: "moi", icon: "🎁", label: t("affiliate.menuMoi") },
    { id: "settlement", icon: "💼", label: t("settlement.title") },
    { id: "reports", icon: "📄", label: t("affiliate.menuReports") },
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
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t("affiliate.activeEvent")}</div>
              <div style={{ fontSize: 13, color: "var(--gold-light)", fontWeight: 600 }}>{selectedEvent.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{eventMoi.length} {t("affiliate.entries")} · {fmt(totalMoi)}</div>
            </div>
          </>
        )}
      </div>

      <div className="main">
        {page === "events" && (
          <>
            <div className="page-header">
              <div><div className="page-title">{t("affiliate.myEventsTitle")}</div><div className="page-sub">{t("affiliate.myEventsSub")}</div></div>
              <button className="btn btn-primary" onClick={() => setShowEventModal(true)}>{t("affiliate.newEvent")}</button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
              {[
                { icon: "🎉", value: myEvents.length, label: t("affiliate.statTotalEvents") },
                { icon: "🎁", value: moi.filter((m) => myEvents.some((e) => e.id === m.eventId)).length, label: t("affiliate.statTotalMoiEntries") },
                { icon: "💰", value: fmt(moi.filter((m) => myEvents.some((e) => e.id === m.eventId)).reduce((s, m) => s + m.amount, 0)), label: t("affiliate.statTotalMoiAmount") },
              ].map((s, i) => <div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>)}
            </div>

            <div className="grid-2">
              {myEvents.map((e) => {
                const eMoi = moi.filter((m) => m.eventId === e.id);
                const total = eMoi.reduce((s, m) => s + m.amount, 0);
                return (
                  <div key={e.id} className="card" style={{ cursor: "pointer" }}>
                    <div className="flex items-center justify-between mb-3">
                      {eventBadge(e.type, t)}
                      <span className={`badge badge-${e.status === "completed" ? "active" : e.status === "active" ? "pending" : "expired"}`}>{t(`status.${e.status}`)}</span>
                    </div>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>📅 {e.date} · 📍 {e.venue}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: (e.writers || []).length > 0 ? 8 : 16 }}>👤 {e.owner} · 📞 {e.ownerPhone}</div>
                    {(e.writers || []).length > 0 && (
                      <div className="writers-list" style={{ marginBottom: 12, marginTop: 0 }}>
                        {(e.writers || []).map((w) => (
                          <div key={w.id} className="writer-chip" style={{ fontSize: 11 }}>
                            <span>✍️ {w.name}</span>
                            {w.phone && <span className="chip-phone">· {w.phone}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(200,146,42,0.15)", paddingTop: 12 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Playfair Display, serif", color: "var(--crimson)" }}>{fmt(total)}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{eMoi.length} {t("affiliate.entries")}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-outline btn-sm" onClick={(ev) => { ev.stopPropagation(); openWritersModal(e); }}>{t("writer.editWriters")}</button>
                        <button className="btn btn-gold btn-sm" onClick={() => { setSelectedEvent(e); setPage("moi"); }}>{t("affiliate.enterMoi")}</button>
                      </div>
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
                  <div><div className="page-title">{t("affiliate.moiTitle")}</div><div className="page-sub">{t("affiliate.moiSelectSub")}</div></div>
                </div>
                <div className="grid-2">
                  {myEvents.map((e) => (
                    <div key={e.id} className="card" style={{ cursor: "pointer" }} onClick={() => setSelectedEvent(e)}>
                      <div className="flex items-center gap-2 mb-2">{eventBadge(e.type, t)}</div>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 16, fontWeight: 700 }}>{e.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>📅 {e.date} · 📍 {e.venue}</div>
                      <button className="btn btn-primary btn-sm mt-4">{t("affiliate.openEvent")}</button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="page-header">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <button className="btn btn-outline btn-sm" onClick={() => setSelectedEvent(null)}>{t("affiliate.back")}</button>
                      {eventBadge(selectedEvent.type, t)}
                    </div>
                    <div className="page-title">{selectedEvent.name}</div>
                    <div className="page-sub">📅 {selectedEvent.date} · 📍 {selectedEvent.venue} · 👤 {selectedEvent.owner}</div>
                    {(selectedEvent.writers || []).length > 0 && (
                      <div className="writers-list" style={{ marginTop: 8 }}>
                        {(selectedEvent.writers || []).map((w) => (
                          <div key={w.id} className="writer-chip" style={{ fontSize: 11 }}>
                            <span>✍️ {w.name}</span>
                            {w.phone && <span className="chip-phone">· {w.phone}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => openWritersModal(selectedEvent)}>{t("writer.editWriters")}</button>
                    <button className="btn btn-primary" onClick={() => { setEditingMoi(null); setNewMoi(blankMoi()); setShowDenoms(false); setShowMoiModal(true); }}>{t("affiliate.addMoiEntry")}</button>
                  </div>
                </div>

                <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
                  {[
                    { icon: "🎁", value: eventMoi.length, label: t("affiliate.statTotalEntries") },
                    { icon: "💰", value: fmt(totalMoi), label: t("affiliate.statTotalMoiAmt") },
                    { icon: "📊", value: fmt(Math.round(totalMoi / Math.max(eventMoi.length, 1))), label: t("affiliate.statAvgPerEntry") },
                  ].map((s, i) => <div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>)}
                </div>

                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="section-title">{t("affiliate.moiListTitle")}</div>
                    <div className="search-wrap" style={{ width: 240 }}>
                      <span className="search-icon">🔍</span>
                      <input placeholder={t("affiliate.searchMoiPh")} value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3" style={{ fontSize: 12 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowVoided((v) => !v)}>
                      {showVoided ? t("void.hideVoided") : t("void.showVoided")}
                      {eventMoiAll.filter((m) => m.voided).length > 0 && (
                        <span className="badge badge-expired" style={{ marginLeft: 6 }}>{eventMoiAll.filter((m) => m.voided).length}</span>
                      )}
                    </button>
                  </div>

                  {filteredMoi.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">🎁</div><div className="empty-text">{t("affiliate.emptyMoi")}</div><div className="empty-sub">{t("affiliate.emptyMoiSub")}</div></div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>{t("affiliate.thHash")}</th><th>{t("affiliate.thName")}</th><th>{t("affiliate.thAmount")}</th><th>{t("affiliate.labelPhone")}</th><th>{t("affiliate.thAddress")}</th><th>{t("affiliate.thRelation")}</th><th>{t("affiliate.thMethod")}</th><th>{t("writer.columnHeader")}</th><th>{t("affiliate.thActions")}</th></tr></thead>
                        <tbody>
                          {filteredMoi.map((m, i) => (
                            <tr key={m.id} className={m.voided ? "moi-voided" : ""}>
                              <td style={{ color: "var(--muted)", fontWeight: 700 }}>{i + 1}</td>
                              <td>
                                <strong>{m.name}</strong>
                                {m.voided && <span className="badge badge-expired" style={{ marginLeft: 6, fontSize: 9 }}>{t("void.voided")}</span>}
                                {m.note && <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.note}</div>}
                              </td>
                              <td><span className="amount-tag">{fmt(m.amount)}</span></td>
                              <td style={{ fontSize: 13 }}>{m.phone}</td>
                              <td style={{ fontSize: 12, color: "var(--muted)", maxWidth: 150 }}>{m.address}</td>
                              <td style={{ fontSize: 12 }}>{m.relation}</td>
                              <td><span className="badge badge-pending">{m.method}</span></td>
                              <td style={{ fontSize: 12 }}>
                                {m.writtenBy?.name
                                  ? <><div style={{ fontWeight: 600, color: "var(--text)" }}>✍️ {m.writtenBy.name}</div>{m.writtenBy.phone && <div style={{ fontSize: 10, color: "var(--muted)" }}>{m.writtenBy.phone}</div>}</>
                                  : <span style={{ color: "var(--muted)", fontStyle: "italic", fontSize: 11 }}>—</span>
                                }
                              </td>
                              <td>
                                <div className="flex gap-2">
                                  {!m.voided && <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}>{t("affiliate.edit")}</button>}
                                  {!m.voided && <button className="btn btn-outline btn-sm" onClick={() => printReceiptFn(m, selectedEvent)}>{t("receipt.btnLabel")}</button>}
                                  {!m.voided && <button className="btn btn-danger btn-sm" onClick={() => voidMoi(m.id)}>{t("void.btnLabel")}</button>}
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

        {page === "settlement" && (() => {
          const settleEvent = selectedEvent || myEvents[0];
          const sMoi = settleEvent ? moi.filter((m) => m.eventId === settleEvent.id && !m.voided) : [];
          const cashEntries = sMoi.filter((m) => m.method === "Cash");
          const digitalEntries = sMoi.filter((m) => m.method !== "Cash");
          const cashTotal = cashEntries.reduce((s, m) => s + m.amount, 0);
          const digitalTotal = digitalEntries.reduce((s, m) => s + m.amount, 0);
          const grandTotal = cashTotal + digitalTotal;
          const METHODS = ["GPay", "PhonePe", "Paytm", "NEFT", "Cheque"];
          const methodBreak = METHODS.map((md) => {
            const entries = sMoi.filter((m) => m.method === md);
            return { method: md, count: entries.length, total: entries.reduce((s, m) => s + m.amount, 0) };
          }).filter((x) => x.count > 0);
          const denomAgg = {};
          cashEntries.forEach((m) => { if (m.denoms) DENOMS.forEach((d) => { if (m.denoms[d] > 0) denomAgg[d] = (denomAgg[d] || 0) + m.denoms[d]; }); });
          const hasDenoms = Object.values(denomAgg).some((v) => v > 0);
          return (
            <>
              <div className="page-header">
                <div><div className="page-title">{t("settlement.title")}</div><div className="page-sub">{t("settlement.sub")}</div></div>
              </div>
              {!settleEvent ? (
                <div className="empty-state"><div className="empty-icon">💼</div><div className="empty-text">{t("settlement.selectEvent")}</div></div>
              ) : (
                <>
                  <div className="section-strip" style={{ marginBottom: 20 }}>{settleEvent.name} · {settleEvent.date}</div>
                  <div className="settle-total-card mb-4">
                    <div className="settle-label" style={{ color: "var(--gold-light)" }}>{t("settlement.grandTotal")}</div>
                    <div className="settle-amount">{fmt(grandTotal)}</div>
                    <div className="settle-sub">{sMoi.length} {t("settlement.allEntries")}</div>
                  </div>
                  <div className="settlement-grid mb-4">
                    <div className="settlement-card settle-cash">
                      <div className="settle-label">💵 {t("settlement.cashInHand")}</div>
                      <div className="settle-amount">{fmt(cashTotal)}</div>
                      <div className="settle-sub">{cashEntries.length} {t("settlement.cashEntries")}</div>
                    </div>
                    <div className="settlement-card settle-bank">
                      <div className="settle-label">🏦 {t("settlement.inAccount")}</div>
                      <div className="settle-amount">{fmt(digitalTotal)}</div>
                      <div className="settle-sub">{digitalEntries.length} {t("settlement.digitalEntries")}</div>
                    </div>
                  </div>
                  {methodBreak.length > 0 && (
                    <div className="card mb-4">
                      <div className="card-title">{t("settlement.methodBreakdown")}</div>
                      <div className="table-wrap">
                        <table className="method-breakdown-table">
                          <thead><tr><th>Method</th><th>Entries</th><th>Total</th></tr></thead>
                          <tbody>
                            {cashEntries.length > 0 && (
                              <tr>
                                <td><strong>Cash</strong></td>
                                <td>{cashEntries.length}</td>
                                <td className="amount-positive">{fmt(cashTotal)}</td>
                              </tr>
                            )}
                            {methodBreak.map((mb) => (
                              <tr key={mb.method}>
                                <td><strong>{mb.method}</strong></td>
                                <td>{mb.count}</td>
                                <td className="amount-positive">{fmt(mb.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {hasDenoms ? (
                    <div className="card">
                      <div className="card-title">{t("settlement.denomBreakdown")}</div>
                      <div className="denom-grid">
                        {DENOMS.filter((d) => denomAgg[d] > 0).map((d) => (
                          <div key={d} className="denom-row">
                            <span className="denom-label">₹{d}</span>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>× {denomAgg[d]}</span>
                            <span className="denom-sub">= {fmt(d * denomAgg[d])}</span>
                          </div>
                        ))}
                      </div>
                      <div className="denom-total-bar" style={{ marginTop: 14 }}>
                        <span>{t("denom.total")}</span>
                        <span>{fmt(DENOMS.reduce((s, d) => s + d * (denomAgg[d] || 0), 0))}</span>
                      </div>
                    </div>
                  ) : cashEntries.length > 0 ? (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>{t("settlement.nodenoms")}</div>
                  ) : null}
                </>
              )}
            </>
          );
        })()}

        {page === "reports" && (
          <>
            <div className="page-header">
              <div><div className="page-title">{t("affiliate.reportsTitle")}</div><div className="page-sub">{t("affiliate.reportsSub")}</div></div>
            </div>
            <div className="card">
              <div className="card-title">{t("affiliate.eventReports")}</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>{t("admin.thEventName")}</th><th>{t("admin.thType")}</th><th>{t("admin.thDate")}</th><th>{t("affiliate.thEntriesCol")}</th><th>{t("affiliate.thAmount")}</th><th>{t("affiliate.thExport")}</th></tr></thead>
                  <tbody>
                    {myEvents.map((e) => {
                      const eMoi = moi.filter((m) => m.eventId === e.id);
                      return (
                        <tr key={e.id}>
                          <td><strong>{e.name}</strong></td>
                          <td>{eventBadge(e.type, t)}</td>
                          <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.date}</td>
                          <td>{eMoi.length}</td>
                          <td className="amount-positive">{fmt(eMoi.reduce((s, m) => s + m.amount, 0))}</td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-gold btn-sm" onClick={() => generateEventPDF(e, moi.filter((m) => m.eventId === e.id))}>{t("pdf.btnLabel")}</button>
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
              <div className="modal-title">{t("affiliate.modalCreateEvent")}</div>
              <button className="btn-close" onClick={() => setShowEventModal(false)}>✕</button>
            </div>
            <div className="section-strip">{t("affiliate.sectionEventDetails")}</div>
            <div className="form-grid mb-4">
              <div className="form-group full"><label>{t("affiliate.labelEventName")}</label><input value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} placeholder={t("affiliate.phEventName")} /></div>
              <div className="form-group"><label>{t("affiliate.labelEventType")}</label>
                <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
                  {EVENT_TYPE_META.map((et) => (
                    <option key={et.value} value={et.value}>{t(`eventTypes.${et.value}`)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group"><label>{t("affiliate.labelEventDate")}</label><input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} /></div>
              <div className="form-group full"><label>{t("affiliate.labelVenue")}</label><input value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} placeholder={t("affiliate.phVenue")} /></div>
            </div>
            <div className="section-strip">{t("affiliate.sectionOwnerDetails")}</div>
            <div className="form-grid">
              <div className="form-group"><label>{t("affiliate.labelOwnerName")}</label><input value={newEvent.owner} onChange={(e) => setNewEvent({ ...newEvent, owner: e.target.value })} placeholder={t("affiliate.phFullName")} /></div>
              <div className="form-group"><label>{t("affiliate.labelOwnerPhone")}</label><input value={newEvent.ownerPhone} onChange={(e) => setNewEvent({ ...newEvent, ownerPhone: e.target.value })} placeholder={t("affiliate.phMobile")} /></div>
              <div className="form-group full"><label>{t("affiliate.labelOwnerEmail")}</label><input value={newEvent.ownerEmail} onChange={(e) => setNewEvent({ ...newEvent, ownerEmail: e.target.value })} placeholder={t("affiliate.phOwnerEmail")} /></div>
            </div>

            <div className="section-strip" style={{ marginTop: 20 }}>✍️ {t("writer.sectionTitle")}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>{t("writer.sectionSub")}</div>
            <div className="writer-mini-form">
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 11 }}>{t("writer.labelName")}</label>
                <input value={writerDraft.name} onChange={(e) => setWriterDraft({ ...writerDraft, name: e.target.value })} placeholder={t("writer.phName")} onKeyDown={(e) => e.key === "Enter" && addWriterToEvent()} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 11 }}>{t("writer.labelPhone")}</label>
                <input value={writerDraft.phone} onChange={(e) => setWriterDraft({ ...writerDraft, phone: e.target.value })} placeholder={t("writer.phPhone")} onKeyDown={(e) => e.key === "Enter" && addWriterToEvent()} />
              </div>
              <button className="btn btn-gold btn-sm" style={{ alignSelf: "flex-end", whiteSpace: "nowrap" }} onClick={addWriterToEvent}>+ {t("writer.addBtn")}</button>
            </div>
            <div className="writers-list">
              {(newEvent.writers || []).length === 0
                ? <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>{t("writer.noWriters")}</span>
                : (newEvent.writers || []).map((w) => (
                  <div key={w.id} className="writer-chip">
                    <span>✍️ {w.name}</span>
                    {w.phone && <span className="chip-phone">· {w.phone}</span>}
                    <button className="chip-remove" onClick={() => removeWriterFromEvent(w.id)}>×</button>
                  </div>
                ))
              }
            </div>

            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={addEvent}>{t("affiliate.createEvent")}</button>
              <button className="btn btn-outline" onClick={() => { setShowEventModal(false); setWriterDraft({ name: "", phone: "" }); }}>{t("admin.cancel")}</button>
            </div>
          </div>
        </div>
      )}

      {showMoiModal && (
        <div className="modal-overlay" onClick={() => { setShowMoiModal(false); setShowDenoms(false); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingMoi ? t("affiliate.modalEditMoi") : t("affiliate.modalAddMoi")}</div>
              <button className="btn-close" onClick={() => { setShowMoiModal(false); setShowDenoms(false); }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>{t("affiliate.labelGiver")}</label><input value={newMoi.name} onChange={(e) => setNewMoi({ ...newMoi, name: e.target.value })} placeholder={t("affiliate.phFullName")} /></div>
              <div className="form-group">
                <label>{t("affiliate.labelAmount")}</label>
                <input type="number" value={newMoi.amount} onChange={(e) => setNewMoi({ ...newMoi, amount: e.target.value })} placeholder={t("affiliate.phAmount")} />
              </div>
              <div className="form-group"><label>{t("affiliate.labelPhone")}</label><input value={newMoi.phone} onChange={(e) => setNewMoi({ ...newMoi, phone: e.target.value })} placeholder={t("affiliate.phMobile")} /></div>
              <div className="form-group"><label>{t("affiliate.labelRelation")}</label>
                <select value={newMoi.relation} onChange={(e) => setNewMoi({ ...newMoi, relation: e.target.value })}>
                  {relations.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group"><label>{t("affiliate.labelPaymentMethod")}</label>
                <select value={newMoi.method} onChange={(e) => setNewMoi({ ...newMoi, method: e.target.value, denoms: emptyDenoms() })} >
                  {paymentMethods.map((pm) => <option key={pm} value={pm}>{pm}</option>)}
                </select>
              </div>
              <div className="form-group full"><label>{t("affiliate.labelAddress")}</label><input value={newMoi.address} onChange={(e) => setNewMoi({ ...newMoi, address: e.target.value })} placeholder={t("affiliate.phAddress")} /></div>
              <div className="form-group full"><label>{t("affiliate.labelNote")}</label><input value={newMoi.note} onChange={(e) => setNewMoi({ ...newMoi, note: e.target.value })} placeholder={t("affiliate.phNote")} /></div>

              <div className="form-group full">
                <label>✍️ {t("writer.labelWrittenBy")}</label>
                {(selectedEvent?.writers || []).length > 0 ? (
                  <select
                    value={newMoi.writtenBy?.name || ""}
                    onChange={(e) => {
                      const w = (selectedEvent.writers || []).find((wr) => wr.name === e.target.value);
                      if (e.target.value === "__other__") {
                        setNewMoi({ ...newMoi, writtenBy: { name: "", phone: "" } });
                      } else if (w) {
                        setNewMoi({ ...newMoi, writtenBy: { name: w.name, phone: w.phone } });
                      }
                    }}
                  >
                    <option value="">{t("writer.selectWriter")}</option>
                    {(selectedEvent.writers || []).map((w) => (
                      <option key={w.id} value={w.name}>{w.name}{w.phone ? ` · ${w.phone}` : ""}</option>
                    ))}
                    <option value="__other__">{t("writer.freeEntry")}</option>
                  </select>
                ) : null}
                {((selectedEvent?.writers || []).length === 0 || newMoi.writtenBy?.name === "") && (
                  <input
                    style={{ marginTop: (selectedEvent?.writers || []).length > 0 ? 6 : 0 }}
                    value={newMoi.writtenBy?.name || ""}
                    onChange={(e) => setNewMoi({ ...newMoi, writtenBy: { ...newMoi.writtenBy, name: e.target.value } })}
                    placeholder={t("writer.phWrittenBy")}
                  />
                )}
              </div>

              {newMoi.method === "Cash" && (
                <div className="form-group full">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ marginBottom: 8 }}
                    onClick={() => { setShowDenoms((v) => !v); if (showDenoms) setNewMoi({ ...newMoi, denoms: emptyDenoms() }); }}
                  >
                    {showDenoms ? t("denom.collapse") : t("denom.expand")}
                  </button>
                  {showDenoms && (
                    <div className="denom-section">
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>{t("denom.hint")}</div>
                      <div className="denom-grid">
                        {DENOMS.map((d) => {
                          const qty = newMoi.denoms?.[d] || 0;
                          const sub = d * qty;
                          return (
                            <div key={d} className="denom-row">
                              <span className="denom-label">₹{d}</span>
                              <input
                                type="number"
                                min="0"
                                className="denom-qty"
                                value={qty || ""}
                                placeholder="0"
                                onChange={(e) => {
                                  const nd = { ...(newMoi.denoms || emptyDenoms()), [d]: Number(e.target.value) || 0 };
                                  const autoAmt = denomSum(nd);
                                  setNewMoi({ ...newMoi, denoms: nd, amount: autoAmt > 0 ? autoAmt : newMoi.amount });
                                }}
                              />
                              {sub > 0 && <span className="denom-sub">={fmt(sub)}</span>}
                            </div>
                          );
                        })}
                      </div>
                      {denomSum(newMoi.denoms) > 0 && (
                        <div className="denom-total-bar">
                          <span>{t("denom.total")}</span>
                          <span>{fmt(denomSum(newMoi.denoms))}</span>
                        </div>
                      )}
                      {denomSum(newMoi.denoms) > 0 && Number(newMoi.amount) !== denomSum(newMoi.denoms) && (
                        <div style={{ fontSize: 11, color: "var(--crimson-light)", marginTop: 6, fontWeight: 600 }}>⚠️ {t("denom.mismatch")}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={saveMoi}>{editingMoi ? t("affiliate.updateEntry") : t("affiliate.addEntry")}</button>
              <button className="btn btn-outline" onClick={() => { setShowMoiModal(false); setShowDenoms(false); }}>{t("admin.cancel")}</button>
            </div>
          </div>
        </div>
      )}

      {showWritersModal && (
        <div className="modal-overlay" onClick={() => setShowWritersModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">✍️ {t("writer.manageTitle")}</div>
              <button className="btn-close" onClick={() => setShowWritersModal(false)}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              {editingWritersList.length === 0
                ? <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic", padding: "8px 0" }}>{t("writer.noWriters")}</div>
                : editingWritersList.map((w) => (
                  <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid rgba(200,146,42,0.1)" }}>
                    {inlineEditingWriterId === w.id ? (
                      <>
                        <input
                          value={inlineEditDraft.name}
                          onChange={(e) => setInlineEditDraft({ ...inlineEditDraft, name: e.target.value })}
                          placeholder={t("writer.phName")}
                          style={{ flex: 1, fontSize: 13, padding: "6px 10px" }}
                          onKeyDown={(e) => e.key === "Enter" && saveInlineEdit(w.id)}
                          autoFocus
                        />
                        <input
                          value={inlineEditDraft.phone}
                          onChange={(e) => setInlineEditDraft({ ...inlineEditDraft, phone: e.target.value })}
                          placeholder={t("writer.phPhone")}
                          style={{ flex: 1, fontSize: 13, padding: "6px 10px" }}
                          onKeyDown={(e) => e.key === "Enter" && saveInlineEdit(w.id)}
                        />
                        <button className="btn btn-primary btn-sm" onClick={() => saveInlineEdit(w.id)}>✓</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setInlineEditingWriterId(null)}>✕</button>
                      </>
                    ) : (
                      <>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>✍️ {w.name}</div>
                          {w.phone && <div style={{ fontSize: 11, color: "var(--muted)" }}>{w.phone}</div>}
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => startInlineEdit(w)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => removeWriterFromEditing(w.id)}>🗑️</button>
                      </>
                    )}
                  </div>
                ))
              }
            </div>

            <div className="section-strip" style={{ marginBottom: 10 }}>{t("writer.addBtn")}</div>
            <div className="writer-mini-form">
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 11 }}>{t("writer.labelName")}</label>
                <input value={writerEditDraft.name} onChange={(e) => setWriterEditDraft({ ...writerEditDraft, name: e.target.value })} placeholder={t("writer.phName")} onKeyDown={(e) => e.key === "Enter" && addWriterToEditing()} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 11 }}>{t("writer.labelPhone")}</label>
                <input value={writerEditDraft.phone} onChange={(e) => setWriterEditDraft({ ...writerEditDraft, phone: e.target.value })} placeholder={t("writer.phPhone")} onKeyDown={(e) => e.key === "Enter" && addWriterToEditing()} />
              </div>
              <button className="btn btn-gold btn-sm" style={{ alignSelf: "flex-end" }} onClick={addWriterToEditing}>+ {t("writer.addBtn")}</button>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={saveWriters}>{t("writer.saveWriters")}</button>
              <button className="btn btn-outline" onClick={() => setShowWritersModal(false)}>{t("admin.cancel")}</button>
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
  const { t } = useLanguage();
  const myEvent = events.find((e) => e.ownerEmail === "murugan@gmail.com") || events[0];
  const eventMoi = moi.filter((m) => m.eventId === myEvent?.id);
  const total = eventMoi.reduce((s, m) => s + m.amount, 0);
  const [search, setSearch] = useState("");
  const filtered = eventMoi.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  const typeLabel = myEvent?.type ? t(`eventTypes.${myEvent.type}`) : t("eventTypes.function");

  return (
    <div className="main" style={{ background: "linear-gradient(135deg, #f0e6d0 0%, #e8d5b0 100%)", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 20px" }}>
      <div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>{t("owner.mobileViewTitle")}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{t("owner.mobileViewSub")}</div>
        </div>

        <div className="mobile-view">
          <div className="mobile-header">
            <div className="mobile-event-type">{typeLabel}</div>
            <div className="mobile-event-name">{myEvent?.name}</div>
            <div className="mobile-date">📅 {myEvent?.date} · 📍 {myEvent?.venue}</div>
          </div>

          <div className="mobile-body">
            <div className="mobile-total">
              <div className="mobile-total-label">{t("owner.totalMoiLabel")}</div>
              <div className="mobile-total-amount">{fmt(total)}</div>
              <div className="mobile-total-sub">{eventMoi.length} {t("owner.giftGivers")} · {t("owner.liveUpdating")}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { icon: "🎁", value: eventMoi.length, label: t("owner.labelEntries") },
                { icon: "📊", value: fmt(Math.round(total / Math.max(eventMoi.length, 1))), label: t("owner.labelAverage") },
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
              <input placeholder={t("owner.searchPh")} style={{ width: "100%", paddingLeft: 32, fontSize: 13 }} value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <div style={{ fontSize: 11, color: "var(--gold-dark)", fontWeight: 600 }}>{t("owner.liveBanner")}</div>
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
  const [theme, setTheme] = useState(() => localStorage.getItem("moi-theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("moi-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

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
        <Navbar role={role} userName={users[role]} onLogout={() => setRole(null)} theme={theme} toggleTheme={toggleTheme} />
        {role === "admin" && <AdminDashboard affiliates={affiliates} setAffiliates={setAffiliates} events={events} moi={moi} />}
        {role === "affiliate" && <AffiliateDashboard events={events} setEvents={setEvents} moi={moi} setMoi={setMoi} />}
        {role === "owner" && <OwnerView events={events} moi={moi} />}
      </div>
    </>
  );
}
