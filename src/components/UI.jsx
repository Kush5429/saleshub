import Icon from "./Icon";

/* ─────────────────── BUTTON ─────────────────── */
const VARIANT_STYLES = {
  primary: { background: "var(--accent)", color: "#000", border: "none", fontWeight: 700 },
  danger:  { background: "transparent", color: "#ff4444", border: "1px solid #ff444466", fontWeight: 600 },
  ghost:   { background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border2)", fontWeight: 500 },
  outline: { background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)", fontWeight: 600 },
};

export function Btn({ onClick, children, variant = "primary", small = false, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...VARIANT_STYLES[variant],
        padding: small ? "5px 12px" : "9px 18px",
        borderRadius: "var(--radius-sm)",
        fontSize: small ? 12 : 13,
        cursor: "pointer",
        fontFamily: "var(--font-display)",
        letterSpacing: "0.02em",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        transition: "opacity 0.15s, transform 0.1s",
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      {children}
    </button>
  );
}

/* ─────────────────── BADGE ─────────────────── */
export function Badge({ text, color = "var(--accent)" }) {
  return (
    <span style={{
      background: color + "1a",
      color,
      border: `1px solid ${color}44`,
      borderRadius: 20,
      padding: "2px 9px",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      {text}
    </span>
  );
}

/* ─────────────────── CARD ─────────────────── */
export function Card({ children, style = {}, className = "" }) {
  return (
    <div className={className} style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: 24,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────── FIELD ─────────────────── */
const inputBase = {
  width: "100%",
  background: "var(--surface2)",
  border: "1px solid var(--border2)",
  borderRadius: "var(--radius-sm)",
  padding: "9px 13px",
  color: "var(--text)",
  fontSize: 13,
  fontFamily: "var(--font-body)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

export function Field({ label, value, onChange, type = "text", placeholder = "", as = "input" }) {
  const handleFocus = e => (e.target.style.borderColor = "var(--accent)");
  const handleBlur  = e => (e.target.style.borderColor = "var(--border2)");
  const props = {
    value, placeholder,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: e => onChange(e.target.value),
    style: inputBase,
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", color: "var(--text-muted)", fontSize: 11,
        fontWeight: 700, marginBottom: 5,
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        {label}
      </label>
      {as === "textarea"
        ? <textarea {...props} rows={3} style={{ ...inputBase, resize: "vertical" }} />
        : <input type={type} {...props} />
      }
    </div>
  );
}

/* ─────────────────── SECTION HEADER ─────────────────── */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
      <div>
        <h2 style={{ color: "var(--text)", fontSize: 26, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "6px 0 0", maxWidth: 500 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ─────────────────── STAT CARD ─────────────────── */
export function StatCard({ label, value, icon, accent = "var(--accent)" }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{
        width: 46, height: 46, borderRadius: "var(--radius-md)",
        background: accent + "1a", border: `1px solid ${accent}33`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name={icon} size={20} color={accent} />
      </div>
      <div>
        <div style={{ color: "var(--text)", fontSize: 28, fontWeight: 900, fontFamily: "var(--font-display)", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ color: "var(--text-dim)", fontSize: 11, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────── EMPTY STATE ─────────────────── */
export function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-dim)" }}>
      <Icon name={icon} size={36} color="var(--border2)" />
      <p style={{ marginTop: 12, fontSize: 14 }}>{message}</p>
    </div>
  );
}
