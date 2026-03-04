import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";

/*
  ARCHITECTURE NOTE:
  ──────────────────
  Instead of wrapping each page in <ProtectedRoute>, we use a layout
  that renders <Outlet /> for the child route. This means:

  1. Auth check happens once, at the layout level
  2. Bottom nav is defined once, shared across all pages
  3. Each page just focuses on its own content

  In React Router, when you do:
    <Route element={<ProtectedLayout />}>
      <Route path="/" element={<HomePage />} />
    </Route>

  React Router renders ProtectedLayout, and <Outlet /> inside it
  becomes <HomePage />.  It's like a "slot" pattern.
*/

export default function ProtectedLayout() {
  const [ok, setOk] = useState<boolean>(() => !!localStorage.getItem("token"));

  useEffect(() => {
    if (!localStorage.getItem("token")) setOk(false);
  }, []);

  if (!ok) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

/* ── Bottom Navigation ── */
function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V13h6v8" /></svg>
        Home
      </NavLink>

      <NavLink to="/session" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
        Session
      </NavLink>

      <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <svg viewBox="0 0 24 24"><path d="M12 8v4l2 2" /><path d="M3.05 11a9 9 0 1 1 .5 4" /><path d="M3 16V11h5" /></svg>
        History
      </NavLink>

      <NavLink to="/library" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" /></svg>
        Library
      </NavLink>
    </nav>
  );
}