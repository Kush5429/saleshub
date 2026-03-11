import { Card, StatCard } from "../components/UI";
import Icon from "../components/Icon";
import { ACCENT_COLORS } from "../data/defaultData";

const MODULE_GUIDE = [
  { nav:"docs",      label:"Documentation Hub",   icon:"docs",      desc:"Upload platform PDFs, feature guides, and technical documents.", accent:"var(--accent)" },
  { nav:"pricing",   label:"Pricing Plans",        icon:"pricing",   desc:"Add or remove pricing tiers and define ideal customer profiles.", accent:"var(--accent-blue)" },
  { nav:"addons",    label:"Add-on Features",      icon:"addons",    desc:"Manage purchasable extensions and their compatible plans.", accent:"var(--accent-orange)" },
  { nav:"videos",    label:"Video Library",        icon:"video",     desc:"Add YouTube embed links for demos, walkthroughs, and feature videos.", accent:"var(--accent-purple)" },
  { nav:"resources", label:"Learning Resources",   icon:"resources", desc:"Add links to sales playbooks, training courses, and documentation.", accent:"var(--accent-green)" },
  { nav:"features",  label:"Feature Registry",     icon:"features",  desc:"Log new product features with release months and use cases.", accent:"var(--accent-pink)" },
];

const STAT_CONFIG = [
  { key:"docs",      label:"Documents",        icon:"docs",      accent:"var(--accent)" },
  { key:"plans",     label:"Pricing Plans",    icon:"pricing",   accent:"var(--accent-blue)" },
  { key:"addons",    label:"Add-ons",          icon:"addons",    accent:"var(--accent-orange)" },
  { key:"videos",    label:"Videos",           icon:"video",     accent:"var(--accent-purple)" },
  { key:"resources", label:"Resources",        icon:"resources", accent:"var(--accent-green)" },
  { key:"features",  label:"Feature Releases", icon:"features",  accent:"var(--accent-pink)" },
];

export default function AdminPanel({ data, adminMode, onToggleAdmin, onNav }) {
  const total = Object.values(data).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="animate-in">
      <div style={{ marginBottom:28 }}>
        <h2 style={{ color:"var(--text)", fontSize:26, fontWeight:800, fontFamily:"var(--font-display)", margin:"0 0 6px" }}>
          Admin Control Panel
        </h2>
        <p style={{ color:"var(--text-muted)", fontSize:13 }}>
          Manage all platform content. Enable Admin Mode to add, edit, or delete entries across all modules.
        </p>
      </div>

      {/* Admin Mode Toggle Banner */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: adminMode ? "var(--accent)0d" : "var(--surface2)",
        border:`1px solid ${adminMode ? "var(--accent)44" : "var(--border2)"}`,
        borderRadius:"var(--radius-lg)", padding:"18px 24px", marginBottom:28,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:42, height:42, borderRadius:10,
            background: adminMode ? "var(--accent)22" : "var(--surface)",
            border:`1px solid ${adminMode ? "var(--accent)55" : "var(--border2)"}`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <Icon name={adminMode ? "unlock" : "lock"} size={18} color={adminMode ? "var(--accent)" : "var(--text-dim)"} />
          </div>
          <div>
            <div style={{ color:"var(--text)", fontWeight:700, fontSize:15, fontFamily:"var(--font-display)" }}>
              Admin Mode is {adminMode ? "ENABLED" : "DISABLED"}
            </div>
            <div style={{ color:"var(--text-muted)", fontSize:12, marginTop:2 }}>
              {adminMode
                ? "You can now add, edit, and delete entries across all modules."
                : "Enable admin mode to manage content across the platform."}
            </div>
          </div>
        </div>
        <button
          onClick={onToggleAdmin}
          style={{
            background: adminMode ? "var(--accent)" : "transparent",
            border:`1px solid ${adminMode ? "var(--accent)" : "var(--border2)"}`,
            color: adminMode ? "#000" : "var(--text-muted)",
            padding:"9px 20px", borderRadius:"var(--radius-sm)",
            fontWeight:700, fontSize:13, cursor:"pointer",
            fontFamily:"var(--font-display)",
          }}
        >
          {adminMode ? "Disable Admin" : "Enable Admin"}
        </button>
      </div>

      {/* Stats Overview */}
      <h3 style={{ color:"var(--text)", fontSize:16, fontWeight:700, fontFamily:"var(--font-display)", marginBottom:14 }}>
        Content Overview — {total} total entries
      </h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:32 }}>
        {STAT_CONFIG.map(s => (
          <StatCard key={s.key} label={s.label} value={data[s.key].length} icon={s.icon} accent={s.accent} />
        ))}
      </div>

      {/* Module Quick Access */}
      <h3 style={{ color:"var(--text)", fontSize:16, fontWeight:700, fontFamily:"var(--font-display)", marginBottom:14 }}>
        Manage Modules
      </h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {MODULE_GUIDE.map(mod => (
          <Card
            key={mod.nav}
            style={{ cursor:"pointer", transition:"border-color 0.15s" }}
            className=""
          >
            <button
              onClick={() => onNav(mod.nav)}
              style={{ background:"none", border:"none", padding:0, width:"100%", textAlign:"left", cursor:"pointer" }}
            >
              <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  background:mod.accent + "18", border:`1px solid ${mod.accent}33`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <Icon name={mod.icon} size={16} color={mod.accent} />
                </div>
                <div>
                  <div style={{ color:"var(--text)", fontWeight:700, fontSize:14, fontFamily:"var(--font-display)", marginBottom:4 }}>
                    {mod.label}
                  </div>
                  <div style={{ color:"var(--text-muted)", fontSize:12, lineHeight:1.5 }}>{mod.desc}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:8, color:mod.accent, fontSize:12, fontWeight:600 }}>
                    <span>Go to module</span>
                    <Icon name="external" size={11} color={mod.accent} />
                  </div>
                </div>
              </div>
            </button>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card style={{ marginTop:24, background:"var(--surface2)" }}>
        <h4 style={{ color:"var(--text)", fontWeight:700, fontSize:14, fontFamily:"var(--font-display)", marginBottom:12 }}>
          How to update the platform
        </h4>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            '1. Click "Enable Admin" above or use the sidebar toggle.',
            '2. Navigate to the module you want to update (Docs, Pricing, Videos, etc.).',
            '3. Click the "Add" button that appears in the top-right of each module.',
            '4. Fill in the form and save — changes appear instantly without any code changes.',
            '5. To remove an entry, hover over it in admin mode and click the red trash icon.',
          ].map(step => (
            <div key={step} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <Icon name="check" size={13} color="var(--accent)" style={{ marginTop:2, flexShrink:0 }} />
              <span style={{ color:"var(--text-muted)", fontSize:13 }}>{step}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
