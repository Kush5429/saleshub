import { StatCard, Badge, Card } from "../components/UI";
import Icon from "../components/Icon";

const STAT_CONFIG = [
  { key: "docs",      label: "Documents",       icon: "docs",      accent: "var(--accent)" },
  { key: "plans",     label: "Pricing Plans",   icon: "pricing",   accent: "var(--accent-blue)" },
  { key: "addons",    label: "Add-ons",         icon: "addons",    accent: "var(--accent-orange)" },
  { key: "videos",    label: "Videos",          icon: "video",     accent: "var(--accent-purple)" },
  { key: "resources", label: "Resources",       icon: "resources", accent: "var(--accent-green)" },
  { key: "features",  label: "Feature Releases",icon: "features",  accent: "var(--accent-pink)" },
];

const TAG_ACCENTS = ["var(--accent)", "var(--accent-blue)", "var(--accent-purple)", "var(--accent-orange)"];
const FEAT_ACCENTS = ["var(--accent)", "var(--accent-blue)", "var(--accent-purple)"];

export default function Dashboard({ data, onNav }) {
  const recentFeatures = [...data.features].reverse().slice(0, 3);

  return (
    <div className="animate-in">
      {/* Hero Banner */}
      <div style={{
        marginBottom: 36,
        padding: "40px 44px",
        background: "linear-gradient(135deg, var(--surface) 0%, #151500 60%, var(--surface) 100%)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        position: "relative", overflow: "hidden",
      }}>
        {/* glow orbs */}
        <div style={{ position:"absolute", top:-60, right:-40, width:240, height:240, background:"var(--accent)", borderRadius:"50%", opacity:0.05, filter:"blur(80px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-30, left:80, width:160, height:160, background:"var(--accent-blue)", borderRadius:"50%", opacity:0.06, filter:"blur(60px)", pointerEvents:"none" }} />

        <div style={{ position: "relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--accent)18", border:"1px solid var(--accent)30", borderRadius:20, padding:"3px 13px", marginBottom:18 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", animation:"pulse 2s infinite" }} />
            <span style={{ color:"var(--accent)", fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Live Platform</span>
          </div>

          <h1 style={{ color:"var(--text)", fontSize:40, fontWeight:900, fontFamily:"var(--font-display)", margin:"0 0 12px", lineHeight:1.05 }}>
            DoubleTick<br /><span style={{ color:"var(--accent)" }}>Sales Hub</span>
          </h1>

          <p style={{ color:"var(--text-muted)", fontSize:15, margin:"0 0 24px", maxWidth:520, lineHeight:1.65 }}>
            Your internal playbook for selling DoubleTick and QuickSell — pricing, plans, add-ons, live demo chatbots, training resources, and onboarding guides. Everything a rep needs.
          </p>

          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["WhatsApp Business API", "Rate Card", "Chatbot Builder", "QuickSell"].map((tag, i) => (
              <Badge key={tag} text={tag} color={TAG_ACCENTS[i]} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:32 }}>
        {STAT_CONFIG.map(s => (
          <div key={s.key} onClick={() => onNav(s.key === "docs" ? "docs" : s.key === "plans" ? "pricing" : s.key)} style={{ cursor:"pointer" }}>
            <StatCard label={s.label} value={data[s.key].length} icon={s.icon} accent={s.accent} />
          </div>
        ))}
      </div>

      {/* Quick Links Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:32 }}>
        {/* Recent Features */}
        <div>
          <h3 style={{ color:"var(--text)", fontSize:17, fontWeight:700, fontFamily:"var(--font-display)", marginBottom:14 }}>
            Latest Releases
          </h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {recentFeatures.length === 0 && (
              <p style={{ color:"var(--text-dim)", fontSize:13 }}>No features logged yet.</p>
            )}
            {recentFeatures.map((f, i) => (
              <Card key={f.id} style={{ padding:"14px 18px", borderLeft:`3px solid ${FEAT_ACCENTS[i]}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <span style={{ color:"var(--text)", fontWeight:700, fontSize:14 }}>{f.name}</span>
                  {i === 0 && <Badge text="NEW" color="var(--accent)" />}
                </div>
                <span style={{ color:"var(--text-dim)", fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em" }}>{f.month}</span>
                <p style={{ color:"var(--text-muted)", fontSize:12, marginTop:6, lineHeight:1.5 }}>
                  {f.description.length > 90 ? f.description.slice(0, 90) + "…" : f.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Nav */}
        <div>
          <h3 style={{ color:"var(--text)", fontSize:17, fontWeight:700, fontFamily:"var(--font-display)", marginBottom:14 }}>
            Quick Access
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"Docs Hub",    icon:"docs",      nav:"docs",      accent:"var(--accent)" },
              { label:"Pricing",     icon:"pricing",   nav:"pricing",   accent:"var(--accent-blue)" },
              { label:"Videos",      icon:"video",     nav:"videos",    accent:"var(--accent-purple)" },
              { label:"Resources",   icon:"resources", nav:"resources", accent:"var(--accent-green)" },
            ].map(item => (
              <button
                key={item.nav}
                onClick={() => onNav(item.nav)}
                style={{
                  background:"var(--surface)", border:`1px solid var(--border)`,
                  borderRadius:"var(--radius-md)", padding:"16px 14px",
                  display:"flex", flexDirection:"column", alignItems:"flex-start", gap:8,
                  cursor:"pointer", transition:"border-color 0.15s",
                  textAlign:"left",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = item.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <Icon name={item.icon} size={18} color={item.accent} />
                <span style={{ color:"var(--text)", fontWeight:600, fontSize:13, fontFamily:"var(--font-display)" }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
