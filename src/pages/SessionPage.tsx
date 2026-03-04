import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

/* ── Types ── */
type SetEntry = { id: number; set_number: number; reps: number; weight: number | null };

type SessionExercise = {
  id: number;
  order_index: number;
  notes: string | null;
  exercise: { id: number; name: string; primary_muscle?: string | null; classification?: string | null };
  set_entries: SetEntry[];
};

type SessionDetail = {
  id: number;
  title: string;
  workout_id: number | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  session_exercises: SessionExercise[];
};

type Exercise = {
  id: number;
  name: string;
  primary_muscle?: string | null;
  classification?: string | null;
};

type ExerciseStats = {
  exercise_id: number;
  last_weight: number | null;
  best_weight: number | null;
};

/* ── Helpers ── */
function formatHMS(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function SessionPage() {
  const nav = useNavigate();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [stats, setStats] = useState<Record<number, ExerciseStats>>({});
  const [inputs, setInputs] = useState<Record<number, { reps: string; weight: string }>>({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Start session form
  const [sessionName, setSessionName] = useState("Workout");

  // Exercise search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Timer
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = useMemo(() => {
    if (!session?.started_at) return null;
    const start = new Date(session.started_at).getTime();
    if (!Number.isFinite(start)) return null;
    return Math.floor((nowMs - start) / 1000);
  }, [session, nowMs]);

  /* ── Load active session ── */
  async function loadActive() {
    setStatus("");
    try {
      const active = await api.get("/sessions/active") as any;
      if (!active) {
        setSession(null);
        setStats({});
        setSearchResults([]);
        setLoading(false);
        return;
      }

      const detail = (await api.get(`/sessions/${active.id}`)) as SessionDetail;
      detail.session_exercises.sort((a, b) => a.order_index - b.order_index);
      setSession(detail);

      // Initialize set inputs for any new exercises
      setInputs((prev) => {
        const copy = { ...prev };
        for (const se of detail.session_exercises) {
          if (!copy[se.id]) copy[se.id] = { reps: "8", weight: "" };
        }
        return copy;
      });

      // Fetch stats for each exercise (best/last weight)
      const statsMap: Record<number, ExerciseStats> = {};
      for (const se of detail.session_exercises) {
        try {
          const s = (await api.get(`/exercises/${se.exercise.id}/stats`)) as ExerciseStats;
          statsMap[se.exercise.id] = s;
        } catch { /* ignore */ }
      }
      setStats(statsMap);
    } catch (e: any) {
      setStatus(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadActive(); }, []);

  /* ── Actions ── */
  async function startSession() {
    const name = sessionName.trim();
    if (!name) { setStatus("Give your session a name"); return; }
    setStatus("");
    try {
      await api.post("/sessions/start", { title: name });
      await loadActive();
    } catch (e: any) {
      setStatus(e.message || "Start failed");
      await loadActive().catch(() => {});
    }
  }

  async function finishSession() {
    if (!session) return;
    try {
      await api.post(`/sessions/${session.id}/finish`);
      nav("/");
    } catch (e: any) {
      setStatus(e.message || "Finish failed");
    }
  }

  async function searchExercises() {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const data = await api.get(`/exercises?skip=0&limit=15&q=${encodeURIComponent(searchQuery)}`) as any;
      setSearchResults(data.items);
    } catch (e: any) {
      setStatus(e.message || "Search failed");
    } finally {
      setIsSearching(false);
    }
  }

  async function addExercise(exerciseId: number) {
    if (!session) return;
    try {
      await api.post(`/sessions/${session.id}/exercises`, { exercise_id: exerciseId });
      await loadActive();
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch (e: any) {
      setStatus(e.message || "Add failed");
    }
  }

  function updateInput(id: number, key: "reps" | "weight", value: string) {
    setInputs((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  }

  async function addSet(seId: number) {
    setStatus("");
    const reps = Number(inputs[seId]?.reps ?? "0");
    const wStr = (inputs[seId]?.weight ?? "").trim();
    const weight = wStr === "" ? null : Number(wStr);

    if (!Number.isFinite(reps) || reps <= 0) { setStatus("Reps must be a positive number"); return; }
    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) { setStatus("Weight must be valid"); return; }

    try {
      await api.post(`/session-exercises/${seId}/sets`, { reps, weight });
      await loadActive();
    } catch (e: any) {
      setStatus(e.message || "Add set failed");
    }
  }

  const handleSetKeyDown = (e: React.KeyboardEvent, seId: number) => {
    if (e.key === "Enter") addSet(seId);
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="stack-lg animate-in">
        <div className="page-title">Session</div>
        <div className="card"><div className="empty animate-pulse">Loading...</div></div>
      </div>
    );
  }

  /* ── No active session: show start form ── */
  if (!session) {
    return (
      <div className="stack-lg animate-in stagger">
        <div className="animate-in">
          <div className="page-title">Start Session</div>
          <p className="text-muted text-sm" style={{ marginTop: 6 }}>
            Name your workout, then add exercises as you go.
          </p>
        </div>

        {status && <div className="alert alert-error animate-in">{status}</div>}

        <div className="card animate-in">
          <div className="stack-md">
            <div className="stack-xs">
              <label className="label">Session name</label>
              <input
                className="input input-lg"
                placeholder="e.g. Push Day, Upper Body, Legs..."
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startSession()}
                autoFocus
              />
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={startSession}
              style={{ height: 50, fontSize: 16, fontWeight: 600 }}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active session ── */
  return (
    <div className="stack-md animate-in stagger">
      {/* Session Header */}
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="label" style={{ marginBottom: 4 }}>Active Session</div>
          <div className="page-title">{session.title}</div>
        </div>
        <div className="stack-xs" style={{ alignItems: "flex-end" }}>
          <div className="timer">
            {elapsed !== null ? formatHMS(elapsed) : "--:--:--"}
          </div>
          <button className="btn btn-sm btn-danger" onClick={finishSession}>
            Finish
          </button>
        </div>
      </div>

      {status && <div className="alert alert-error">{status}</div>}

      {/* Add Exercise Button / Search */}
      <div className="card animate-in">
        {!showSearch ? (
          <button
            className="btn btn-primary btn-block"
            onClick={() => setShowSearch(true)}
          >
            + Add Exercise
          </button>
        ) : (
          <div className="stack-sm">
            <div className="row-sm">
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchExercises()}
                autoFocus
              />
              <button className="btn btn-sm" onClick={searchExercises} disabled={!searchQuery.trim() || isSearching}>
                {isSearching ? "..." : "Search"}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(""); }}>
                ✕
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="stack" style={{ maxHeight: 280, overflowY: "auto" }}>
                {searchResults.map((ex) => (
                  <div key={ex.id} className="search-item">
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 15 }}>{ex.name}</div>
                      <div className="text-dim text-xs">
                        {ex.primary_muscle || "General"}
                        {ex.classification ? ` · ${ex.classification}` : ""}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => addExercise(ex.id)}>
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="text-dim text-sm" style={{ padding: "8px 0" }}>
                No results. Try a different term.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exercise List */}
      {session.session_exercises.length === 0 ? (
        <div className="card animate-in">
          <div className="empty">
            <div className="empty-icon">🏋️</div>
            <div>No exercises yet</div>
            <div className="text-dim text-xs" style={{ marginTop: 4 }}>
              Tap "Add Exercise" to get started
            </div>
          </div>
        </div>
      ) : (
        session.session_exercises.map((se) => (
          <div key={se.id} className="exercise-card animate-in">
            <div className="exercise-header">
              <div>
                <div className="exercise-name">{se.exercise.name}</div>
                <div className="exercise-meta">
                  {se.exercise.primary_muscle || "General"}
                  {stats[se.exercise.id]?.best_weight != null && (
                    <> · PR: {stats[se.exercise.id].best_weight}lbs</>
                  )}
                  {stats[se.exercise.id]?.last_weight != null && (
                    <> · Last: {stats[se.exercise.id].last_weight}lbs</>
                  )}
                </div>
              </div>
              <div className="badge">{se.set_entries.length} sets</div>
            </div>

            <div className="spacer-sm" />

            {/* Existing sets */}
            {se.set_entries.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                {se.set_entries.map((s) => (
                  <div key={s.id} className="set-row">
                    <div className="set-number">{s.set_number}</div>
                    <div style={{ fontSize: 14 }}>
                      <strong>{s.reps}</strong> <span className="text-dim">reps</span>
                    </div>
                    <div style={{ fontSize: 14 }}>
                      {s.weight !== null ? (
                        <><strong>{s.weight}</strong> <span className="text-dim">lbs</span></>
                      ) : (
                        <span className="text-dim">—</span>
                      )}
                    </div>
                    <div />
                  </div>
                ))}
              </div>
            )}

            {/* Add set inputs */}
            <div className="set-row" style={{ borderTop: se.set_entries.length > 0 ? "1px solid var(--border)" : "none", paddingTop: 10 }}>
              <div className="set-number" style={{ color: "var(--accent)" }}>
                {se.set_entries.length + 1}
              </div>
              <input
                className="set-input"
                type="number"
                placeholder="reps"
                value={inputs[se.id]?.reps ?? ""}
                onChange={(e) => updateInput(se.id, "reps", e.target.value)}
                onKeyDown={(e) => handleSetKeyDown(e, se.id)}
              />
              <input
                className="set-input"
                type="number"
                placeholder="lbs"
                value={inputs[se.id]?.weight ?? ""}
                onChange={(e) => updateInput(se.id, "weight", e.target.value)}
                onKeyDown={(e) => handleSetKeyDown(e, se.id)}
              />
              <button className="btn btn-sm btn-primary" style={{ padding: "0 10px" }} onClick={() => addSet(se.id)}>
                ✓
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}