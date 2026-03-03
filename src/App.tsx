import { useEffect, useState } from "react";
import { apiGet } from "./api";

type Exercise = {
  id: number;
  name: string;
  primary_muscle: string;
  classification: string;
};

function App() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await apiGet("/exercises?limit=20");
        setExercises(data.items);
      } catch (err) {
        setError("Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (error) return <p style={{ padding: 40 }}>{error}</p>;

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Gym Tracker</h1>

      <div style={{ marginTop: 20 }}>
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            style={{
              padding: 12,
              marginBottom: 10,
              borderRadius: 8,
              background: "#1e1e1e",
            }}
          >
            <h3>{exercise.name}</h3>
            <p>
              {exercise.primary_muscle} • {exercise.classification}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;