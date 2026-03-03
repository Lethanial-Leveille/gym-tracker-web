import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

type WorkoutDetail = {
  id: number;
  title: string;
  duration_minutes: number;
  exercises: Array<{
    id: number;
    order_index: number;
    notes: string | null;
    exercise: { id: number; name: string };
  }>;
};

type Exercise = {
  id: number;
  name: string;
  primary_muscle?: string | null;
  classification?: string | null;
};

type ExercisesList = {
  total: number;
  skip: number;
  limit: number;
  items: Exercise[];
};

export default function WorkoutDetailPage() {
  const { id } = useParams();
  const workoutId = Number(id);

  const [status, setStatus] = useState("");
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Exercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  async function loadWorkout() {
    const data = (await api.get(`/workouts/${workoutId}`)) as WorkoutDetail;
    setWorkout(data);
  }

  useEffect(() => {
    if (!workoutId) return;
    loadWorkout().catch((e) => setStatus(e.message || String(e)));
  }, [workoutId]);

  async function searchExercises() {
    setStatus("");
    setIsSearching(true);
    try {
      const data = (await api.get(
        `/exercises?skip=0&limit=10&q=${encodeURIComponent(query)}`
      )) as ExercisesList;
      setResults(data.items);
    } catch (e: any) {
      setStatus(e.message || "Search failed");
    } finally {
      setIsSearching(false);
    }
  }

  async function addExercise(exerciseId: number) {
    if (!workout) return;
    setStatus("");

    const nextOrder = workout.exercises.length;

    try {
      await api.post(`/workouts/${workout.id}/exercises`, {
        exercise_id: exerciseId,
        order_index: nextOrder,
        notes: null,
      });

      await loadWorkout();
      setStatus("Added exercise");
    } catch (e: any) {
      setStatus(e.message || "Add failed");
    }
  }

  async function startSession() {
    if (!workout) return;
    setStatus("");
    try {
      await api.post(`/workouts/${workout.id}/start`);
      window.location.assign("/session");
    } catch (e: any) {
      // If active session exists, still send them to session page
      setStatus(e.message || "Start failed");
      window.location.assign("/session");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 880 }}>
      <div className="row">
        <Link to="/workouts" className="badge">Back</Link>
        <Link to="/session" className="badge">Active session</Link>
        {status ? <span className="muted">{status}</span> : null}
      </div>

      <div className="spacer" />

      {!workout ? (
        <div className="card">
          <p className="muted">Loading...</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="header" style={{ marginBottom: 0 }}>
              <div>
                <h1 className="h1" style={{ fontSize: 44 }}>{workout.title}</h1>
                <p className="muted" style={{ marginTop: 6 }}>
                  Duration: {workout.duration_minutes} min
                </p>
              </div>

              <button className="btnPrimary" onClick={startSession}>
                Start workout
              </button>
            </div>
          </div>

          <div className="spacer" />

          <div className="card">
            <h2 className="h2">Exercises</h2>
            {workout.exercises.length === 0 ? <p className="muted">No exercises yet.</p> : null}
            <ul className="list">
              {workout.exercises
                .slice()
                .sort((a, b) => a.order_index - b.order_index)
                .map((we) => (
                  <li key={we.id} style={{ marginBottom: 8 }}>
                    <span className="muted">{we.order_index + 1}.</span> {we.exercise.name}
                  </li>
                ))}
            </ul>
          </div>

          <div className="spacer" />

          <div className="card">
            <h2 className="h2">Add exercise</h2>
            <div className="row">
              <input
                placeholder="Search (eg bench)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: 260 }}
              />
              <button onClick={searchExercises} disabled={!query.trim() || isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="spacer" />

            {results.length > 0 ? (
              <ul className="list">
                {results.map((ex) => (
                  <li key={ex.id} style={{ marginBottom: 10 }}>
                    <button className="smallBtn btnPrimary" onClick={() => addExercise(ex.id)}>
                      Add
                    </button>{" "}
                    {ex.name}
                    {ex.primary_muscle ? <span className="muted"> - {ex.primary_muscle}</span> : null}
                    {ex.classification ? <span className="muted"> ({ex.classification})</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Search to find exercises.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}