import { useState } from "react";
import { Btn, Badge, Card, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { ACCENT_COLORS, CATEGORY_COLORS } from "../data/defaultData";

const CAT_OPTIONS = ["Sales", "Training", "Strategy", "Documentation", "External", "Other"];
const EMPTY_FORM  = { title: "", link: "", category: "Sales", description: "" };

export default function ResourcesHub({ data: resources = [], loading, error, create, update, remove, adminMode }) {
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [search,    setSearch]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);

  const openAdd  = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (res) => {
    setEditItem(res);
    setForm({ title: res.title || "", link: res.link || "", category: res.category || "Sales", description: res.description || "" });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      editItem ? await update(editItem._id, form) : await create(form);
      setShowModal(false); setForm(EMPTY_FORM); setEditItem(null);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const categories = ["All", ...new Set(resources.map(r => r.category))];
  const filtered = resources.filter(r =>
    (filterCat === "All" || r.category === filterCat) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-in">
      <SectionHeader title="Learning Resource Hub" subtitle="Training materials, sales guides, competitor decks, and external documentation."
        action={adminMode && <Btn onClick={openAdd}><Icon name="plus" size={13} /> Add Resource</Btn>} />
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…"
          style={{ flex: 1, minWidth: 180, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", padding: "8px 12px", color: "var(--text)", fontSize: 13, outline: "none" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{ padding: "6px 13px", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", borderColor: filterCat === cat ? "var(--accent)" : "var(--border2)", background: filterCat === cat ? "var(--accent)18" : "transparent", color: filterCat === cat ? "var(--accent)" : "var(--text-muted)" }}>{cat}</button>
          ))}
        </div>
      </div>
      {loading && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading resources…</p>}
      {error   && <p style={{ color: "#ff4444",          fontSize: 13 }}>Error: {error}</p>}
      {!loading && filtered.length === 0
        ? <EmptyState icon="resources" message="No resources found." />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((res, i) => {
              const accent = CATEGORY_COLORS[res.category] || ACCENT_COLORS[i % ACCENT_COLORS.length];
              return (
                <Card key={res._id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: "var(--surface2)", border: `1px solid ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="resources" size={18} color={accent} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 15 }}>{res.title}</span>
                      <Badge text={res.category} color={accent} />
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{res.description}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <a href={res.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <Btn variant="ghost" small><Icon name="external" size={12} /> Open</Btn>
                    </a>
                    {adminMode && (
                      <>
                        <Btn small onClick={() => openEdit(res)}><Icon name="edit" size={12} /></Btn>
                        <Btn variant="danger" small onClick={() => remove(res._id)}><Icon name="trash" size={12} /></Btn>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      }
      {showModal && (
        <Modal title={editItem ? "Edit Resource" : "Add Learning Resource"} onClose={() => setShowModal(false)}>
          <Field label="Resource Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Sales Playbook 2026" />
          <Field label="Link / URL"     value={form.link}  onChange={v => setForm(f => ({ ...f, link: v }))}  placeholder="https://…" type="url" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", padding: "9px 13px", color: "var(--text)", fontSize: 13, outline: "none" }}>
              {CAT_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Brief description of this resource…" as="textarea" />
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Btn onClick={save}>{saving ? "Saving…" : editItem ? "Update Resource" : "Save Resource"}</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
