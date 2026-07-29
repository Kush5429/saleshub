import Icon from "./Icon";

/* ─── BUTTON ─────────────────────────────────────── */
const VARIANTS = {
  primary: { background:"var(--accent)", color:"#000", border:"none", fontWeight:600 },
  danger:  { background:"transparent", color:"#f87171", border:"1px solid #f8717130", fontWeight:500 },
  ghost:   { background:"transparent", color:"var(--text-muted)", border:"1px solid var(--border2)", fontWeight:500 },
  outline: { background:"transparent", color:"var(--accent)", border:"1px solid var(--accent)40", fontWeight:600 },
};

export function Btn({ onClick, children, variant="primary", small=false, style={} }) {
  return (
    <button onClick={onClick} style={{
      ...VARIANTS[variant],
      padding: small ? "4px 10px" : "7px 15px",
      borderRadius: "var(--radius-sm)",
      fontSize: small ? 11.5 : 13,
      cursor: "pointer",
      fontFamily: "var(--font-body)",
      letterSpacing: "-0.01em",
      display: "inline-flex", alignItems: "center", gap: 5,
      whiteSpace: "nowrap",
      transition: "opacity 0.15s, transform 0.15s",
      lineHeight: 1.5,
      ...style,
    }}
    onMouseEnter={e => { e.currentTarget.style.opacity = "0.75"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
    >{children}</button>
  );
}

/* ─── BADGE ─────────────────────────────────────── */
export function Badge({ text, color = "var(--accent)" }) {
  return (
    <span style={{
      background: color + "12",
      color,
      border: `1px solid ${color}25`,
      borderRadius: 99,
      padding: "2px 8px",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      lineHeight: 1.7,
    }}>{text}</span>
  );
}

/* ─── CARD ──────────────────────────────────────── */
export function Card({ children, style = {}, className = "", onClick }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >{children}</div>
  );
}

/* ─── FIELD ──────────────────────────────────────── */
const inputBase = {
  width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)",
  borderRadius: "var(--radius-sm)", padding: "9px 12px",
  color: "var(--text)", fontSize: 13.5, fontFamily: "var(--font-body)",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  lineHeight: 1.5, letterSpacing: "-0.01em",
};

export function Field({ label, value, onChange, type = "text", placeholder = "", as = "input" }) {
  const focus = e => (e.target.style.borderColor = "var(--accent)");
  const blur  = e => (e.target.style.borderColor = "var(--border2)");
  const props = { value, placeholder, onFocus: focus, onBlur: blur, onChange: e => onChange(e.target.value), style: inputBase };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", color: "var(--text-muted)", fontSize: 11, fontWeight: 600,
        marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
      }}>{label}</label>
      {as === "textarea"
        ? <textarea {...props} rows={3} style={{ ...inputBase, resize: "vertical" }} />
        : <input type={type} {...props} />}
    </div>
  );
}

/* ─── SECTION HEADER ─────────────────────────────── */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
      <div>
        <h2 style={{
          color: "var(--text)", fontSize: 24, fontWeight: 700,
          fontFamily: "var(--font-display)", margin: 0, letterSpacing: "-0.03em",
        }}>{title}</h2>
        {subtitle && (
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: "5px 0 0", maxWidth: 500, lineHeight: 1.55, letterSpacing: "-0.01em" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ─── STAT CARD ──────────────────────────────────── */
export function StatCard({ label, value, icon, accent = "var(--accent)" }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px" }}>
      <div style={{
        width: 46, height: 46, borderRadius: "var(--radius-md)",
        background: accent + "12", border: `1px solid ${accent}25`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name={icon} size={20} color={accent} />
      </div>
      <div>
        <div style={{
          color: "var(--text)", fontSize: 34, fontWeight: 800,
          fontFamily: "var(--font-display)", lineHeight: 1, letterSpacing: "-0.04em",
        }}>{value}</div>
        <div style={{
          color: "var(--text-muted)", fontSize: 12, marginTop: 4,
          textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
        }}>{label}</div>
      </div>
    </Card>
  );
}

/* ─── EMPTY STATE ───────────────────────────────── */
export function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-dim)" }}>
      <div style={{
        width: 44, height: 44, borderRadius: "var(--radius-md)",
        background: "var(--surface2)", border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
      }}>
        <Icon name={icon} size={18} color="var(--text-dim)" />
      </div>
      <p style={{ fontSize: 13.5, color: "var(--text-muted)", letterSpacing: "-0.01em" }}>{message}</p>
    </div>
  );
}
