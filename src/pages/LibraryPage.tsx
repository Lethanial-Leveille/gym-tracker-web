import { useEffect, useState } from "react";
import { api } from "../api";

type Exercise = {
  id: number;
  name: string;
  primary_muscle: string | null;
  secondary_muscles: string | null;
  classification: string | null;
  notes: string | null;
};

type ExerciseStats = {
  exercise_id: number;
  last_weight: number | null;
  best_weight: number | null;
};

const MUSCLE_GROUPS = [
  "All",
  "chest",
  "shoulders",
  "triceps",
  "lats",
  "upper_back",
  "biceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
];

function formatMuscle(m: string) {
  return m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  // Stats for expanded exercise
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [stats, setStats] = useState<Record<number, ExerciseStats>>({});

  async function load(muscle?: string, q?: string) {
    setLoading(true);
    try {
      let url = `/exercises?skip=0&limit=100`;
      if (muscle && muscle !== "All") url += `&primary_muscle=${encodeURIComponent(muscle)}`;
      if (q) url += `&q=${encodeURIComponent(q)}`;

      const data = (await api.get(url)) as any;
      setExercises(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handleFilterChange(muscle: string) {
    setFilter(muscle);
    setExpandedId(null);
    load(muscle, query);
  }

  function handleSearch() {
    setExpandedId(null);
    load(filter, query);
  }

  async function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    if (!stats[id]) {
      try {
        const s = (await api.get(`/exercises/${id}/stats`)) as ExerciseStats;
        setStats((prev) => ({ ...prev, [id]: s }));
      } catch { /* ignore */ }
    }
  }

  return (
    <div className="stack-lg animate-in stagger">
      <div className="animate-in">
        <div className="page-title">Exercise Library</div>
        <p className="text-muted text-sm" style={{ marginTop: 4 }}>
          {total} exercises available
        </p>
      </div>

      {/* Search */}
      <div className="row-sm animate-in">
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="btn btn-sm" onClick={handleSearch}>Search</button>
      </div>

      {/* Muscle filters */}
      <div className="row-xs wrap animate-in">
        {MUSCLE_GROUPS.map((m) => (
          <button
            key={m}
            className={`chip ${filter === m ? "active" : ""}`}
            onClick={() => handleFilterChange(m)}
          >
            {m === "All" ? "All" : formatMuscle(m)}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      {loading ? (
        <div className="card"><div className="empty animate-pulse">Loading...</div></div>
      ) : exercises.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <div>No exercises found</div>
          </div>
        </div>
      ) : (
        <div className="stack-xs animate-in">
          {exercises.map((ex) => {
            const isOpen = expandedId === ex.id;
            const exStats = stats[ex.id];

            return (
              <div
                key={ex.id}
                className="card-flat"
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                onClick={() => toggleExpand(ex.id)}
              >
                <div className="row-sm between">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{ex.name}</div>
                    <div className="text-dim text-xs" style={{ marginTop: 2 }}>
                      {ex.primary_muscle ? formatMuscle(ex.primary_muscle) : "General"}
                      {ex.classification ? ` · ${ex.classification}` : ""}
                    </div>
                  </div>
                  <span className="text-dim" style={{ fontSize: 16, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
                    ▾
                  </span>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div className="stat-block">
                        <div className="stat-value text-accent">
                          {exStats?.best_weight != null ? exStats.best_weight : "—"}
                        </div>
                        <div className="stat-label">Best (lbs)</div>
                      </div>
                      <div className="stat-block">
                        <div className="stat-value">
                          {exStats?.last_weight != null ? exStats.last_weight : "—"}
                        </div>
                        <div className="stat-label">Last (lbs)</div>
                      </div>
                    </div>

                    {ex.secondary_muscles && (
                      <div className="text-dim text-xs" style={{ marginTop: 10 }}>
                        Also targets: {ex.secondary_muscles.split(",").map(formatMuscle).join(", ")}
                      </div>
                    )}

                    {ex.notes && (
                      <div className="text-dim text-xs" style={{ marginTop: 6 }}>
                        {ex.notes}
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