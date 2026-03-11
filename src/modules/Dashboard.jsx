import { StatCard, Badge, Card } from "../components/UI";
import Icon from "../components/Icon";

const STAT_CONFIG = [
  { key:"docs",      label:"Documents",      icon:"docs",      accent:"var(--accent)" },
  { key:"plans",     label:"Pricing Plans",  icon:"pricing",   accent:"var(--accent-blue)" },
  { key:"addons",    label:"Add-ons",        icon:"addons",    accent:"var(--accent-orange)" },
  { key:"videos",    label:"Videos",         icon:"video",     accent:"var(--accent-purple)" },
  { key:"resources", label:"Resources",      icon:"resources", accent:"var(--accent-green)" },
  { key:"features",  label:"Features",       icon:"features",  accent:"var(--accent-pink)" },
];

const QUICK_NAV = [
  { id:"pricing",   label:"Rate Card",      icon:"pricing",   accent:"var(--accent-blue)",   desc:"Plans & add-ons" },
  { id:"docs",      label:"Docs Hub",       icon:"docs",      accent:"var(--accent)",        desc:"PDFs & guides" },
  { id:"resources", label:"Resources",      icon:"resources", accent:"var(--accent-green)",  desc:"Links & training" },
  { id:"features",  label:"Features",       icon:"features",  accent:"var(--accent-pink)",   desc:"Product releases" },
  { id:"videos",    label:"Video Library",  icon:"video",     accent:"var(--accent-purple)", desc:"Demos & walkthroughs" },
  { id:"admin",     label:"Admin Panel",    icon:"admin",     accent:"var(--accent-orange)", desc:"Manage content" },
];

export default function Dashboard({ data, onNav }) {
  const recentFeatures = [...data.features].slice(0, 3);

  return (
    <div className="animate-in">

      {/* Hero */}
      <div style={{
        marginBottom: 32,
        padding: "30px 36px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Accent glow */}
        <div style={{
          position: "absolute", top: -80, right: -60, width: 300, height: 300,
          background: "var(--accent)", borderRadius: "50%",
          opacity: 0.04, filter: "blur(80px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: 100, width: 200, height: 200,
          background: "var(--accent-blue)", borderRadius: "50%",
          opacity: 0.05, filter: "blur(60px)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          {/* Status pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent)10", border: "1px solid var(--accent)25",
            borderRadius: 99, padding: "3px 12px 3px 8px", marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s infinite" }} />
            <span style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Meta Business Partner
            </span>
          </div>

          <h1 style={{
            color: "var(--text)", fontSize: 36, fontWeight: 700,
            fontFamily: "var(--font-display)", margin: "0 0 10px",
            lineHeight: 1.05, letterSpacing: "-0.04em",
          }}>
            DoubleTick<br />
            <span style={{ color: "var(--accent)" }}>Sales Hub</span>
          </h1>

          <p style={{
            color: "var(--text-muted)", fontSize: 14.5, margin: "0 0 24px",
            maxWidth: 480, lineHeight: 1.65, letterSpacing: "-0.01em",
          }}>
            Your internal playbook for selling DoubleTick and QuickSell —
            pricing, plans, resources, and onboarding guides.
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["WhatsApp Business API", "ISO 27001 Certified", "GDPR Compliant", "Meta Partner 2025"].map((tag, i) => {
              const colors = ["var(--accent)", "var(--accent-blue)", "var(--accent-green)", "var(--accent-purple)"];
              return <Badge key={tag} text={tag} color={colors[i]} />;
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }}>
        {STAT_CONFIG.map(s => (
          <div key={s.key} onClick={() => onNav(s.key === "docs" ? "docs" : s.key === "plans" ? "pricing" : s.key)} style={{ cursor: "pointer" }}>
            <StatCard label={s.label} value={data[s.key].length} icon={s.icon} accent={s.accent} />
          </div>
        ))}
      </div>

      {/* Quick Nav */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{
          color: "var(--text-muted)", fontSize: 10.5, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
        }}>Quick Access</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {QUICK_NAV.map(item => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "14px 16px",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 12,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.background = "var(--surface2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: "var(--radius-sm)", flexShrink: 0,
                background: item.accent + "12", border: `1px solid ${item.accent}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={item.icon} size={14} color={item.accent} />
              </div>
              <div>
                <div style={{ color: "var(--text)", fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.01em" }}>{item.label}</div>
                <div style={{ color: "var(--text-dim)", fontSize: 11.5, marginTop: 1 }}>{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Features */}
      {recentFeatures.length > 0 && (
        <div>
          <h3 style={{
            color: "var(--text-muted)", fontSize: 10.5, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>Latest Features & Highlights</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentFeatures.map((feat, i) => {
              const accents = ["var(--accent)", "var(--accent-blue)", "var(--accent-purple)"];
              const accent  = accents[i % accents.length];
              return (
                <Card key={feat.id} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 18px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent, borderRadius: "3px 0 0 3px" }} />
                  <div style={{ flex: 1, paddingLeft: 4 }}>
                    <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 13.5, marginBottom: 3, letterSpacing: "-0.01em" }}>{feat.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.5 }}>{feat.description?.slice(0, 100)}{feat.description?.length > 100 ? "…" : ""}</div>
                  </div>
                  <Badge text={feat.month || feat.releaseMonth} color={accent} />
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
