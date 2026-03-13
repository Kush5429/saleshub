import { useState } from "react";
import { Btn, Badge, Card, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { CATEGORY_COLORS } from "../data/defaultData";

const CAT_OPTIONS = ["Demo", "Feature", "Technical", "Security", "How-To", "Other"];
const EMPTY_FORM  = { title: "", videoUrl: "", category: "Demo", description: "" };

function VideoCard({ video, adminMode, onRemove, onEdit }) {
  const [playing, setPlaying] = useState(false);
  const accent = CATEGORY_COLORS[video.category] || "var(--accent)";
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div onClick={() => setPlaying(p => !p)} style={{ position: "relative", aspectRatio: "16/9", background: "#0a0a0a", cursor: "pointer", overflow: "hidden" }}>
        {playing ? (
          <iframe src={`${video.videoUrl}?autoplay=1`} style={{ width: "100%", height: "100%", border: "none", display: "block" }} allow="autoplay; fullscreen" title={video.title} />
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px var(--accent)55" }}>
                <Icon name="play" size={20} color="#000" />
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 12, left: 12 }}>
              <Badge text={video.category} color={accent} />
            </div>
          </>
        )}
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{video.title}</div>
        <div style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5 }}>{video.description}</div>
        {adminMode && (
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <Btn small onClick={onEdit}><Icon name="edit" size={11} /> Edit</Btn>
            <Btn variant="danger" small onClick={onRemove}><Icon name="trash" size={11} /> Remove</Btn>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function VideoLibrary({ data: videos = [], loading, error, create, update, remove, adminMode }) {
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [saving,    setSaving]    = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);

  const openAdd  = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (video) => {
    setEditItem(video);
    setForm({ title: video.title || "", videoUrl: video.videoUrl || "", category: video.category || "Demo", description: video.description || "" });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.videoUrl.trim()) return;
    setSaving(true);
    try {
      editItem ? await update(editItem._id, form) : await create(form);
      setShowModal(false); setForm(EMPTY_FORM); setEditItem(null);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const categories = ["All", ...new Set(videos.map(v => v.category))];
  const filtered = filterCat === "All" ? videos : videos.filter(v => v.category === filterCat);

  return (
    <div className="animate-in">
      <SectionHeader title="Video Library" subtitle="Company demo videos, feature walkthroughs, and product showcases."
        action={adminMode && <Btn onClick={openAdd}><Icon name="plus" size={13} /> Add Video</Btn>} />
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} style={{ padding: "6px 14px", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", borderColor: filterCat === cat ? "var(--accent)" : "var(--border2)", background: filterCat === cat ? "var(--accent)18" : "transparent", color: filterCat === cat ? "var(--accent)" : "var(--text-muted)" }}>{cat}</button>
        ))}
      </div>
      {loading && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading videos…</p>}
      {error   && <p style={{ color: "#ff4444",          fontSize: 13 }}>Error: {error}</p>}
      {!loading && filtered.length === 0
        ? <EmptyState icon="video" message="No videos found." />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {filtered.map(video => (
              <VideoCard key={video._id} video={video} adminMode={adminMode} onRemove={() => remove(video._id)} onEdit={() => openEdit(video)} />
            ))}
          </div>
        )
      }
      {showModal && (
        <Modal title={editItem ? "Edit Video" : "Add Video"} onClose={() => setShowModal(false)}>
          <Field label="Video Title"        value={form.title}       onChange={v => setForm(f => ({ ...f, title: v }))}       placeholder="e.g. Platform Demo Q1 2026" />
          <Field label="YouTube Embed URL"  value={form.videoUrl}    onChange={v => setForm(f => ({ ...f, videoUrl: v }))}    placeholder="https://www.youtube.com/embed/…" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", padding: "9px 13px", color: "var(--text)", fontSize: 13, outline: "none" }}>
              {CAT_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="What does this video cover?" as="textarea" />
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Btn onClick={save}>{saving ? "Saving…" : editItem ? "Update Video" : "Save Video"}</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
