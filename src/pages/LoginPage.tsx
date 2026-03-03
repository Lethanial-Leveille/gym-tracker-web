import { useState } from "react";
import { login as loginApi, register as registerApi } from "../auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleLogin = async () => {
    setStatus("");
    try {
      await loginApi(email, password);
      window.location.assign("/workouts");
    } catch (e: any) {
      setStatus(e.message || "Login failed");
    }
  };

  const handleRegister = async () => {
    setStatus("");
    try {
      await registerApi(email, password);
      setStatus("Registered, now log in");
    } catch (e: any) {
      setStatus(e.message || "Register failed");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="header">
        <h1 className="h1">Gym Tracker</h1>
        <span className="badge">Sign in</span>
      </div>

      {status ? <div className="alert">{status}</div> : null}
      <div className="spacer" />

      <div className="card">
        <h2 className="h2">Account</h2>
        <div className="row">
          <input
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: 260 }}
          />
          <input
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: 220 }}
          />
        </div>

        <div className="spacer" />

        <div className="row">
          <button className="btnPrimary" onClick={handleLogin}>
            Login
          </button>
          <button onClick={handleRegister}>Register</button>
          <span className="muted">Password must be 8+ chars.</span>
        </div>
      </div>
    </div>
  );
}