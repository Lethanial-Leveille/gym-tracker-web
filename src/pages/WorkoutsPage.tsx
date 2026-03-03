import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { logout } from "../auth";

type Workout = { id: number; title: string; duration_minutes: number };
type WorkoutsList = { total: number; skip: number; limit: number; items: Workout[] };

export default function WorkoutsPage() {
  const [status, setStatus] = useState("");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState<number>(60);

  async function loadWorkouts() {
    const data = (await api.get("/workouts?skip=0&limit=50")) as WorkoutsList;
    setWorkouts(data.items);
  }

  useEffect(() => {
    loadWorkouts().catch((e) => setStatus(e.message || String(e)));
  }, []);

  const handleLogout = () => {
    logout();
    window.location.assign("/login");
  };

  const handleCreateWorkout = async () => {
    setStatus("");
    try {
      await api.post("/workouts", { title: newTitle, duration_minutes: Number(newDuration) || 0 });
      setNewTitle("");
      setNewDuration(60);
      await loadWorkouts();
      setStatus("Workout created");
    } catch (e: any) {
      setStatus(e.message || "Create failed");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="h1">Gym Tracker</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="row">
        <span className="badge">Ready</span>
        <Link to="/session" className="badge">
          Active session
        </Link>
        <button className="smallBtn" onClick={() => loadWorkouts().catch((e) => setStatus(e.message))}>
          Refresh
        </button>
        {status ? <span className="muted">{status}</span> : null}
      </div>

      <div className="spacer" />

      <div className="card">
        <h2 className="h2">Create workout</h2>
        <div className="row">
          <input
            placeholder="Title (eg Push A)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: 260 }}
          />
          <input
            placeholder="Minutes"
            type="number"
            value={newDuration}
            onChange={(e) => setNewDuration(Number(e.target.value))}
            style={{ width: 120 }}
          />
          <button className="btnPrimary" onClick={handleCreateWorkout} disabled={!newTitle.trim()}>
            Create
          </button>
        </div>
      </div>

      <div className="spacer" />

      <div className="card">
        <h2 className="h2">Workouts</h2>
        {workouts.length === 0 ? (
          <p className="muted">No workouts yet.</p>
        ) : (
          <ul className="list">
            {workouts.map((w) => (
              <li key={w.id} style={{ marginBottom: 10 }}>
                <Link to={`/workouts/${w.id}`}>
                  <button>
                    {w.title} - {w.duration_minutes} min
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}