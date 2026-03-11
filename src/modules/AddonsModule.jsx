import { useState } from "react";
import { Btn, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { ACCENT_COLORS } from "../data/defaultData";

const ADDON_GROUPS = [
  { label: "Support & Implementation", keys: ["VIP Support", "End-to-End"] },
  { label: "One-time Setup",           keys: ["GreenTick", "Bot Building"] },
  { label: "CRM Integrations",         keys: ["Zoho", "HubSpot", "IndiaMart", "LeadSquared", "Bitrix", "3rd Party", "CRM"] },
  { label: "Additional WABAs",         keys: ["WABA"] },
];

function groupAddons(addons) {
  const groups = ADDON_GROUPS.map(g => ({ ...g, items: [] }));
  const other = { label: "Other", items: [] };
  addons.forEach(addon => {
    let placed = false;
    for (const group of groups) {
      if (group.keys.some(k => addon.name.includes(k))) {
        group.items.push(addon);
        placed = true;
        break;
      }
    }
    if (!placed) other.items.push(addon);
  });
  return [...groups, other].filter(g => g.items.length > 0);
}

export default function AddonsModule({ data: addons = [], loading, error, create, remove, adminMode }) {
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", compatiblePlans: "" });

  const save = async () => {
    if (!form.name.trim() || !form.price.trim()) return;
    setSaving(true);
    try {
      await create(form);
      setShowModal(false);
      setForm({ name: "", description: "", price: "", compatiblePlans: "" });
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const grouped = groupAddons(addons);
  let globalIdx = 0;

  return (
    <div className="animate-in">
      <SectionHeader
        title="Add-ons & Services"
        subtitle="Purchasable extensions, one-time services, CRM integrations, and additional WABAs."
        action={adminMode && (
          <Btn onClick={() => setShowModal(true)}>
            <Icon name="plus" size={13} /> Add Add-on
          </Btn>
        )}
      />

      {loading && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading add-ons…</p>}
      {error   && <p style={{ color: "#f87171", fontSize: 13 }}>Error: {error}</p>}

      {!loading && addons.length === 0
        ? <EmptyState icon="addons" message="No add-ons added yet." />
        : grouped.map(group => (
          <div key={group.label} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent-orange)" }} />
              <span style={{ color: "var(--text-muted)", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {group.label}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ color: "var(--text-dim)", fontSize: 10.5 }}>
                {group.items.length} item{group.items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {group.items.map(addon => {
                const accent = ACCENT_COLORS[globalIdx++ % ACCENT_COLORS.length];
                const plans  = addon.compatiblePlans || addon.plans || "";
                return (
                  <div key={addon._id} style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", padding: "14px 18px",
                    display: "flex", alignItems: "flex-start", gap: 14,
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: "var(--radius-sm)", flexShrink: 0,
                      background: accent + "10", border: `1px solid ${accent}22`,
                      display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                    }}>
                      <Icon name="addons" size={13} color={accent} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 13.5, marginBottom: 3, letterSpacing: "-0.01em" }}>
                        {addon.name}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.5, marginBottom: plans ? 6 : 0 }}>
                        {addon.description}
                      </div>
                      {plans && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ color: "var(--text-dim)", fontSize: 10.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>Compatible:</span>
                          <span style={{ color: accent, fontSize: 11, fontWeight: 600 }}>{plans}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <div style={{ color: accent, fontWeight: 700, fontSize: 14, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
                        {addon.price}
                      </div>
                      {adminMode && (
                        <Btn variant="danger" small onClick={() => remove(addon._id)}>
                          <Icon name="trash" size={11} />
                        </Btn>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      }

      {/* Integration note */}
      <div style={{
        marginTop: 8, padding: "14px 18px",
        background: "var(--surface2)", border: "1px solid var(--border2)",
        borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--accent-orange)",
      }}>
        <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>⚠️ Integration Note</div>
        <div style={{ color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.6 }}>
          All CRM integrations require an Open API. A one-time integration cost of{" "}
          <strong style={{ color: "var(--text)" }}>₹50,000</strong> applies, in addition to the annual subscription fee.
        </div>
      </div>

      {showModal && (
        <Modal title="Add Add-on" onClose={() => setShowModal(false)}>
          <Field label="Name"             value={form.name}            onChange={v => setForm(f => ({ ...f, name: v }))}            placeholder="e.g. Priority SLA" />
          <Field label="Description"      value={form.description}     onChange={v => setForm(f => ({ ...f, description: v }))}     placeholder="What does this include?" as="textarea" />
          <Field label="Price"            value={form.price}           onChange={v => setForm(f => ({ ...f, price: v }))}           placeholder="e.g. ₹8,000/mo" />
          <Field label="Compatible Plans" value={form.compatiblePlans} onChange={v => setForm(f => ({ ...f, compatiblePlans: v }))} placeholder="e.g. Pro, Enterprise" />
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Btn onClick={save}>{saving ? "Saving…" : "Save Add-on"}</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
