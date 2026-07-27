import { useState } from "react";
import { Btn, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { ACCENT_COLORS } from "../data/defaultData";
import { trackView } from "../utils/engage";

/* Split "₹8,300/mo" -> { amount:"₹8,300", period:"/mo" }; "₹80,000 one-time" -> whole as amount */
function splitPrice(price = "") {
  const i = price.indexOf("/");
  if (i === -1) return { amount: price, period: "" };
  return { amount: price.slice(0, i).trim(), period: price.slice(i) };
}

function PlanCard({ plan, accent, featured = false, adminMode, onRemove, onEdit }) {
  const featureList = Array.isArray(plan.features)
    ? plan.features
    : (plan.features ?? "").split(",").map(f => f.trim()).filter(Boolean);
  const { amount, period } = splitPrice(plan.price);

  return (
    <div
      style={{
        background: featured
          ? `linear-gradient(180deg, ${accent}0d, var(--surface) 55%)`
          : "var(--surface)",
        border: featured ? `1px solid ${accent}55` : "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "26px 24px",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        transition: "all 0.2s",
        boxShadow: featured ? `0 0 0 1px ${accent}22, var(--shadow)` : "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent + "66"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${accent}14`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = featured ? accent + "55" : "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = featured ? `0 0 0 1px ${accent}22, var(--shadow)` : "none"; }}
    >
      {/* Top accent bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${accent}, ${accent}55)` }} />

      {/* Glow */}
      <div style={{ position:"absolute", top:-50, right:-40, width:150, height:150, background:accent, borderRadius:"50%", opacity:featured?0.09:0.05, filter:"blur(44px)", pointerEvents:"none" }} />

      {/* Popular pill */}
      {featured && (
        <div style={{ position:"absolute", top:16, right:16, background:accent, color:"#0a0a0c", fontSize:9.5, fontWeight:800, letterSpacing:"0.08em", padding:"4px 9px", borderRadius:99, textTransform:"uppercase" }}>
          Most Popular
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom:18 }}>
        <div style={{ color:accent, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:9 }}>Plan</div>
        <div style={{ color:"var(--text)", fontSize:22, fontWeight:800, fontFamily:"var(--font-display)", letterSpacing:"-0.03em", marginBottom:10 }}>{plan.name}</div>
        <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
          <span style={{ color:accent, fontSize:32, fontWeight:800, fontFamily:"var(--font-display)", letterSpacing:"-0.04em", lineHeight:1 }}>{amount}</span>
          {period && <span style={{ color:"var(--text-muted)", fontSize:14, fontWeight:600 }}>{period}</span>}
        </div>
      </div>

      <div style={{ height:1, background:"var(--border)", marginBottom:18 }} />

      {/* Features */}
      <div style={{ flex:1, marginBottom:18 }}>
        {featureList.map((f, i) => (
          <div key={i} style={{ display:"flex", gap:10, marginBottom:11, alignItems:"flex-start" }}>
            <div style={{ width:17, height:17, borderRadius:"50%", flexShrink:0, marginTop:1, background:accent+"1a", border:`1px solid ${accent}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon name="check" size={9} color={accent} />
            </div>
            <span style={{ color:"var(--text-muted)", fontSize:13.5, lineHeight:1.55, letterSpacing:"-0.01em" }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Best for */}
      {plan.icp && (
        <div style={{ background:"var(--surface2)", borderRadius:"var(--radius-sm)", padding:"12px 14px", marginBottom:12, borderLeft:`3px solid ${accent}55` }}>
          <div style={{ color:"var(--text-dim)", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Best for</div>
          <div style={{ color:"var(--text-muted)", fontSize:13, lineHeight:1.55 }}>{plan.icp}</div>
        </div>
      )}

      {/* Limits chip */}
      {plan.limits && (
        <div style={{ display:"inline-flex", alignItems:"center", gap:7, alignSelf:"flex-start", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:99, padding:"5px 12px", marginBottom:adminMode?12:0 }}>
          <Icon name="tag" size={11} color="var(--text-dim)" />
          <span style={{ color:"var(--text-muted)", fontSize:11.5, letterSpacing:"-0.01em" }}>{plan.limits}</span>
        </div>
      )}

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
          <SectionLabel dot="var(--accent)" label="DoubleTick Plans" count={dtPlans.length} />
          <div className="grid-cols-3" style={{ marginBottom:40, alignItems:"stretch" }}>
            {dtPlans.map((plan, i) => (
              <PlanCard key={plan._id} plan={plan} accent={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                featured={plan.name === "Pro"}
                adminMode={adminMode} onRemove={() => remove(plan._id)} onEdit={() => openEdit(plan)} />
            ))}
          </div>
        </>
      )}

      {qsPlans.length > 0 && (
        <>
          <SectionLabel dot="var(--accent-blue)" label="QuickSell Plans" count={qsPlans.length} />
          <div className="grid-cols-3" style={{ marginBottom:40, alignItems:"stretch" }}>
            {qsPlans.map((plan, i) => (
              <PlanCard key={plan._id} plan={plan} accent={ACCENT_COLORS[(i+3) % ACCENT_COLORS.length]}
                featured={plan.name === "QuickSell Platinum"}
                adminMode={adminMode} onRemove={() => remove(plan._id)} onEdit={() => openEdit(plan)} />
            ))}
          </div>
        </>
      )}

      {!loading && plans.length === 0 && <EmptyState icon="pricing" message="No pricing plans yet." />}

      {/* WhatsApp Conversation Costs */}
      <div style={{ padding:"22px 24px", background:"linear-gradient(180deg, var(--surface2), var(--surface))", border:"1px solid var(--border2)", borderRadius:"var(--radius-lg)", borderLeft:"3px solid var(--accent-blue)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:16 }}>
          <span style={{ fontSize:17 }}>💬</span>
          <div style={{ color:"var(--text)", fontWeight:700, fontSize:15 }}>WhatsApp Conversation Costs <span style={{ color:"var(--text-dim)", fontWeight:500, fontSize:12 }}>(INR · per conversation)</span></div>
        </div>
        <div className="grid-cols-4">
          {[{label:"Marketing",price:"₹0.87",c:"var(--accent-pink)"},{label:"Utility",price:"₹0.13",c:"var(--accent-green)"},{label:"Service",price:"₹0.35",c:"var(--accent-blue)"},{label:"Authentication",price:"₹0.35",c:"var(--accent-orange)"}].map(cc => (
            <div key={cc.label} style={{ textAlign:"center", padding:"16px 10px", background:"var(--surface)", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:cc.c, opacity:0.7 }} />
              <div style={{ color:cc.c, fontWeight:800, fontSize:22, fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{cc.price}</div>
              <div style={{ color:"var(--text-dim)", fontSize:10.5, marginTop:5, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600 }}>{cc.label}</div>
            </div>
          ))}
        </div>
        <div style={{ color:"var(--text-dim)", fontSize:12, marginTop:14 }}>Full international rates at{" "}
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

function SectionLabel({ dot, label, count }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:dot }} />
      <span style={{ color:"var(--text-muted)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
      {count != null && <span style={{ color:"var(--text-dim)", fontSize:11, fontWeight:600 }}>{count}</span>}
      <div style={{ flex:1, height:1, background:"var(--border)" }} />
    </div>
  );
}
