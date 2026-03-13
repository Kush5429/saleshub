import { useState } from "react";
import { Btn, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { ACCENT_COLORS } from "../data/defaultData";
import { trackView } from "../utils/engage";

function PlanCard({ plan, accent, adminMode, onRemove, onEdit }) {
  const featureList = Array.isArray(plan.features)
    ? plan.features
    : (plan.features ?? "").split(",").map(f => f.trim()).filter(Boolean);

  return (
    <div
      style={{
        background:"var(--surface)", border:"1px solid var(--border)",
        borderRadius:"var(--radius-xl)", padding:"28px 24px",
        position:"relative", overflow:"hidden",
        display:"flex", flexDirection:"column", transition:"all 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent+"60"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Top accent bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${accent}, ${accent}60)` }} />

      {/* Glow */}
      <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, background:accent, borderRadius:"50%", opacity:0.04, filter:"blur(40px)", pointerEvents:"none" }} />

      <div style={{ marginBottom:20 }}>
        <div style={{ color:accent, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:8 }}>Plan</div>
        <div style={{ color:"var(--text)", fontSize:22, fontWeight:800, fontFamily:"var(--font-display)", letterSpacing:"-0.03em", marginBottom:6 }}>{plan.name}</div>
        <div style={{ color:accent, fontSize:30, fontWeight:800, fontFamily:"var(--font-display)", letterSpacing:"-0.04em", lineHeight:1 }}>{plan.price}</div>
      </div>

      <div style={{ height:1, background:"var(--border)", marginBottom:20 }} />

      <div style={{ flex:1, marginBottom:20 }}>
        {featureList.map((f, i) => (
          <div key={i} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
            <div style={{ width:16, height:16, borderRadius:"50%", flexShrink:0, marginTop:2, background:accent+"15", border:`1px solid ${accent}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon name="check" size={9} color={accent} />
            </div>
            <span style={{ color:"var(--text-muted)", fontSize:13.5, lineHeight:1.55, letterSpacing:"-0.01em" }}>{f}</span>
          </div>
        ))}
      </div>

      {plan.icp && (
        <div style={{ background:"var(--surface2)", borderRadius:"var(--radius-sm)", padding:"12px 14px", marginBottom:12, borderLeft:`3px solid ${accent}50` }}>
          <div style={{ color:"var(--text-dim)", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Best for</div>
          <div style={{ color:"var(--text-muted)", fontSize:13, lineHeight:1.55 }}>{plan.icp}</div>
        </div>
      )}

      {plan.limits && <div style={{ color:"var(--text-dim)", fontSize:12, marginBottom:10 }}>{plan.limits}</div>}

      {adminMode && (
        <div style={{ marginTop:8, display:"flex", gap:8 }}>
          <Btn small onClick={onEdit}><Icon name="edit" size={11} /> Edit</Btn>
          <Btn variant="danger" small onClick={onRemove}><Icon name="trash" size={11} /> Remove</Btn>
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = { name:"", price:"", features:"", limits:"", icp:"" };

export default function PricingModule({ data: plans = [], loading, error, create, update, remove, adminMode }) {
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);

  const openAdd  = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (plan) => {
    setEditItem(plan);
    setForm({ name:plan.name||"", price:plan.price||"", features:Array.isArray(plan.features)?plan.features.join(", "):(plan.features||""), limits:plan.limits||"", icp:plan.icp||"" });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.price.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, features:form.features.split(",").map(f=>f.trim()).filter(Boolean) };
      editItem ? await update(editItem._id, payload) : await create(payload);
      setShowModal(false); setForm(EMPTY_FORM); setEditItem(null);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  // Track view on mount
  useState(() => { plans.forEach(p => trackView("pricing", p._id)); }, []);

  const dtPlans = plans.filter(p => !p.name.startsWith("QuickSell"));
  const qsPlans = plans.filter(p =>  p.name.startsWith("QuickSell"));

  return (
    <div className="animate-in">
      <SectionHeader title="Commercials & Pricing" subtitle="Plan tiers, pricing, and ideal customer profiles for DoubleTick and QuickSell."
        action={adminMode && <Btn onClick={openAdd}><Icon name="plus" size={13} /> Add Plan</Btn>} />

      {loading && <p style={{ color:"var(--text-muted)", fontSize:14 }}>Loading plans…</p>}
      {error   && <p style={{ color:"#f87171",          fontSize:14 }}>Error: {error}</p>}

      {dtPlans.length > 0 && (
        <>
          <SectionLabel dot="var(--accent)" label="DoubleTick Plans" />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:40 }}>
            {dtPlans.map((plan, i) => (
              <PlanCard key={plan._id} plan={plan} accent={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                adminMode={adminMode} onRemove={() => remove(plan._id)} onEdit={() => openEdit(plan)} />
            ))}
          </div>
        </>
      )}

      {qsPlans.length > 0 && (
        <>
          <SectionLabel dot="var(--accent-blue)" label="QuickSell Plans" />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:40 }}>
            {qsPlans.map((plan, i) => (
              <PlanCard key={plan._id} plan={plan} accent={ACCENT_COLORS[(i+3) % ACCENT_COLORS.length]}
                adminMode={adminMode} onRemove={() => remove(plan._id)} onEdit={() => openEdit(plan)} />
            ))}
          </div>
        </>
      )}

      {!loading && plans.length === 0 && <EmptyState icon="pricing" message="No pricing plans yet." />}

      {/* WhatsApp Conversation Costs */}
      <div style={{ padding:"20px 24px", background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:"var(--radius-lg)", borderLeft:"3px solid var(--accent-blue)" }}>
        <div style={{ color:"var(--text)", fontWeight:700, fontSize:15, marginBottom:16 }}>💬 WhatsApp Conversation Costs (INR)</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[{label:"Marketing",price:"₹0.87"},{label:"Utility",price:"₹0.13"},{label:"Service",price:"₹0.35"},{label:"Authentication",price:"₹0.35"}].map(c => (
            <div key={c.label} style={{ textAlign:"center", padding:"14px 10px", background:"var(--surface)", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)" }}>
              <div style={{ color:"var(--accent-blue)", fontWeight:700, fontSize:20, fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{c.price}</div>
              <div style={{ color:"var(--text-dim)", fontSize:11, marginTop:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={{ color:"var(--text-dim)", fontSize:12, marginTop:12 }}>Per conversation · Full international rates at{" "}
          <a href="https://doubletick.io/conversation-cost" target="_blank" rel="noopener noreferrer" style={{ color:"var(--accent-blue)" }}>doubletick.io/conversation-cost</a>
        </div>
      </div>

      {showModal && (
        <Modal title={editItem ? "Edit Pricing Plan" : "Add Pricing Plan"} onClose={() => setShowModal(false)}>
          <Field label="Plan Name"   value={form.name}     onChange={v => setForm(f=>({...f,name:v}))}     placeholder="e.g. Professional" />
          <Field label="Price"       value={form.price}    onChange={v => setForm(f=>({...f,price:v}))}    placeholder="e.g. ₹8,300/mo" />
          <Field label="Features (comma-separated)" value={form.features} onChange={v => setForm(f=>({...f,features:v}))} placeholder="Feature A, Feature B" as="textarea" />
          <Field label="Limits"      value={form.limits}   onChange={v => setForm(f=>({...f,limits:v}))}   placeholder="e.g. Up to 20 users" />
          <Field label="Best For"    value={form.icp}      onChange={v => setForm(f=>({...f,icp:v}))}      placeholder="Who is this plan for?" as="textarea" />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <Btn onClick={save}>{saving ? "Saving…" : editItem ? "Update Plan" : "Save Plan"}</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SectionLabel({ dot, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:dot }} />
      <span style={{ color:"var(--text-muted)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
      <div style={{ flex:1, height:1, background:"var(--border)" }} />
    </div>
  );
}
