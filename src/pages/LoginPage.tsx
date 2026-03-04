import { useState } from "react";
import { login as loginApi, register as registerApi } from "../auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setStatus("");
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setStatus("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await loginApi(trimmedEmail, trimmedPass);
        window.location.assign("/");
      } else {
        await registerApi(trimmedEmail, trimmedPass);
        setStatus("Account created — you can log in now");
        setIsLogin(true);
      }
    } catch (e: any) {
      setStatus(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="login-shell">
      <div className="login-card stack-lg animate-in">
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Gym<span className="text-accent">Tracker</span>
          </div>
          <p className="text-muted text-sm" style={{ marginTop: 6 }}>
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 24 }}>
          <div className="stack-md">
            <div className="stack-xs">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>

            <div className="stack-xs">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="8+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            {status && (
              <div className={`alert ${status.includes("created") ? "alert-success" : "alert-error"}`}>
                {status}
              </div>
            )}

            <button
              className="btn btn-primary btn-block"
              onClick={handleSubmit}
              disabled={loading}
              style={{ height: 48, fontSize: 16, fontWeight: 600, marginTop: 4 }}
            >
              {loading ? "..." : isLogin ? "Log in" : "Create account"}
            </button>
          </div>
        </div>

        {/* Toggle */}
        <div style={{ textAlign: "center" }}>
          <span className="text-dim text-sm">
            {isLogin ? "No account? " : "Already have one? "}
          </span>
          <button
            className="btn-ghost"
            onClick={() => { setIsLogin(!isLogin); setStatus(""); }}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
