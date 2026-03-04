import { useEffect, useState } from "react";
import { api } from "../api";

/*
  ARCHITECTURE NOTE:
  ──────────────────
  The flow:
  1. Load paginated list of finished sessions
  2. User taps a session to expand it
  3. Expanded view fetches full detail (exercises + sets)
*/

type SessionSummary = {
  id: number;
  title: string;
  workout_id: number | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
};

type SetEntry = { id: number; set_number: number; reps: number; weight: number | null };

type SessionExercise = {
  id: number;
  order_index: number;
  exercise: { id: number; name: string; primary_muscle?: string | null };
  set_entries: SetEntry[];
};

type SessionDetail = SessionSummary & {
  session_exercises: SessionExercise[];
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, SessionDetail>>({});

  useEffect(() => {
    api.get("/sessions?skip=0&limit=50")
      .then((data: any) => setSessions(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    // Fetch detail if we haven't already
    if (!details[id]) {
      try {
        const d = (await api.get(`/sessions/${id}`)) as SessionDetail;
        d.session_exercises?.sort((a, b) => a.order_index - b.order_index);
        setDetails((prev) => ({ ...prev, [id]: d }));
      } catch { /* ignore */ }
    }
  }

  if (loading) {
    return (
      <div className="stack-lg animate-in">
        <div className="page-title">History</div>
        <div className="card"><div className="empty animate-pulse">Loading...</div></div>
      </div>
    );
  }

  return (
    <div className="stack-lg animate-in stagger">
      <div className="animate-in">
        <div className="page-title">History</div>
        <p className="text-muted text-sm" style={{ marginTop: 4 }}>
          {sessions.length} completed session{sessions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="card animate-in">
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div>No sessions yet</div>
            <div className="text-dim text-xs" style={{ marginTop: 4 }}>
              Complete a session and it'll show up here
            </div>
          </div>
        </div>
      ) : (
        <div className="stack-xs animate-in">
          {sessions.map((s) => {
            const isOpen = expandedId === s.id;
            const detail = details[s.id];

            return (
              <div key={s.id}>
                <div
                  className="history-item"
                  onClick={() => toggleExpand(s.id)}
                  style={{ borderRadius: isOpen ? "var(--radius) var(--radius) 0 0" : undefined }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{s.title}</div>
                    <div className="text-dim text-xs" style={{ marginTop: 3 }}>
                      {formatDate(s.started_at)} at {formatTime(s.started_at)}
                    </div>
                  </div>
                  <div className="row-xs">
                    {s.duration_minutes != null && (
                      <div className="badge">{s.duration_minutes} min</div>
                    )}
                    <span className="text-dim" style={{ fontSize: 18, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
                      ▾
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderTop: "none",
                      borderRadius: "0 0 var(--radius) var(--radius)",
                      padding: 16,
                    }}
                  >
                    {!detail ? (
                      <div className="text-dim text-sm animate-pulse">Loading details...</div>
                    ) : detail.session_exercises.length === 0 ? (
                      <div className="text-dim text-sm">No exercises logged.</div>
                    ) : (
                      <div className="stack-sm">
                        {detail.session_exercises.map((se) => (
                          <div key={se.id}>
                            <div className="row-sm between">
                              <div style={{ fontWeight: 500, fontSize: 14 }}>{se.exercise.name}</div>
                              <div className="text-dim text-xs">{se.set_entries.length} sets</div>
                            </div>
                            {se.set_entries.length > 0 && (
                              <div className="row-xs wrap" style={{ marginTop: 6 }}>
                                {se.set_entries.map((entry) => (
                                  <div key={entry.id} className="badge" style={{ fontSize: 12 }}>
                                    {entry.reps}r{entry.weight != null ? ` × ${entry.weight}` : ""}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}