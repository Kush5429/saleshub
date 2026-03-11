import Icon from "./Icon";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",    icon: "home" },
  { id: "docs",       label: "Docs Hub",     icon: "docs" },
  { id: "pricing",    label: "Pricing",      icon: "pricing" },
  { id: "addons",     label: "Add-ons",      icon: "addons" },
  { id: "videos",     label: "Videos",       icon: "video" },
  { id: "resources",  label: "Resources",    icon: "resources" },
  { id: "features",   label: "Features",     icon: "features" },
  { id: "admin",      label: "Admin Panel",  icon: "admin" },
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
      <div style={{ padding: "26px 20px 20px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 4,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Icon name="zap" size={16} color="#000" />
          </div>
          <div>
            <div style={{
              color: "var(--text)", fontWeight: 900,
              fontFamily: "var(--font-display)", fontSize: 15, lineHeight: 1.1,
            }}>
              Sales Hub
            </div>
            <div style={{ color: "var(--text-dim)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Intelligence Platform
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", margin: "0 14px 10px" }} />

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "4px 10px", overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "9px 12px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: isActive ? "var(--accent)18" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                marginBottom: 2,
                transition: "all 0.15s",
                textAlign: "left",
                position: "relative",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--surface2)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              {isActive && (
                <div style={{
                  position: "absolute", left: 0, top: "20%", bottom: "20%",
                  width: 3, borderRadius: 2, background: "var(--accent)",
                }} />
              )}
              <Icon name={item.icon} size={15} color={isActive ? "var(--accent)" : "var(--text-dim)"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Admin toggle */}
      <div style={{ padding: "12px 14px 20px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={onToggleAdmin}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            border: `1px solid ${adminMode ? "var(--accent)55" : "var(--border2)"}`,
            background: adminMode ? "var(--accent)14" : "transparent",
            color: adminMode ? "var(--accent)" : "var(--text-muted)",
            fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <Icon name={adminMode ? "unlock" : "lock"} size={13} color={adminMode ? "var(--accent)" : "var(--text-dim)"} />
          {adminMode ? "Admin Mode ON" : "Enable Admin Mode"}
        </button>
      </div>
    </aside>
  );
}
