import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

type SetEntry = { id: number; set_number: number; reps: number; weight: number | null };

type SessionExercise = {
  id: number;
  order_index: number;
  notes: string | null;
  exercise: { id: number; name: string };
  set_entries: SetEntry[];
};

type SessionDetail = {
  id: number;
  workout_id: number;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  session_exercises: SessionExercise[];
};

type SessionSummary = {
  id: number;
  workout_id: number;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
};

type ExerciseStats = {
  exercise_id: number;
  last_weight: number | null;
  best_weight: number | null;
};

export default function SessionPage() {
  const [status, setStatus] = useState("");
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [stats, setStats] = useState<Record<number, ExerciseStats>>({});
  const [inputs, setInputs] = useState<Record<number, { reps: string; weight: string }>>({});

  async function loadActive() {
    setStatus("");

    const active = (await api.get("/sessions/active")) as SessionSummary | null;
    if (!active) {
      setSession(null);
      setStats({});
      return;
    }

    const detail = (await api.get(`/sessions/${active.id}`)) as SessionDetail;
    detail.session_exercises.sort((a, b) => a.order_index - b.order_index);
    setSession(detail);

    setInputs((prev) => {
      const copy = { ...prev };
      for (const se of detail.session_exercises) {
        if (!copy[se.id]) copy[se.id] = { reps: "8", weight: "" };
      }
      return copy;
    });

    const statsMap: Record<number, ExerciseStats> = {};
    for (const se of detail.session_exercises) {
      try {
        const s = (await api.get(`/exercises/${se.exercise.id}/stats`)) as ExerciseStats;
        statsMap[se.exercise.id] = s;
      } catch {
        // ignore
      }
    }
    setStats(statsMap);
  }

  useEffect(() => {
    loadActive().catch((e) => setStatus(e.message || String(e)));
  }, []);

  function updateInput(id: number, key: "reps" | "weight", value: string) {
    setInputs((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  }

  async function addSet(seId: number) {
    setStatus("");
    try {
      const reps = Number(inputs[seId]?.reps ?? "0");
      const wStr = (inputs[seId]?.weight ?? "").trim();
      const weight = wStr === "" ? null : Number(wStr);

      if (!Number.isFinite(reps) || reps <= 0) {
        setStatus("Reps must be a positive number");
        return;
      }
      if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
        setStatus("Weight must be empty or a non-negative number");
        return;
      }

      await api.post(`/session-exercises/${seId}/sets`, { reps, weight });
      await loadActive();
      setStatus("Set added");
    } catch (e: any) {
      setStatus(e.message || "Add set failed");
    }
  }

  async function finishSession() {
    if (!session) return;
    setStatus("");
    try {
      await api.post(`/sessions/${session.id}/finish`);
      setStatus("Session finished");
      window.location.assign("/workouts");
    } catch (e: any) {
      setStatus(e.message || "Finish failed");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 920 }}>
      <div className="row">
        <Link to="/workouts" className="badge">Back</Link>
        {status ? <span className="muted">{status}</span> : null}
      </div>

      <div className="spacer" />

      {!session ? (
        <div className="card">
          <h2 className="h2">Active session</h2>
          <p className="muted">No active session.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="header" style={{ marginBottom: 0 }}>
              <div>
                <h1 className="h1" style={{ fontSize: 44 }}>Active session</h1>
                <p className="muted" style={{ marginTop: 6 }}>
                  Session #{session.id} (workout {session.workout_id})
                </p>
              </div>

              <button onClick={finishSession}>Finish</button>
            </div>
          </div>

          <div className="spacer" />

          {session.session_exercises.map((se) => (
            <div key={se.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {se.order_index + 1}. {se.exercise.name}
                  </div>
                  <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                    Last: {stats[se.exercise.id]?.last_weight ?? "-"} | Best: {stats[se.exercise.id]?.best_weight ?? "-"}
                  </div>
                </div>
              </div>

              <div className="spacer" />

              <div className="row">
                <input
                  className="sessionInput"
                  style={{ width: 90 }}
                  type="number"
                  value={inputs[se.id]?.reps ?? ""}
                  onChange={(e) => updateInput(se.id, "reps", e.target.value)}
                  placeholder="reps"
                />
                <input
                  className="sessionInput"
                  style={{ width: 140 }}
                  type="number"
                  value={inputs[se.id]?.weight ?? ""}
                  onChange={(e) => updateInput(se.id, "weight", e.target.value)}
                  placeholder="weight"
                />
                <button className="btnPrimary" onClick={() => addSet(se.id)}>
                  Add set
                </button>
              </div>

              <div className="spacer" />

              {se.set_entries.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>No sets yet.</p>
              ) : (
                <ul className="list" style={{ margin: 0 }}>
                  {se.set_entries.map((s) => (
                    <li key={s.id} style={{ marginBottom: 8 }}>
                      <span className="muted">Set {s.set_number}</span>{" "}
                      <strong>{s.reps}</strong> reps{" "}
                      {s.weight !== null ? (
                        <>
                          <span className="muted">x</span> <strong>{s.weight}</strong>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}