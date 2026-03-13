import { useState } from "react";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",         icon: "home" },
  { id: "docs",         label: "Docs Hub",          icon: "docs" },
  { id: "pricing",      label: "Pricing",           icon: "pricing" },
  { id: "addons",       label: "Add-ons",           icon: "addons" },
  { id: "videos",       label: "Videos",            icon: "video" },
  { id: "resources",    label: "Resources",         icon: "resources" },
  { id: "features",     label: "Features",          icon: "features" },
];

const AI_ITEMS = [
  { id: "ai-playbook",       label: "AI Playbook",       icon: "brain" },
  { id: "call-intelligence", label: "Call Intelligence", icon: "mic" },
  { id: "knowledge-graph",   label: "Knowledge Graph",   icon: "network" },
];

const ADMIN_ITEMS = [
  { id: "intelligence", label: "Intelligence", icon: "zap" },
  { id: "admin",        label: "Admin Panel",  icon: "admin" },
];

function NavItem({ item, active, onClick }) {
  const isActive = active === item.id;
  return (
    <button onClick={() => onClick(item.id)}
      style={{
        display:"flex", alignItems:"center", gap:10, width:"100%",
        padding:"9px 12px", borderRadius:9, border:"none", cursor:"pointer",
        background: isActive ? "rgba(232,255,0,0.08)" : "none",
        color: isActive ? "var(--accent)" : "var(--text-muted)",
        fontSize:13, fontWeight: isActive ? 600 : 400,
        transition:"all 0.12s", textAlign:"left",
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background="var(--border)"; e.currentTarget.style.color="var(--text)"; }}}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background="none"; e.currentTarget.style.color="var(--text-muted)"; }}}
    >
      <Icon name={item.icon} size={15} color="currentColor" />
      {item.label}
      {isActive && <div style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:"var(--accent)" }} />}
    </button>
  );
}

function SectionLabel({ label }) {
  return (
    <div style={{ fontSize:10, fontWeight:700, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.1em", padding:"14px 12px 6px", marginTop:4 }}>
      {label}
    </div>
  );
}

export default function Sidebar({ active, onNav, onSearch, isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const [searchVal, setSearchVal] = useState("");

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchVal.trim()) onSearch(searchVal.trim());
  }

  return (
    <aside className={"sidebar" + (isOpen ? " open" : "")}
      style={{ width:220, minHeight:"100vh", background:"#0c0c0f", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", flexShrink:0 }}
    >
      {/* Logo row with close button on mobile */}
      <div style={{ padding:"20px 16px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="zap" size={14} color="#09090b" />
          </div>
          <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:"var(--text)" }}>DoubleTick</span>
        </div>
        {/* Close button — only visible on mobile via CSS */}
        <button onClick={onClose} className="sidebar-close-btn"
          style={{ width:28, height:28, borderRadius:7, background:"var(--border)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-muted)" }}>
          <Icon name="close" size={13} color="currentColor" />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding:"0 10px 12px" }}>
        <form onSubmit={handleSearchSubmit} style={{ position:"relative", display:"flex" }}>
          <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
            <Icon name="search" size={13} color="var(--text-dim)" />
          </div>
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search..."
            style={{ width:"100%", padding:"8px 10px 8px 30px", background:"var(--border)", border:"1px solid var(--border2)", borderRadius:8, color:"var(--text)", fontSize:12.5, outline:"none", boxSizing:"border-box" }}
          />
        </form>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:"auto", padding:"0 8px" }}>
        <SectionLabel label="Knowledge" />
        {NAV_ITEMS.map(item => <NavItem key={item.id} item={item} active={active} onClick={onNav} />)}

        <SectionLabel label="AI Layer" />
        {AI_ITEMS.map(item => <NavItem key={item.id} item={item} active={active} onClick={onNav} />)}

        {isAdmin && (
          <>
            <SectionLabel label="Admin" />
            {ADMIN_ITEMS.map(item => <NavItem key={item.id} item={item} active={active} onClick={onNav} />)}
          </>
        )}
      </nav>

      {/* User footer */}
      <div style={{ padding:"12px 10px 16px", borderTop:"1px solid var(--border)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:9 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(232,255,0,0.12)", border:"1px solid rgba(232,255,0,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:11, fontWeight:700, color:"var(--accent)" }}>{(user?.name?.[0] || "?").toUpperCase()}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name}</div>
            <div style={{ fontSize:11, color:"var(--text-dim)", textTransform:"capitalize" }}>{user?.role}</div>
          </div>
          <button onClick={logout} title="Sign out"
            style={{ background:"none", border:"none", color:"var(--text-dim)", cursor:"pointer", padding:4, display:"flex", alignItems:"center" }}
            onMouseEnter={e => e.currentTarget.style.color="#f87171"}
            onMouseLeave={e => e.currentTarget.style.color="var(--text-dim)"}
          >
            <Icon name="external" size={13} color="currentColor" />
          </button>
        </div>
      </div>
    </aside>
  );
}
