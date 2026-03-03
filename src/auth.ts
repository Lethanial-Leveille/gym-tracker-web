import { setToken } from "./api";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "https://gym-tracker-api-96ij.onrender.com";

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Login failed (${res.status}) - ${text || res.statusText}`);
  }

  const data = (await res.json()) as { access_token: string; token_type: string };
  setToken(data.access_token);
  return data;
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Register failed (${res.status}) - ${text || res.statusText}`);
  }

  return res.json();
}

export function logout() {
  setToken(null);
}