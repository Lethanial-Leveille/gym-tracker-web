import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean>(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setOk(false);
      window.location.replace("/login");
    }
  }, []);

  if (!ok) return null;
  return <>{children}</>;
}