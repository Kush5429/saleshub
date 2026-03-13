import { createContext, useContext, useState, useEffect, useCallback } from "react";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem("dt_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${BASE}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(json => {
        if (json.success) setUser(json.data);
        else { localStorage.removeItem("dt_token"); setToken(null); }
      })
      .catch(() => { localStorage.removeItem("dt_token"); setToken(null); })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const login = useCallback(async (email, password) => {
    const res  = await fetch(`${BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Login failed");
    localStorage.setItem("dt_token", json.data.token);
    setToken(json.data.token);
    setUser(json.data.user);
    return json.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("dt_token");
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
