import { useState } from "react";
import { Btn, Badge, Card, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { genId } from "../utils/storage";
import { ACCENT_COLORS } from "../data/defaultData";

export default function FeatureRegistry({ features, setFeatures, adminMode }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:"", month:"", description:"", useCase:"", demo:"" });

  const save = () => {
    if (!form.name.trim()) return;
    setFeatures(prev => [...prev, { ...form, id:genId() }]);
    setShowModal(false);
    setForm({ name:"", month:"", description:"", useCase:"", demo:"" });
  };

  const sorted = [...features].reverse();

  return (
    <div className="animate-in">
      <SectionHeader
        title="Feature Release Registry"
        subtitle="Track new product features, release months, use cases, and demo resources."
        action={adminMode && (
          <Btn onClick={() => setShowModal(true)}><Icon name="plus" size={13} /> Log Feature</Btn>
        )}
      />

      {/* Timeline count badge */}
      {features.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
          <div style={{ height:1, flex:1, background:"var(--border)" }} />
          <span style={{ color:"var(--text-dim)", fontSize:12, whiteSpace:"nowrap" }}>
            {features.length} feature{features.length !== 1 ? "s" : ""} logged
          </span>
          <div style={{ height:1, flex:1, background:"var(--border)" }} />
        </div>
      )}

      {sorted.length === 0
        ? <EmptyState icon="features" message="No features logged yet. Add your first feature release." />
        : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {sorted.map((feat, i) => {
              const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
              return (
                <Card key={feat.id} style={{ position:"relative", overflow:"hidden", paddingLeft:28 }}>
                  {/* Left accent bar */}
                  <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:accent }} />

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ color:"var(--text)", fontWeight:800, fontSize:16, fontFamily:"var(--font-display)" }}>
                          {feat.name}
                        </span>
                        {i === 0 && <Badge text="LATEST" color="var(--accent)" />}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, color:"var(--text-dim)", fontSize:12 }}>
                        <Icon name="calendar" size={12} color="var(--text-dim)" />
                        <span>{feat.month}</span>
                      </div>
                    </div>
                    {adminMode && (
                      <Btn variant="danger" small onClick={() => setFeatures(prev => prev.filter(f => f.id !== feat.id))}>
                        <Icon name="trash" size={12} />
                      </Btn>
                    )}
                  </div>

                  <p style={{ color:"var(--text-muted)", fontSize:13, margin:"0 0 12px", lineHeight:1.65 }}>
                    {feat.description}
                  </p>

                  {feat.useCase && (
                    <div style={{ background:"var(--surface2)", borderRadius:"var(--radius-sm)", padding:"9px 13px", marginBottom:10 }}>
                      <span style={{ color:"var(--text-dim)", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                        Use Case:{" "}
                      </span>
                      <span style={{ color:"var(--text-muted)", fontSize:13 }}>{feat.useCase}</span>
                    </div>
                  )}

                  {feat.demo && (
                    <a href={feat.demo} target="_blank" rel="noopener noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:6, color:accent, fontSize:13, textDecoration:"none", fontWeight:600 }}>
                      <Icon name="external" size={12} color={accent} /> View Demo
                    </a>
                  )}
                </Card>
              );
            })}
          </div>
        )
      }

      {showModal && (
        <Modal title="Log New Feature Release" onClose={() => setShowModal(false)}>
          <Field label="Feature Name" value={form.name} onChange={v => setForm(f=>({...f,name:v}))} placeholder="e.g. Smart Inbox Routing" />
          <Field label="Release Month" value={form.month} onChange={v => setForm(f=>({...f,month:v}))} placeholder="e.g. March 2026" />
          <Field label="Description" value={form.description} onChange={v => setForm(f=>({...f,description:v}))} placeholder="What does this feature do?" as="textarea" />
          <Field label="Target Use Case" value={form.useCase} onChange={v => setForm(f=>({...f,useCase:v}))} placeholder="Who benefits from this and how?" as="textarea" />
          <Field label="Demo Link (optional)" value={form.demo} onChange={v => setForm(f=>({...f,demo:v}))} placeholder="https://…" type="url" />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <Btn onClick={save}>Log Feature</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
