import { useState } from "react";
import { Btn, Badge, Card, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { uploadFile } from "../utils/api";
import { CATEGORY_COLORS } from "../data/defaultData";

const CAT_OPTIONS = ["Overview", "Features", "Technical", "Use Cases", "Other"];

// Static docs always available regardless of API status
const STATIC_DOCS = [
  {
    _id: "static-doubletick-rm-deck",
    title: "DoubleTick for RM & Sales Teams",
    category: "Overview",
    description: "Complete product deck for Relationship Managers and Sales Teams — CX governance, key differentiators, features, bot studio, analytics, and case studies.",
    fileUrl: "/public/DoubleTick for RM_ Sales Teams.pdf",
    createdAt: new Date("2025-01-01").toISOString(),
    isStatic: true,
  },
];

const EMPTY_FORM = { title: "", category: "Overview", description: "", fileUrl: "" };

export default function DocsHub({ data: apiDocs = [], loading, error, create, update, remove, adminMode }) {
  const staticTitles = new Set(STATIC_DOCS.map(d => d.title));
  const docs = [...STATIC_DOCS, ...apiDocs.filter(d => !staticTitles.has(d.title))];

  const [showModal, setShowModal] = useState(false);
  const [search,    setSearch]    = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [saving,    setSaving]    = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [fileObj,   setFileObj]   = useState(null);

  const openAdd  = () => { setEditItem(null); setForm(EMPTY_FORM); setFileObj(null); setShowModal(true); };
  const openEdit = (doc) => {
    setEditItem(doc);
    setForm({ title: doc.title || "", category: doc.category || "Overview", description: doc.description || "", fileUrl: doc.fileUrl || "" });
    setFileObj(null);
    setShowModal(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      let fileUrl = form.fileUrl;
      if (fileObj) { const uploaded = await uploadFile(fileObj); fileUrl = uploaded.url; }
      const payload = { ...form, fileUrl };
      editItem ? await update(editItem._id, payload) : await create(payload);
      setShowModal(false); setForm(EMPTY_FORM); setFileObj(null); setEditItem(null);
    } catch (err) { alert("Save failed: " + err.message); }
    finally { setSaving(false); }
  };

  const categories = ["All", ...new Set(docs.map(d => d.category))];
  const filtered = docs.filter(d =>
    (filterCat === "All" || d.category === filterCat) &&
    (d.title.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-in">
      <SectionHeader title="Documentation Hub" subtitle="Centralized repository for all platform PDFs and knowledge documents."
        action={adminMode && <Btn onClick={openAdd}><Icon name="plus" size={13} /> Upload Doc</Btn>} />
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
          style={{ flex: 1, minWidth: 200, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", padding: "8px 12px", color: "var(--text)", fontSize: 13, outline: "none" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{ padding: "7px 14px", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", borderColor: filterCat === cat ? "var(--accent)" : "var(--border2)", background: filterCat === cat ? "var(--accent)18" : "transparent", color: filterCat === cat ? "var(--accent)" : "var(--text-muted)" }}>{cat}</button>
          ))}
        </div>
      </div>
      {loading && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading documents…</p>}
      {error   && <p style={{ color: "#ff4444",          fontSize: 13 }}>Error: {error}</p>}
      {!loading && filtered.length === 0
        ? <EmptyState icon="docs" message="No documents found." />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(doc => (
              <Card key={doc._id} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: "var(--surface2)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="file" size={18} color="var(--accent)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 15 }}>{doc.title}</span>
                    <Badge text={doc.category} color={CATEGORY_COLORS[doc.category] || "var(--text-muted)"} />
                    {doc.isStatic && <Badge text="PINNED" color="var(--accent)" />}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 8px" }}>{doc.description}</p>
                  <div style={{ color: "var(--text-dim)", fontSize: 12 }}>Added: {new Date(doc.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {doc.fileUrl && (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Btn variant="ghost" small><Icon name="external" size={12} /></Btn>
                    </a>
                  )}
                  {adminMode && !doc.isStatic && (
                    <>
                      <Btn small onClick={() => openEdit(doc)}><Icon name="edit" size={12} /></Btn>
                      <Btn variant="danger" small onClick={() => remove(doc._id)}><Icon name="trash" size={12} /></Btn>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      }
      {showModal && (
        <Modal title={editItem ? "Edit Document" : "Upload Document"} onClose={() => setShowModal(false)}>
          <Field label="Document Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Platform Overview Q1 2026" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", padding: "9px 13px", color: "var(--text)", fontSize: 13, outline: "none" }}>
              {CAT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Brief description of this document…" as="textarea" />
          {!editItem && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Upload File (PDF)</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFileObj(e.target.files[0] || null)} style={{ color: "var(--text-muted)", fontSize: 13 }} />
            </div>
          )}
          <Field label="Or paste file URL" value={form.fileUrl} onChange={v => setForm(f => ({ ...f, fileUrl: v }))} placeholder="https://…" type="url" />
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Btn onClick={save}>{saving ? "Saving…" : editItem ? "Update Document" : "Save Document"}</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
