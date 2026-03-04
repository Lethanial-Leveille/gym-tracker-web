import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";
import HistoryPage from "./pages/HistoryPage";
import LibraryPage from "./pages/LibraryPage";
import ProtectedLayout from "./components/ProtectedLayout";

/*
  ARCHITECTURE NOTE:
  ──────────────────
  We removed WorkoutsPage and WorkoutDetailPage.
  The new flow is: Home → Start Session → Add exercises → Log sets → Finish.
  No more templates/plans. Simpler UX.

  ProtectedLayout handles:
  1. Auth check (redirects to /login if no token)
  2. Bottom navigation bar
  3. Wraps all protected pages via <Outlet />
*/

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* All protected routes share the bottom nav layout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/session" element={<SessionPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
