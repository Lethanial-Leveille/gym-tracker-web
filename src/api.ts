const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "https://gym-tracker-api-96ij.onrender.com";

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}