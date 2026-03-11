import Icon from "./Icon";

const NAV_ITEMS = [
  { id:"dashboard", label:"Dashboard",   icon:"home" },
  { id:"docs",      label:"Docs Hub",    icon:"docs" },
  { id:"pricing",   label:"Pricing",     icon:"pricing" },
  { id:"addons",    label:"Add-ons",     icon:"addons" },
  { id:"videos",    label:"Videos",      icon:"video" },
  { id:"resources", label:"Resources",   icon:"resources" },
  { id:"features",  label:"Features",    icon:"features" },
  { id:"admin",     label:"Admin Panel", icon:"admin" },
];

export default function Sidebar({ active, onNav, adminMode, onToggleAdmin }) {
  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      height: "100vh",
    }}>

      {/* Logo */}
      <div style={{ padding: "20px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 0 16px var(--accent)40",
          }}>
            <Icon name="zap" size={15} color="#000" />
          </div>
          <div>
            <div style={{
              color: "var(--text)", fontWeight: 700,
              fontFamily: "var(--font-display)", fontSize: 15,
              lineHeight: 1.1, letterSpacing: "-0.01em",
            }}>DoubleTick</div>
            <div style={{
              color: "var(--text-dim)", fontSize: 9,
              letterSpacing: "0.1em", textTransform: "uppercase",
              marginTop: 2, fontWeight: 500,
            }}>Sales Playbook</div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "0 12px 6px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "7px 10px",
                borderRadius: "var(--radius-sm)", border: "none",
                background: isActive ? "var(--accent)14" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                cursor: "pointer", marginBottom: 1,
                transition: "all 0.12s", textAlign: "left",
                position: "relative", letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.color = "var(--text)"; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}}
            >
              {isActive && (
                <div style={{
                  position: "absolute", left: 0, top: "20%", bottom: "20%",
                  width: 3, borderRadius: 3, background: "var(--accent)",
                }} />
              )}
              <Icon name={item.icon} size={14} color={isActive ? "var(--accent)" : "var(--text-dim)"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Admin toggle */}
      <div style={{ padding: "8px 8px 14px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={onToggleAdmin}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            width: "100%", padding: "8px 10px",
            borderRadius: "var(--radius-sm)",
            border: `1px solid ${adminMode ? "var(--accent)30" : "var(--border2)"}`,
            background: adminMode ? "var(--accent)0c" : "transparent",
            color: adminMode ? "var(--accent)" : "var(--text-muted)",
            fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 500,
            cursor: "pointer", transition: "all 0.15s", letterSpacing: "-0.01em",
          }}
        >
          <Icon name={adminMode ? "unlock" : "lock"} size={12} color={adminMode ? "var(--accent)" : "var(--text-dim)"} />
          {adminMode ? "Admin Mode ON" : "Enable Admin Mode"}
          {adminMode && (
            <span style={{
              marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent)", animation: "pulse 2s infinite", flexShrink: 0,
            }} />
          )}
        </button>
      </div>
    </aside>
  );
}
