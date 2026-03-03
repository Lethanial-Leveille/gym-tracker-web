import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import WorkoutDetailPage from "./pages/WorkoutDetailPage";
import SessionPage from "./pages/SessionPage";
import ProtectedRoute from "./components/ProtectedRoute";

function DefaultRoute() {
  // Always send people to workouts
  window.location.replace("/workouts");
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/workouts"
        element={
          <ProtectedRoute>
            <WorkoutsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workouts/:id"
        element={
          <ProtectedRoute>
            <WorkoutDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/session"
        element={
          <ProtectedRoute>
            <SessionPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<DefaultRoute />} />
    </Routes>
  );
}