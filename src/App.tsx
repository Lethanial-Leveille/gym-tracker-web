import { useState } from "react";

function App() {
  const [message, setMessage] = useState("Not connected yet");

  const checkBackend = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/health");
      const data = await res.json();
      setMessage(JSON.stringify(data));
    } catch (err) {
      setMessage("Backend not reachable");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Gym Tracker</h1>
      <button onClick={checkBackend}>Check Backend</button>
      <p>{message}</p>
    </div>
  );
}

export default App;
