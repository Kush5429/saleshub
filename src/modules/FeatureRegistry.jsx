import { useState, useEffect } from "react";
import { Btn, Badge, Card, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { ACCENT_COLORS } from "../data/defaultData";
import { trackFeatureView, trackFeatureDemo } from "../utils/api";

// Deterministic SVG illustration per feature — uses accent color
function FeatureIllustration({ name, accent }) {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const shapes = [
    // Chatbot / AI pattern
    <g key="a">
      <circle cx="32" cy="32" r="18" fill={accent} opacity="0.12" />
      <circle cx="32" cy="32" r="10" fill={accent} opacity="0.18" />
      <circle cx="32" cy="32" r="4"  fill={accent} opacity="0.6" />
      <circle cx="18" cy="20" r="3"  fill={accent} opacity="0.35" />
      <circle cx="46" cy="20" r="3"  fill={accent} opacity="0.35" />
      <circle cx="18" cy="44" r="3"  fill={accent} opacity="0.35" />
      <circle cx="46" cy="44" r="3"  fill={accent} opacity="0.35" />
      <line x1="18" y1="20" x2="32" y2="32" stroke={accent} strokeWidth="1" opacity="0.2" />
      <line x1="46" y1="20" x2="32" y2="32" stroke={accent} strokeWidth="1" opacity="0.2" />
      <line x1="18" y1="44" x2="32" y2="32" stroke={accent} strokeWidth="1" opacity="0.2" />
      <line x1="46" y1="44" x2="32" y2="32" stroke={accent} strokeWidth="1" opacity="0.2" />
    </g>,
    // Team inbox / flow pattern
    <g key="b">
      <rect x="10" y="10" width="22" height="14" rx="3" fill={accent} opacity="0.15" />
      <rect x="32" y="24" width="22" height="14" rx="3" fill={accent} opacity="0.22" />
      <rect x="10" y="38" width="22" height="14" rx="3" fill={accent} opacity="0.15" />
      <line x1="21" y1="24" x2="32" y2="28" stroke={accent} strokeWidth="1.5" opacity="0.3" />
      <line x1="21" y1="38" x2="32" y2="35" stroke={accent} strokeWidth="1.5" opacity="0.3" />
      <circle cx="43" cy="31" r="5" fill={accent} opacity="0.5" />
    </g>,
    // Catalogue / grid pattern
    <g key="c">
      {[0,1,2].map(row => [0,1,2].map(col => (
        <rect key={`${row}-${col}`} x={8 + col*18} y={8 + row*18} width="12" height="12" rx="2" fill={accent} opacity={0.1 + (row * 3 + col) * 0.04} />
      )))}
      <circle cx="48" cy="48" r="8" fill={accent} opacity="0.4" />
      <circle cx="48" cy="48" r="4" fill={accent} opacity="0.7" />
    </g>,
    // Broadcast / wave pattern
    <g key="d">
      <circle cx="20" cy="32" r="4"  fill={accent} opacity="0.7" />
      <path d="M26 22 Q38 32 26 42" fill="none" stroke={accent} strokeWidth="2" opacity="0.35" />
      <path d="M30 16 Q50 32 30 48" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.25" />
      <path d="M34 10 Q60 32 34 54" fill="none" stroke={accent} strokeWidth="1" opacity="0.15" />
    </g>,
  ];
  const shape = shapes[hash % shapes.length];
  return (
    <svg viewBox="0 0 64 64" style={{ width:"100%", height:"100%", display:"block" }}>
      <rect width="64" height="64" fill={accent} opacity="0.04" />
      {shape}
    </svg>
  );
}

const EMPTY_FORM = { featureName:"", releaseMonth:"", description:"", useCase:"", demoLink:"" };

export default function FeatureRegistry({ data: features = [], loading, error, create, update, remove, adminMode }) {
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);

  // Track all feature views on mount
  useEffect(() => {
    features.forEach(f => trackFeatureView(f._id, f.featureName).catch(() => {}));
  }, [features.length]); // eslint-disable-line

  const openAdd  = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (feat) => {
    setEditItem(feat);
    setForm({ featureName:feat.featureName||"", releaseMonth:feat.releaseMonth||"", description:feat.description||"", useCase:feat.useCase||"", demoLink:feat.demoLink||"" });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.featureName.trim()) return;
    setSaving(true);
    try {
      editItem ? await update(editItem._id, form) : await create(form);
      setShowModal(false); setForm(EMPTY_FORM); setEditItem(null);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-in">
      <SectionHeader title="Feature Release Registry" subtitle="Track new product features, release months, use cases, and demo resources."
        action={adminMode && <Btn onClick={openAdd}><Icon name="plus" size={13} /> Log Feature</Btn>} />

      {features.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <div style={{ height:1, flex:1, background:"var(--border)" }} />
          <span style={{ color:"var(--text-dim)", fontSize:13 }}>{features.length} feature{features.length !== 1 ? "s" : ""} logged</span>
          <div style={{ height:1, flex:1, background:"var(--border)" }} />
        </div>
      )}

      {loading && <p style={{ color:"var(--text-muted)", fontSize:14 }}>Loading features…</p>}
      {error   && <p style={{ color:"#ff4444",          fontSize:14 }}>Error: {error}</p>}

      {!loading && features.length === 0
        ? <EmptyState icon="features" message="No features logged yet. Add your first feature release." />
        : (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {features.map((feat, i) => {
              const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
              return (
                <div key={feat._id} style={{
                  background:"var(--surface)", border:"1px solid var(--border)",
                  borderRadius:"var(--radius-xl)", overflow:"hidden",
                  display:"flex", transition:"all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = accent+"50"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  {/* Left accent strip + illustration */}
                  <div style={{ width:100, flexShrink:0, background:accent+"08", borderRight:`1px solid ${accent}18`, display:"flex", alignItems:"center", justifyContent:"center", padding:16, position:"relative" }}>
                    <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:accent }} />
                    <div style={{ width:64, height:64 }}>
                      <FeatureIllustration name={feat.featureName} accent={accent} />
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex:1, padding:"22px 24px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5, flexWrap:"wrap" }}>
                          <span style={{ color:"var(--text)", fontWeight:800, fontSize:18, fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{feat.featureName}</span>
                          {i === 0 && <Badge text="LATEST" color="var(--accent)" />}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, color:"var(--text-dim)", fontSize:12.5 }}>
                          <Icon name="calendar" size={12} color="var(--text-dim)" />
                          <span>{feat.releaseMonth}</span>
                        </div>
                      </div>
                      {adminMode && (
                        <div style={{ display:"flex", gap:8, flexShrink:0, marginLeft:16 }}>
                          <Btn small onClick={() => openEdit(feat)}><Icon name="edit" size={11} /> Edit</Btn>
                          <Btn variant="danger" small onClick={() => remove(feat._id)}><Icon name="trash" size={11} /></Btn>
                        </div>
                      )}
                    </div>

                    <p style={{ color:"var(--text-muted)", fontSize:14, margin:"0 0 14px", lineHeight:1.7 }}>{feat.description}</p>

                    {feat.useCase && (
                      <div style={{ background:"var(--surface2)", borderRadius:"var(--radius-sm)", padding:"10px 14px", marginBottom:14, borderLeft:`3px solid ${accent}40` }}>
                        <span style={{ color:"var(--text-dim)", fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Use Case: </span>
                        <span style={{ color:"var(--text-muted)", fontSize:13.5 }}>{feat.useCase}</span>
                      </div>
                    )}

                    {feat.demoLink && (
                      <a href={feat.demoLink} target="_blank" rel="noopener noreferrer"
                        onClick={() => trackFeatureDemo(feat._id, feat.featureName).catch(() => {})}
                        style={{ display:"inline-flex", alignItems:"center", gap:7, color:accent, fontSize:13.5, textDecoration:"none", fontWeight:700, background:accent+"10", border:`1px solid ${accent}25`, borderRadius:99, padding:"5px 14px", transition:"all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = accent+"20"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = accent+"10"; }}
                      >
                        <Icon name="external" size={12} color={accent} /> View Demo
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {showModal && (
        <Modal title={editItem ? "Edit Feature" : "Log New Feature Release"} onClose={() => setShowModal(false)}>
          <Field label="Feature Name"         value={form.featureName}   onChange={v => setForm(f=>({...f,featureName:v}))}   placeholder="e.g. Smart Inbox Routing" />
          <Field label="Release Month"        value={form.releaseMonth}  onChange={v => setForm(f=>({...f,releaseMonth:v}))}  placeholder="e.g. March 2026" />
          <Field label="Description"          value={form.description}   onChange={v => setForm(f=>({...f,description:v}))}   placeholder="What does this feature do?" as="textarea" />
          <Field label="Target Use Case"      value={form.useCase}       onChange={v => setForm(f=>({...f,useCase:v}))}       placeholder="Who benefits from this and how?" as="textarea" />
          <Field label="Demo Link (optional)" value={form.demoLink}      onChange={v => setForm(f=>({...f,demoLink:v}))}      placeholder="https://…" type="url" />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <Btn onClick={save}>{saving ? "Saving…" : editItem ? "Update Feature" : "Log Feature"}</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
