import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { logout } from "../auth";

type SessionSummary = {
  id: number;
  title: string;
  workout_id: number | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
};

function formatHMS(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function HomePage() {
  const nav = useNavigate();
  const [active, setActive] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState(Date.now());

  // Tick the timer every second
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get("/sessions/active")
      .then((a) => setActive(a as SessionSummary | null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const elapsed = useMemo(() => {
    if (!active?.started_at) return null;
    const start = new Date(active.started_at).getTime();
    if (!Number.isFinite(start)) return null;
    return Math.floor((nowMs - start) / 1000);
  }, [active, nowMs]);

  const handleLogout = () => {
    logout();
    window.location.assign("/login");
  };

  if (loading) {
    return (
      <div className="stack-lg animate-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="page-title">Home</div>
        </div>
        <div className="card"><div className="empty animate-pulse">Loading...</div></div>
      </div>
    );
  }

  return (
    <div className="stack-lg animate-in stagger">
      {/* Header */}
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="label" style={{ marginBottom: 4 }}>Gym Tracker</div>
          <div className="page-title">
            {active ? "You're training" : "Ready to train?"}
          </div>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {/* Active Session Card -or- Start Card */}
      {active ? (
        <div className="card card-accent animate-in" style={{ cursor: "pointer" }} onClick={() => nav("/session")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="badge badge-accent" style={{ marginBottom: 10 }}>Active</div>
              <div className="section-title">{active.title}</div>
              <div className="text-muted text-sm" style={{ marginTop: 4 }}>
                Tap to continue your session
              </div>
            </div>
            <div className="timer">
              {elapsed !== null ? formatHMS(elapsed) : "--:--:--"}
            </div>
          </div>
        </div>
      ) : (
        <div className="card animate-in">
          <div className="section-title" style={{ marginBottom: 6 }}>Start a new session</div>
          <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
            Begin a workout, add exercises, and log your sets.
          </p>
          <button
            className="btn btn-primary btn-block"
            onClick={() => nav("/session")}
            style={{ height: 50, fontSize: 16, fontWeight: 600 }}
          >
            Start Session
          </button>
        </div>
      )}

      {/* Quick Links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="card animate-in" style={{ cursor: "pointer", textAlign: "center", padding: 18 }} onClick={() => nav("/history")}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📋</div>
          <div className="section-title" style={{ fontSize: 15 }}>History</div>
          <div className="text-dim text-xs" style={{ marginTop: 4 }}>Past sessions</div>
        </div>
        <div className="card animate-in" style={{ cursor: "pointer", textAlign: "center", padding: 18 }} onClick={() => nav("/library")}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>💪</div>
          <div className="section-title" style={{ fontSize: 15 }}>Library</div>
          <div className="text-dim text-xs" style={{ marginTop: 4 }}>Exercise database</div>
        </div>
      </div>
    </div>
  );
}