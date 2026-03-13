import { useState } from "react";
import { Btn, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { ACCENT_COLORS } from "../data/defaultData";
import { trackView } from "../utils/engage";

const ADDON_GROUPS = [
  { label:"Support & Implementation", keys:["VIP Support","End-to-End"] },
  { label:"One-time Setup",           keys:["GreenTick","Bot Building"] },
  { label:"CRM Integrations",         keys:["Zoho","HubSpot","IndiaMart","LeadSquared","Bitrix","3rd Party","CRM"] },
  { label:"Additional WABAs",         keys:["WABA"] },
];

function groupAddons(addons) {
  const groups = ADDON_GROUPS.map(g => ({ ...g, items:[] }));
  const other = { label:"Other", items:[] };
  addons.forEach(addon => {
    let placed = false;
    for (const group of groups) {
      if (group.keys.some(k => addon.name.includes(k))) { group.items.push(addon); placed = true; break; }
    }
    if (!placed) other.items.push(addon);
  });
  return [...groups, other].filter(g => g.items.length > 0);
}

const EMPTY_FORM = { name:"", description:"", price:"", compatiblePlans:"" };

export default function AddonsModule({ data: addons = [], loading, error, create, update, remove, adminMode }) {
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);

  const openAdd  = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (addon) => {
    setEditItem(addon);
    setForm({ name:addon.name||"", description:addon.description||"", price:addon.price||"", compatiblePlans:addon.compatiblePlans||addon.plans||"" });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.price.trim()) return;
    setSaving(true);
    try {
      editItem ? await update(editItem._id, form) : await create(form);
      setShowModal(false); setForm(EMPTY_FORM); setEditItem(null);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const grouped = groupAddons(addons);
  let globalIdx = 0;

  return (
    <div className="animate-in">
      <SectionHeader title="Add-ons & Services" subtitle="Purchasable extensions, one-time services, CRM integrations, and additional WABAs."
        action={adminMode && <Btn onClick={openAdd}><Icon name="plus" size={13} /> Add Add-on</Btn>} />

      {loading && <p style={{ color:"var(--text-muted)", fontSize:14 }}>Loading add-ons…</p>}
      {error   && <p style={{ color:"#f87171",          fontSize:14 }}>Error: {error}</p>}

      {!loading && addons.length === 0
        ? <EmptyState icon="addons" message="No add-ons added yet." />
        : grouped.map(group => (
          <div key={group.label} style={{ marginBottom:32 }}>
            {/* Group header */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent-orange)" }} />
              <span style={{ color:"var(--text-muted)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em" }}>{group.label}</span>
              <div style={{ flex:1, height:1, background:"var(--border)" }} />
              <span style={{ color:"var(--text-dim)", fontSize:11 }}>{group.items.length} item{group.items.length !== 1 ? "s" : ""}</span>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {group.items.map(addon => {
                const accent = ACCENT_COLORS[globalIdx++ % ACCENT_COLORS.length];
                const plans  = addon.compatiblePlans || addon.plans || "";
                const planList = plans.split(",").map(p => p.trim()).filter(Boolean);
                return (
                  <div key={addon._id}
                    style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-md)", padding:"18px 22px", display:"flex", alignItems:"center", gap:16, transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor="var(--border2)"; trackView("resource", addon._id); }}
                    onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}
                  >
                    <div style={{ width:42, height:42, borderRadius:"var(--radius-sm)", flexShrink:0, background:accent+"10", border:`1px solid ${accent}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon name="addons" size={16} color={accent} />
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:"var(--text)", fontWeight:700, fontSize:15, marginBottom:4, letterSpacing:"-0.01em" }}>{addon.name}</div>
                      <div style={{ color:"var(--text-muted)", fontSize:13.5, lineHeight:1.55, marginBottom: planList.length ? 8 : 0 }}>{addon.description}</div>
                      {planList.length > 0 && (
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                          <span style={{ color:"var(--text-dim)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Compatible:</span>
                          {planList.map(p => (
                            <span key={p} style={{ background:accent+"12", color:accent, border:`1px solid ${accent}25`, borderRadius:99, padding:"1px 8px", fontSize:11, fontWeight:600 }}>{p}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 }}>
                      <div style={{ color:accent, fontWeight:800, fontSize:16, fontFamily:"var(--font-display)", letterSpacing:"-0.02em", whiteSpace:"nowrap" }}>{addon.price}</div>
                      {adminMode && (
                        <div style={{ display:"flex", gap:6 }}>
                          <Btn small onClick={() => openEdit(addon)}><Icon name="edit" size={11} /> Edit</Btn>
                          <Btn variant="danger" small onClick={() => remove(addon._id)}><Icon name="trash" size={11} /></Btn>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      }

      <div style={{ marginTop:8, padding:"16px 22px", background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:"var(--radius-md)", borderLeft:"3px solid var(--accent-orange)" }}>
        <div style={{ color:"var(--text)", fontWeight:700, fontSize:14, marginBottom:5 }}>⚠️ Integration Note</div>
        <div style={{ color:"var(--text-muted)", fontSize:13.5, lineHeight:1.65 }}>All CRM integrations require an Open API. A one-time integration cost of <strong style={{ color:"var(--text)" }}>₹50,000</strong> applies, in addition to the annual subscription fee.</div>
      </div>

      {showModal && (
        <Modal title={editItem ? "Edit Add-on" : "Add Add-on"} onClose={() => setShowModal(false)}>
          <Field label="Name"             value={form.name}            onChange={v => setForm(f=>({...f,name:v}))}            placeholder="e.g. Priority SLA" />
          <Field label="Description"      value={form.description}     onChange={v => setForm(f=>({...f,description:v}))}     placeholder="What does this include?" as="textarea" />
          <Field label="Price"            value={form.price}           onChange={v => setForm(f=>({...f,price:v}))}           placeholder="e.g. ₹8,000/mo" />
          <Field label="Compatible Plans" value={form.compatiblePlans} onChange={v => setForm(f=>({...f,compatiblePlans:v}))} placeholder="e.g. Pro, Enterprise" />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <Btn onClick={save}>{saving ? "Saving…" : editItem ? "Update Add-on" : "Save Add-on"}</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
