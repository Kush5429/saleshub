import { useState } from "react";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { id: "dashboard",      label: "Dashboard",      icon: "home" },
  { id: "docs",           label: "Docs Hub",        icon: "docs" },
  { id: "pricing",        label: "Pricing",         icon: "pricing" },
  { id: "addons",         label: "Add-ons",         icon: "addons" },
  { id: "videos",         label: "Videos",          icon: "video" },
  { id: "resources",      label: "Resources",       icon: "resources" },
  { id: "features",       label: "Features",        icon: "features" },
  { id: "intelligence",   label: "Intelligence",    icon: "zap" },
  { id: "admin",          label: "Admin Panel",     icon: "admin" },
];

export default function Sidebar({ active, onNav, onSearch }) {
  const { user, logout, isAdmin } = useAuth();
  const [searchVal, setSearchVal] = useState("");

  const handleSearch = (val) => {
    setSearchVal(val);
    onSearch(val);
  };

  return (
    <aside style={{
      width: 220, minHeight: "100vh",
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", flexShrink: 0,
      position: "sticky", top: 0, height: "100vh",
    }}>

      {/* Logo */}
      <div style={{ padding: "20px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 16px var(--accent)40" }}>
            <Icon name="zap" size={15} color="#000" />
          </div>
          <div>
            <div style={{ color: "var(--text)", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 15, lineHeight: 1.1, letterSpacing: "-0.01em" }}>DoubleTick</div>
            <div style={{ color: "var(--text-dim)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2, fontWeight: 500 }}>Sales Playbook</div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: "0 10px 10px" }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <Icon name="search" size={12} color="var(--text-dim)" />
          </div>
          <input
            value={searchVal}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search…"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: "var(--radius-sm)", padding: "7px 10px 7px 30px",
              color: "var(--text)", fontSize: 12.5, outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={e  => { e.target.style.borderColor = "var(--accent)"; if (searchVal) onNav("search"); }}
            onBlur={e   => e.target.style.borderColor = "var(--border2)"}
            onKeyDown={e => { if (e.key === "Enter" && searchVal.trim()) onNav("search"); }}
          />
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "0 12px 6px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          // Hide Intelligence from sales users
          if (item.id === "intelligence" && !isAdmin) return null;
          // Hide Admin Panel from sales users
          if (item.id === "admin" && !isAdmin) return null;

          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => { onNav(item.id); setSearchVal(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "none",
                background: isActive ? "var(--accent)14" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                cursor: "pointer", marginBottom: 1, transition: "all 0.12s",
                textAlign: "left", position: "relative", letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.color = "var(--text)"; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}}
            >
              {isActive && <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: 3, background: "var(--accent)" }} />}
              <Icon name={item.icon} size={14} color={isActive ? "var(--accent)" : "var(--text-dim)"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: "8px 10px 14px", borderTop: "1px solid var(--border)" }}>
        {user && (
          <div style={{ marginBottom: 8, padding: "8px 10px", background: "var(--surface2)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ color: "var(--text)", fontSize: 12.5, fontWeight: 600, marginBottom: 2, letterSpacing: "-0.01em" }}>{user.name}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-dim)", fontSize: 11, textTransform: "capitalize" }}>{user.role}</span>
              {isAdmin && <span style={{ background: "var(--accent)18", color: "var(--accent)", fontSize: 9.5, fontWeight: 700, padding: "1px 7px", borderRadius: 99, letterSpacing: "0.05em", textTransform: "uppercase" }}>Admin</span>}
            </div>
          </div>
        )}
        <button onClick={logout}
          style={{
            display: "flex", alignItems: "center", gap: 7, width: "100%",
            padding: "7px 10px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border2)", background: "transparent",
            color: "var(--text-muted)", fontFamily: "var(--font-body)",
            fontSize: 12.5, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,68,68,0.3)"; e.currentTarget.style.color = "#ff6b6b"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <Icon name="lock" size={12} color="currentColor" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
