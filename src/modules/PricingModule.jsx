import { useState } from "react";
import { Btn, Badge, Card, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { genId } from "../utils/storage";
import { ACCENT_COLORS } from "../data/defaultData";

/* ── Plan Card ── */
function PlanCard({ plan, accent, adminMode, onRemove }) {
  const featureList = Array.isArray(plan.features)
    ? plan.features
    : plan.features.split(",").map(f => f.trim()).filter(Boolean);

  return (
    <div style={{
      background:"var(--surface)", border:`1px solid ${accent}33`,
      borderRadius:"var(--radius-xl)", padding:28,
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:accent }} />
      <div style={{ color:"var(--text-dim)", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Plan</div>
      <div style={{ color:"var(--text)", fontSize:22, fontWeight:900, fontFamily:"var(--font-display)", marginBottom:2 }}>{plan.name}</div>
      <div style={{ color:accent, fontSize:30, fontWeight:900, fontFamily:"var(--font-display)", marginBottom:20 }}>{plan.price}</div>

      <div style={{ marginBottom:20 }}>
        {featureList.map((f, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
            <Icon name="check" size={13} color={accent} />
            <span style={{ color:"var(--text-muted)", fontSize:13 }}>{f}</span>
          </div>
        ))}
      </div>

      <div style={{ background:"var(--surface2)", borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
        <div style={{ color:"var(--text-dim)", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>Ideal Customer</div>
        <div style={{ color:"var(--text-muted)", fontSize:13 }}>{plan.icp}</div>
      </div>

      <div style={{ color:"var(--text-dim)", fontSize:11 }}>Limits: {plan.limits}</div>
      {adminMode && <div style={{ marginTop:16 }}><Btn variant="danger" small onClick={onRemove}>Remove Plan</Btn></div>}
    </div>
  );
}

/* ── Main Module ── */
export default function PricingModule({ plans, setPlans, addons, setAddons, adminMode }) {
  const [showPlan, setShowPlan] = useState(false);
  const [showAddon, setShowAddon] = useState(false);
  const [planForm, setPlanForm] = useState({ name:"", price:"", features:"", limits:"", icp:"" });
  const [addonForm, setAddonForm] = useState({ name:"", description:"", price:"", plans:"" });

  const savePlan = () => {
    if (!planForm.name.trim()) return;
    setPlans(prev => [...prev, { ...planForm, id:genId(), features: planForm.features.split(",").map(f=>f.trim()).filter(Boolean) }]);
    setShowPlan(false);
    setPlanForm({ name:"", price:"", features:"", limits:"", icp:"" });
  };

  const saveAddon = () => {
    if (!addonForm.name.trim()) return;
    setAddons(prev => [...prev, { ...addonForm, id:genId() }]);
    setShowAddon(false);
    setAddonForm({ name:"", description:"", price:"", plans:"" });
  };

  return (
    <div className="animate-in">
      <SectionHeader
        title="Commercials & Pricing"
        subtitle="Plan breakdown, pricing tiers, ideal customer profiles, and add-ons."
        action={adminMode && (
          <Btn onClick={() => setShowPlan(true)}><Icon name="plus" size={13} /> Add Plan</Btn>
        )}
      />

      {/* Plans */}
      {plans.length === 0
        ? <EmptyState icon="pricing" message="No pricing plans added yet." />
        : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:44 }}>
            {plans.map((plan, i) => (
              <PlanCard
                key={plan.id} plan={plan}
                accent={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                adminMode={adminMode}
                onRemove={() => setPlans(prev => prev.filter(p => p.id !== plan.id))}
              />
            ))}
          </div>
        )
      }

      {/* Add-ons section */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div>
          <h3 style={{ color:"var(--text)", fontSize:20, fontWeight:800, fontFamily:"var(--font-display)", margin:0 }}>Add-on Features</h3>
          <p style={{ color:"var(--text-muted)", fontSize:13, marginTop:4 }}>Purchasable extensions for compatible plans.</p>
        </div>
        {adminMode && <Btn onClick={() => setShowAddon(true)} small><Icon name="plus" size={13} /> Add Add-on</Btn>}
      </div>

      {addons.length === 0
        ? <EmptyState icon="addons" message="No add-ons added yet." />
        : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {addons.map((addon, i) => (
              <Card key={addon.id} style={{ display:"flex", alignItems:"center", gap:18 }}>
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  background:"var(--surface2)", border:`1px solid ${ACCENT_COLORS[i % 6]}33`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <Icon name="addons" size={16} color={ACCENT_COLORS[i % 6]} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:"var(--text)", fontWeight:700, fontSize:15, marginBottom:3 }}>{addon.name}</div>
                  <div style={{ color:"var(--text-muted)", fontSize:13 }}>{addon.description}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0, marginLeft:16 }}>
                  <div style={{ color:"var(--accent)", fontWeight:800, fontSize:18, fontFamily:"var(--font-display)" }}>{addon.price}</div>
                  <div style={{ color:"var(--text-dim)", fontSize:11, marginTop:3 }}>Compatible: {addon.plans}</div>
                </div>
                {adminMode && (
                  <Btn variant="danger" small onClick={() => setAddons(prev => prev.filter(a => a.id !== addon.id))}>
                    <Icon name="trash" size={12} />
                  </Btn>
                )}
              </Card>
            ))}
          </div>
        )
      }

      {/* Add Plan Modal */}
      {showPlan && (
        <Modal title="Add Pricing Plan" onClose={() => setShowPlan(false)}>
          <Field label="Plan Name" value={planForm.name} onChange={v => setPlanForm(f=>({...f,name:v}))} placeholder="e.g. Professional" />
          <Field label="Price" value={planForm.price} onChange={v => setPlanForm(f=>({...f,price:v}))} placeholder="e.g. $99/mo or Custom" />
          <Field label="Features (comma-separated)" value={planForm.features} onChange={v => setPlanForm(f=>({...f,features:v}))} placeholder="Feature A, Feature B, Feature C" as="textarea" />
          <Field label="Limits" value={planForm.limits} onChange={v => setPlanForm(f=>({...f,limits:v}))} placeholder="e.g. 10 users · 50GB" />
          <Field label="Ideal Customer Profile" value={planForm.icp} onChange={v => setPlanForm(f=>({...f,icp:v}))} placeholder="Who is this plan built for?" as="textarea" />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <Btn onClick={savePlan}>Save Plan</Btn>
            <Btn variant="ghost" onClick={() => setShowPlan(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Add Add-on Modal */}
      {showAddon && (
        <Modal title="Add Add-on Feature" onClose={() => setShowAddon(false)}>
          <Field label="Add-on Name" value={addonForm.name} onChange={v => setAddonForm(f=>({...f,name:v}))} placeholder="e.g. Custom Integrations Pack" />
          <Field label="Description" value={addonForm.description} onChange={v => setAddonForm(f=>({...f,description:v}))} placeholder="What does this add-on include?" as="textarea" />
          <Field label="Price" value={addonForm.price} onChange={v => setAddonForm(f=>({...f,price:v}))} placeholder="e.g. $59/mo" />
          <Field label="Compatible Plans" value={addonForm.plans} onChange={v => setAddonForm(f=>({...f,plans:v}))} placeholder="e.g. Growth, Enterprise" />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <Btn onClick={saveAddon}>Save Add-on</Btn>
            <Btn variant="ghost" onClick={() => setShowAddon(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
