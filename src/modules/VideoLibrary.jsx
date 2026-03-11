import { useState } from "react";
import { Btn, Badge, Card, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { genId } from "../utils/storage";
import { CATEGORY_COLORS } from "../data/defaultData";

const CAT_OPTIONS = ["Demo", "Feature", "Technical", "Security", "How-To", "Other"];

function VideoCard({ video, adminMode, onRemove }) {
  const [playing, setPlaying] = useState(false);
  const accent = CATEGORY_COLORS[video.category] || "var(--accent)";

  return (
    <Card style={{ padding:0, overflow:"hidden" }}>
      {/* Thumbnail / Player */}
      <div
        onClick={() => setPlaying(p => !p)}
        style={{ position:"relative", aspectRatio:"16/9", background:"#0a0a0a", cursor:"pointer", overflow:"hidden" }}
      >
        {playing ? (
          <iframe
            src={`${video.url}?autoplay=1`}
            style={{ width:"100%", height:"100%", border:"none", display:"block" }}
            allow="autoplay; fullscreen"
            title={video.title}
          />
        ) : (
          <>
            <div style={{
              position:"absolute", inset:0,
              background:"linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <div style={{
                width:54, height:54, borderRadius:"50%",
                background:"var(--accent)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 0 30px var(--accent)55",
              }}>
                <Icon name="play" size={20} color="#000" />
              </div>
            </div>
            <div style={{ position:"absolute", bottom:12, left:12 }}>
              <Badge text={video.category} color={accent} />
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:"14px 18px" }}>
        <div style={{ color:"var(--text)", fontWeight:700, fontSize:14, marginBottom:5 }}>{video.title}</div>
        <div style={{ color:"var(--text-muted)", fontSize:12, lineHeight:1.5 }}>{video.description}</div>
        {adminMode && (
          <div style={{ marginTop:12 }}>
            <Btn variant="danger" small onClick={onRemove}><Icon name="trash" size={12} /> Remove</Btn>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function VideoLibrary({ videos, setVideos, adminMode }) {
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [form, setForm] = useState({ title:"", url:"", category:"Demo", description:"" });

  const save = () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setVideos(prev => [...prev, { ...form, id:genId() }]);
    setShowModal(false);
    setForm({ title:"", url:"", category:"Demo", description:"" });
  };

  const categories = ["All", ...new Set(videos.map(v => v.category))];
  const filtered = filterCat === "All" ? videos : videos.filter(v => v.category === filterCat);

  return (
    <div className="animate-in">
      <SectionHeader
        title="Video Library"
        subtitle="Company demo videos, feature walkthroughs, and product showcases."
        action={adminMode && (
          <Btn onClick={() => setShowModal(true)}><Icon name="plus" size={13} /> Add Video</Btn>
        )}
      />

      {/* Filter Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} style={{
            padding:"6px 14px", borderRadius:"var(--radius-sm)", fontSize:12, fontWeight:600,
            cursor:"pointer", border:"1px solid",
            borderColor: filterCat === cat ? "var(--accent)" : "var(--border2)",
            background: filterCat === cat ? "var(--accent)18" : "transparent",
            color: filterCat === cat ? "var(--accent)" : "var(--text-muted)",
          }}>{cat}</button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="video" message="No videos found." />
        : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {filtered.map(video => (
              <VideoCard
                key={video.id} video={video}
                adminMode={adminMode}
                onRemove={() => setVideos(prev => prev.filter(v => v.id !== video.id))}
              />
            ))}
          </div>
        )
      }

      {showModal && (
        <Modal title="Add Video" onClose={() => setShowModal(false)}>
          <Field label="Video Title" value={form.title} onChange={v => setForm(f=>({...f,title:v}))} placeholder="e.g. Platform Demo Q1 2026" />
          <Field label="YouTube Embed URL" value={form.url} onChange={v => setForm(f=>({...f,url:v}))} placeholder="https://www.youtube.com/embed/..." />
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", color:"var(--text-muted)", fontSize:11, fontWeight:700, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.08em" }}>Category</label>
            <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} style={{
              width:"100%", background:"var(--surface2)", border:"1px solid var(--border2)",
              borderRadius:"var(--radius-sm)", padding:"9px 13px", color:"var(--text)", fontSize:13, outline:"none",
            }}>
              {CAT_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Description" value={form.description} onChange={v => setForm(f=>({...f,description:v}))} placeholder="What does this video cover?" as="textarea" />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <Btn onClick={save}>Save Video</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
