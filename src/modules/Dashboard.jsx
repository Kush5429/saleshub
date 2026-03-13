import { StatCard, Badge, Card } from "../components/UI";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";

const STAT_CONFIG = [
  { key:"docs",      label:"Documents",     icon:"docs",      accent:"var(--accent)",        nav:"docs" },
  { key:"plans",     label:"Pricing Plans", icon:"pricing",   accent:"var(--accent-blue)",   nav:"pricing" },
  { key:"addons",    label:"Add-ons",       icon:"addons",    accent:"var(--accent-orange)", nav:"addons" },
  { key:"videos",    label:"Videos",        icon:"video",     accent:"var(--accent-purple)", nav:"videos" },
  { key:"resources", label:"Resources",     icon:"resources", accent:"var(--accent-green)",  nav:"resources" },
  { key:"features",  label:"Features",      icon:"features",  accent:"var(--accent-pink)",   nav:"features" },
];

const QUICK_NAV = [
  { id:"pricing",   label:"Rate Card",     icon:"pricing",   accent:"var(--accent-blue)",   desc:"Plans & add-ons" },
  { id:"docs",      label:"Docs Hub",      icon:"docs",      accent:"var(--accent)",        desc:"PDFs & guides" },
  { id:"resources", label:"Resources",     icon:"resources", accent:"var(--accent-green)",  desc:"Links & training" },
  { id:"features",  label:"Features",      icon:"features",  accent:"var(--accent-pink)",   desc:"Product releases" },
  { id:"videos",    label:"Video Library", icon:"video",     accent:"var(--accent-purple)", desc:"Demos & walkthroughs" },
  { id:"admin",     label:"Admin Panel",   icon:"admin",     accent:"var(--accent-orange)", desc:"Manage content" },
];

export default function Dashboard({ data, onNav }) {
  const { user, isAdmin } = useAuth();
  const recentFeatures = [...data.features].slice(0, 3);
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="animate-in">

      {/* Hero */}
      <div style={{
        marginBottom: 40,
        padding: "44px 48px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-100, right:-80, width:400, height:400, background:"var(--accent)", borderRadius:"50%", opacity:0.04, filter:"blur(90px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-60, left:80, width:280, height:280, background:"var(--accent-blue)", borderRadius:"50%", opacity:0.05, filter:"blur(70px)", pointerEvents:"none" }} />

        <div style={{ position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--accent)10", border:"1px solid var(--accent)25", borderRadius:99, padding:"4px 14px 4px 10px", marginBottom:24 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent)", animation:"pulse 2s infinite" }} />
            <span style={{ color:"var(--accent)", fontSize:12, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>Meta Business Partner</span>
          </div>

          <h1 style={{ color:"var(--text)", fontSize:48, fontWeight:700, fontFamily:"var(--font-display)", margin:"0 0 6px", lineHeight:1.0, letterSpacing:"-0.04em" }}>
            Hey {firstName} 👋
          </h1>
          <h2 style={{ color:"var(--accent)", fontSize:32, fontWeight:700, fontFamily:"var(--font-display)", margin:"0 0 16px", lineHeight:1.05, letterSpacing:"-0.04em" }}>
            DoubleTick Sales Hub
          </h2>

          <p style={{ color:"var(--text-muted)", fontSize:16, margin:"0 0 28px", maxWidth:560, lineHeight:1.7, letterSpacing:"-0.01em" }}>
            Your internal playbook for selling DoubleTick and QuickSell —
            pricing, plans, resources, and onboarding guides. Everything you need, in one place.
          </p>

          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {["WhatsApp Business API","ISO 27001 Certified","GDPR Compliant","Meta Partner 2025"].map((tag, i) => {
              const colors = ["var(--accent)","var(--accent-blue)","var(--accent-green)","var(--accent-purple)"];
              return <Badge key={tag} text={tag} color={colors[i]} />;
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <h3 style={{ color:"var(--text-muted)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Platform Overview</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:40 }}>
        {STAT_CONFIG.map(s => (
          <div key={s.key} onClick={() => onNav(s.nav)} style={{ cursor:"pointer" }}>
            <StatCard label={s.label} value={data[s.key].length} icon={s.icon} accent={s.accent} />
          </div>
        ))}
      </div>

      {/* Quick Nav */}
      <div style={{ marginBottom: 40 }}>
        <h3 style={{ color:"var(--text-muted)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Quick Access</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {QUICK_NAV.map(item => {
            if (item.id === "admin" && !isAdmin) return null;
            return (
              <button key={item.id} onClick={() => onNav(item.id)} style={{
                background:"var(--surface)", border:"1px solid var(--border)",
                borderRadius:"var(--radius-md)", padding:"18px 20px",
                cursor:"pointer", textAlign:"left", transition:"all 0.15s",
                display:"flex", alignItems:"center", gap:14,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.background="var(--surface2)"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)";  e.currentTarget.style.background="var(--surface)";  e.currentTarget.style.transform="translateY(0)"; }}
              >
                <div style={{ width:40, height:40, borderRadius:"var(--radius-sm)", flexShrink:0, background:item.accent+"12", border:`1px solid ${item.accent}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon name={item.icon} size={17} color={item.accent} />
                </div>
                <div>
                  <div style={{ color:"var(--text)", fontSize:15, fontWeight:600, letterSpacing:"-0.01em" }}>{item.label}</div>
                  <div style={{ color:"var(--text-dim)", fontSize:12.5, marginTop:2 }}>{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Features */}
      {recentFeatures.length > 0 && (
        <div>
          <h3 style={{ color:"var(--text-muted)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Latest Features & Highlights</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {recentFeatures.map((feat, i) => {
              const accents = ["var(--accent)","var(--accent-blue)","var(--accent-purple)"];
              const accent = accents[i % accents.length];
              return (
                <Card key={feat._id} style={{ display:"flex", gap:16, alignItems:"flex-start", padding:"18px 22px", position:"relative", overflow:"hidden", cursor:"pointer" }}
                  onClick={() => onNav("features")}
                >
                  <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:accent, borderRadius:"3px 0 0 3px" }} />
                  <div style={{ flex:1, paddingLeft:6 }}>
                    <div style={{ color:"var(--text)", fontWeight:700, fontSize:15, marginBottom:5, letterSpacing:"-0.01em" }}>{feat.featureName}</div>
                    <div style={{ color:"var(--text-muted)", fontSize:13.5, lineHeight:1.6 }}>{feat.description?.slice(0,120)}{feat.description?.length > 120 ? "…" : ""}</div>
                  </div>
                  <Badge text={feat.releaseMonth} color={accent} />
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
