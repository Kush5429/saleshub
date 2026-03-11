import { useState } from "react";
import { Btn, Badge, Card, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { genId } from "../utils/storage";
import { ACCENT_COLORS } from "../data/defaultData";

function PlanCard({ plan, accent, adminMode, onRemove }) {
  const featureList = Array.isArray(plan.features)
    ? plan.features
    : (plan.features ?? "").split(",").map(f => f.trim()).filter(Boolean);

  return (
    <div
      style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)", padding: "20px 18px",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", transition: "border-color 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />

      <div style={{ marginBottom: 14 }}>
        <div style={{ color: accent, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Plan</div>
        <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", marginBottom: 4 }}>{plan.name}</div>
        <div style={{ color: accent, fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "-0.04em", lineHeight: 1 }}>{plan.price}</div>
      </div>

      <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />

      <div style={{ flex: 1, marginBottom: 16 }}>
        {featureList.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
            <div style={{
              width: 14, height: 14, borderRadius: "50%", flexShrink: 0, marginTop: 2,
              background: accent + "15", border: `1px solid ${accent}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="check" size={8} color={accent} />
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.5, letterSpacing: "-0.01em" }}>{f}</span>
          </div>
        ))}
      </div>

      {plan.icp && (
        <div style={{
          background: "var(--surface2)", borderRadius: "var(--radius-sm)",
          padding: "10px 12px", marginBottom: 10, borderLeft: `3px solid ${accent}40`,
        }}>
          <div style={{ color: "var(--text-dim)", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Best for</div>
          <div style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5 }}>{plan.icp}</div>
        </div>
      )}

      {plan.limits && (
        <div style={{ color: "var(--text-dim)", fontSize: 11, marginTop: 4, letterSpacing: "-0.01em" }}>{plan.limits}</div>
      )}

      {adminMode && <div style={{ marginTop: 14 }}><Btn variant="danger" small onClick={onRemove}>Remove</Btn></div>}
    </div>
  );
}

export default function PricingModule({ plans, setPlans, addons, setAddons, adminMode }) {
  const [showPlan,  setShowPlan]  = useState(false);
  const [showAddon, setShowAddon] = useState(false);
  const [planForm,  setPlanForm]  = useState({ name: "", price: "", features: "", limits: "", icp: "" });
  const [addonForm, setAddonForm] = useState({ name: "", description: "", price: "", plans: "" });

  const savePlan = () => {
    if (!planForm.name.trim()) return;
    setPlans(prev => [...prev, { ...planForm, id: genId(), features: planForm.features.split(",").map(f => f.trim()).filter(Boolean) }]);
    setShowPlan(false);
    setPlanForm({ name: "", price: "", features: "", limits: "", icp: "" });
  };

  const saveAddon = () => {
    if (!addonForm.name.trim()) return;
    setAddons(prev => [...prev, { ...addonForm, id: genId() }]);
    setShowAddon(false);
    setAddonForm({ name: "", description: "", price: "", plans: "" });
  };

  const dtPlans = plans.filter(p => !p.name.startsWith("QuickSell"));
  const qsPlans = plans.filter(p => p.name.startsWith("QuickSell"));

  const PlanGrid = ({ items, offset = 0 }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 32 }}>
      {items.map((plan, i) => (
        <PlanCard
          key={plan.id} plan={plan}
          accent={ACCENT_COLORS[(i + offset) % ACCENT_COLORS.length]}
          adminMode={adminMode}
          onRemove={() => setPlans(prev => prev.filter(p => p.id !== plan.id))}
        />
      ))}
    </div>
  );

  return (
    <div className="animate-in">
      <SectionHeader
        title="Commercials & Pricing"
        subtitle="Plan breakdown, pricing tiers, ideal customer profiles, and add-ons."
        action={adminMode && <Btn onClick={() => setShowPlan(true)}><Icon name="plus" size={13} /> Add Plan</Btn>}
      />

      {/* DoubleTick Plans */}
      {dtPlans.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>DoubleTick Plans</span>
          </div>
          <PlanGrid items={dtPlans} offset={0} />
        </>
      )}

      {/* QuickSell Plans */}
      {qsPlans.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-blue)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>QuickSell Plans</span>
          </div>
          <PlanGrid items={qsPlans} offset={3} />
        </>
      )}

      {plans.length === 0 && <EmptyState icon="pricing" message="No pricing plans added yet." />}

      {/* Add-ons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-orange)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Add-ons & Services</span>
        </div>
        {adminMode && <Btn onClick={() => setShowAddon(true)} small><Icon name="plus" size={13} /> Add</Btn>}
      </div>

      {addons.length === 0
        ? <EmptyState icon="addons" message="No add-ons yet." />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {addons.map((addon, i) => {
              const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
              return (
                <div key={addon.id} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "var(--radius-sm)", flexShrink: 0,
                    background: accent + "10", border: `1px solid ${accent}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name="addons" size={14} color={accent} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 13.5, marginBottom: 2, letterSpacing: "-0.01em" }}>{addon.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.4 }}>{addon.description}</div>
                    {addon.plans && (
                      <div style={{ color: "var(--text-dim)", fontSize: 11, marginTop: 4 }}>Compatible: {addon.plans}</div>
                    )}
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ color: accent, fontWeight: 700, fontSize: 15, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{addon.price}</div>
                  </div>
                  {adminMode && (
                    <Btn variant="danger" small onClick={() => setAddons(prev => prev.filter(a => a.id !== addon.id))}>
                      <Icon name="trash" size={12} />
                    </Btn>
                  )}
                </div>
              );
            })}
          </div>
        )
      }

      {/* Conversation Costs */}
      <div style={{
        marginTop: 24, padding: "16px 20px",
        background: "var(--surface2)", border: "1px solid var(--border2)",
        borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--accent-blue)",
      }}>
        <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 13.5, marginBottom: 10, letterSpacing: "-0.01em" }}>
          💬 WhatsApp Conversation Costs (INR)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { label: "Marketing",      price: "₹0.87" },
            { label: "Utility",        price: "₹0.13" },
            { label: "Service",        price: "₹0.35" },
            { label: "Authentication", price: "₹0.35" },
          ].map(c => (
            <div key={c.label} style={{
              textAlign: "center", padding: "10px",
              background: "var(--surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
            }}>
              <div style={{ color: "var(--accent-blue)", fontWeight: 700, fontSize: 16, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{c.price}</div>
              <div style={{ color: "var(--text-dim)", fontSize: 11, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={{ color: "var(--text-dim)", fontSize: 11.5, marginTop: 10 }}>
          Per conversation pricing. Full international rates at{" "}
          <a href="https://doubletick.io/conversation-cost" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-blue)" }}>
            doubletick.io/conversation-cost
          </a>
        </div>
      </div>

      {showPlan && (
        <Modal title="Add Pricing Plan" onClose={() => setShowPlan(false)}>
          <Field label="Plan Name" value={planForm.name} onChange={v => setPlanForm(f => ({ ...f, name: v }))} placeholder="e.g. Professional" />
          <Field label="Price" value={planForm.price} onChange={v => setPlanForm(f => ({ ...f, price: v }))} placeholder="e.g. ₹8,000/mo" />
          <Field label="Features (comma-separated)" value={planForm.features} onChange={v => setPlanForm(f => ({ ...f, features: v }))} placeholder="Feature A, Feature B" as="textarea" />
          <Field label="Limits" value={planForm.limits} onChange={v => setPlanForm(f => ({ ...f, limits: v }))} placeholder="e.g. Up to 20 users" />
          <Field label="Best For (ICP)" value={planForm.icp} onChange={v => setPlanForm(f => ({ ...f, icp: v }))} placeholder="Who is this plan for?" as="textarea" />
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Btn onClick={savePlan}>Save Plan</Btn>
            <Btn variant="ghost" onClick={() => setShowPlan(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {showAddon && (
        <Modal title="Add Add-on" onClose={() => setShowAddon(false)}>
          <Field label="Name" value={addonForm.name} onChange={v => setAddonForm(f => ({ ...f, name: v }))} placeholder="e.g. VIP Support" />
          <Field label="Description" value={addonForm.description} onChange={v => setAddonForm(f => ({ ...f, description: v }))} placeholder="What does this include?" as="textarea" />
          <Field label="Price" value={addonForm.price} onChange={v => setAddonForm(f => ({ ...f, price: v }))} placeholder="e.g. ₹8,000/mo" />
          <Field label="Compatible Plans" value={addonForm.plans} onChange={v => setAddonForm(f => ({ ...f, plans: v }))} placeholder="e.g. Pro, Enterprise" />
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Btn onClick={saveAddon}>Save Add-on</Btn>
            <Btn variant="ghost" onClick={() => setShowAddon(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
