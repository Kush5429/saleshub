import { useState } from "react";
import { Btn, Badge, Card, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { genId } from "../utils/storage";
import { STORAGE_KEYS, CATEGORY_COLORS } from "../data/defaultData";

const CAT_OPTIONS = ["Overview", "Features", "Technical", "Use Cases", "Other"];

export default function DocsHub({ docs, setDocs, adminMode }) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [form, setForm] = useState({ title: "", category: "Overview", description: "" });

  const save = () => {
    if (!form.title.trim()) return;
    setDocs(prev => [...prev, { ...form, id: genId(), timestamp: new Date().toISOString().split("T")[0], size: "—" }]);
    setShowModal(false);
    setForm({ title: "", category: "Overview", description: "" });
  };

  const remove = id => setDocs(prev => prev.filter(d => d.id !== id));

  const categories = ["All", ...new Set(docs.map(d => d.category))];
  const filtered = docs.filter(d =>
    (filterCat === "All" || d.category === filterCat) &&
    (d.title.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-in">
      <SectionHeader
        title="Documentation Hub"
        subtitle="Centralized repository for all platform PDFs and knowledge documents."
        action={adminMode && (
          <Btn onClick={() => setShowModal(true)}>
            <Icon name="plus" size={13} /> Upload Doc
          </Btn>
        )}
      />

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <Icon name="search" size={14} color="var(--text-dim)" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents…"
            style={{
              width:"100%", background:"var(--surface)", border:"1px solid var(--border2)",
              borderRadius:"var(--radius-sm)", padding:"8px 12px 8px 34px",
              color:"var(--text)", fontSize:13, outline:"none", boxSizing:"border-box",
            }}
          />
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{
              padding:"7px 14px", borderRadius:"var(--radius-sm)", fontSize:12, fontWeight:600,
              cursor:"pointer", border:"1px solid",
              borderColor: filterCat === cat ? "var(--accent)" : "var(--border2)",
              background: filterCat === cat ? "var(--accent)18" : "transparent",
              color: filterCat === cat ? "var(--accent)" : "var(--text-muted)",
            }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0
        ? <EmptyState icon="docs" message="No documents found." />
        : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map(doc => (
              <Card key={doc.id} style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                <div style={{
                  width:44, height:44, borderRadius:10, flexShrink:0,
                  background:"var(--surface2)", border:"1px solid var(--border2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <Icon name="file" size={18} color="var(--accent)" />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5, flexWrap:"wrap" }}>
                    <span style={{ color:"var(--text)", fontWeight:700, fontSize:15 }}>{doc.title}</span>
                    <Badge text={doc.category} color={CATEGORY_COLORS[doc.category] || "var(--text-muted)"} />
                  </div>
                  <p style={{ color:"var(--text-muted)", fontSize:13, margin:"0 0 8px" }}>{doc.description}</p>
                  <div style={{ display:"flex", gap:16, color:"var(--text-dim)", fontSize:12 }}>
                    <span>Uploaded: {doc.timestamp}</span>
                    {doc.size !== "—" && <span>Size: {doc.size}</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <Btn variant="ghost" small><Icon name="external" size={12} /></Btn>
                  {adminMode && <Btn variant="danger" small onClick={() => remove(doc.id)}><Icon name="trash" size={12} /></Btn>}
                </div>
              </Card>
            ))}
          </div>
        )
      }

      {showModal && (
        <Modal title="Upload Document" onClose={() => setShowModal(false)}>
          <Field label="Document Title" value={form.title} onChange={v => setForm(f => ({...f, title: v}))} placeholder="e.g. Platform Overview Q1 2026" />
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", color:"var(--text-muted)", fontSize:11, fontWeight:700, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.08em" }}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={{
              width:"100%", background:"var(--surface2)", border:"1px solid var(--border2)",
              borderRadius:"var(--radius-sm)", padding:"9px 13px", color:"var(--text)",
              fontSize:13, outline:"none",
            }}>
              {CAT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Description" value={form.description} onChange={v => setForm(f => ({...f, description: v}))} placeholder="Brief description of this document…" as="textarea" />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <Btn onClick={save}>Save Document</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
