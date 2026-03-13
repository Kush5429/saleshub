import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

export default function LoginPage() {
  const { login } = useAuth();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "var(--surface2)", border: "1px solid var(--border2)",
    borderRadius: "var(--radius-sm)", padding: "11px 14px",
    color: "var(--text)", fontSize: 14, outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)", padding: "40px 36px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "var(--accent)", borderRadius: "50%", opacity: 0.05, filter: "blur(60px)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px var(--accent)40" }}>
            <Icon name="zap" size={16} color="#000" />
          </div>
          <div>
            <div style={{ color: "var(--text)", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "-0.02em" }}>DoubleTick</div>
            <div style={{ color: "var(--text-dim)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sales Hub</div>
          </div>
        </div>

        <h2 style={{ color: "var(--text)", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.03em" }}>Sign in</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: "0 0 28px" }}>Access your internal sales intelligence platform.</p>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</label>
            <input
              type="email" required placeholder="you@doubletick.io"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e  => e.target.style.borderColor = "var(--border2)"}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Password</label>
            <input
              type="password" required placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e  => e.target.style.borderColor = "var(--border2)"}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 16, color: "#ff6b6b", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px", borderRadius: "var(--radius-sm)",
            background: loading ? "var(--surface2)" : "var(--accent)",
            color: loading ? "var(--text-muted)" : "#000",
            border: "none", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)", letterSpacing: "-0.01em", transition: "all 0.15s",
          }}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p style={{ color: "var(--text-dim)", fontSize: 12, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Contact your admin to create an account.<br />
          <span style={{ color: "var(--text-muted)" }}>Internal platform — DoubleTick team only.</span>
        </p>
      </div>
    </div>
  );
}
