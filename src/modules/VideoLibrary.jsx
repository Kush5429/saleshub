import { useState } from "react";
import { Btn, Badge, Card, Field, SectionHeader, EmptyState } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { CATEGORY_COLORS } from "../data/defaultData";
import { trackPlay } from "../utils/engage";

const CAT_OPTIONS = ["Demo","Feature","Technical","Security","How-To","Other"];
const EMPTY_FORM  = { title:"", videoUrl:"", category:"Demo", description:"" };

// Convert any YouTube URL format to a proper embed URL
function toEmbedUrl(url) {
  if (!url) return "";
  // Already embed format
  if (url.includes("youtube.com/embed/")) return url;
  // youtu.be/ID
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  // youtube.com/watch?v=ID
  const watch = url.match(/[?&]v=([^?&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  // youtube.com/channel or playlist — return as-is
  return url;
}

// Extract YouTube video ID for thumbnail
function getYtId(url) {
  if (!url) return null;
  const embed = url.match(/youtube\.com\/embed\/([^?&/]+)/);
  if (embed) return embed[1];
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return short[1];
  const watch = url.match(/[?&]v=([^?&]+)/);
  if (watch) return watch[1];
  return null;
}

function VideoCard({ video, adminMode, onRemove, onEdit }) {
  const [playing, setPlaying] = useState(false);
  const accent    = CATEGORY_COLORS[video.category] || "var(--accent)";
  const embedUrl  = toEmbedUrl(video.videoUrl);
  const ytId      = getYtId(video.videoUrl);
  const thumbUrl  = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
  const isChannel = !ytId && video.videoUrl; // channel/playlist link

  const handlePlay = () => {
    if (isChannel) { window.open(video.videoUrl, "_blank"); return; }
    trackPlay(video._id);
    setPlaying(true);
  };

  return (
    <Card style={{ padding:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>
      {/* Thumbnail / Player */}
      <div onClick={handlePlay} style={{ position:"relative", aspectRatio:"16/9", background:"#0a0a0a", cursor:"pointer", overflow:"hidden", flexShrink:0 }}>
        {playing ? (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            style={{ width:"100%", height:"100%", border:"none", display:"block" }}
            allow="autoplay; fullscreen"
            title={video.title}
          />
        ) : (
          <>
            {/* Thumbnail */}
            {thumbUrl ? (
              <img src={thumbUrl} alt={video.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", opacity:0.85 }} />
            ) : (
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#0d0d0d 0%,#1a1a1a 100%)" }} />
            )}
            {/* Overlay */}
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.35)" }} />
            {/* Play button */}
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 32px var(--accent)66`, transition:"transform 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.transform="scale(1.1)"}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
              >
                <Icon name={isChannel ? "external" : "play"} size={20} color="#000" />
              </div>
            </div>
            <div style={{ position:"absolute", bottom:12, left:12 }}>
              <Badge text={isChannel ? "Channel" : video.category} color={accent} />
            </div>
            {isChannel && (
              <div style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,0.7)", borderRadius:"var(--radius-sm)", padding:"4px 10px" }}>
                <span style={{ color:"var(--text-muted)", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Opens YouTube ↗</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:"16px 20px", flex:1 }}>
        <div style={{ color:"var(--text)", fontWeight:700, fontSize:15, marginBottom:6, letterSpacing:"-0.01em" }}>{video.title}</div>
        <div style={{ color:"var(--text-muted)", fontSize:13.5, lineHeight:1.6 }}>{video.description}</div>
        {adminMode && (
          <div style={{ marginTop:14, display:"flex", gap:8 }}>
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
    setForm({ title:video.title||"", videoUrl:video.videoUrl||"", category:video.category||"Demo", description:video.description||"" });
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
  const filtered   = filterCat === "All" ? videos : videos.filter(v => v.category === filterCat);

  return (
    <div className="animate-in">
      <SectionHeader title="Video Library" subtitle="Company demo videos, feature walkthroughs, and product showcases."
        action={adminMode && <Btn onClick={openAdd}><Icon name="plus" size={13} /> Add Video</Btn>} />

      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} style={{
            padding:"7px 16px", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:600,
            cursor:"pointer", border:"1px solid", transition:"all 0.15s",
            borderColor: filterCat === cat ? "var(--accent)" : "var(--border2)",
            background:  filterCat === cat ? "var(--accent)18" : "transparent",
            color:       filterCat === cat ? "var(--accent)"   : "var(--text-muted)",
          }}>{cat}</button>
        ))}
      </div>

      {loading && <p style={{ color:"var(--text-muted)", fontSize:14 }}>Loading videos…</p>}
      {error   && <p style={{ color:"#ff4444",          fontSize:14 }}>Error: {error}</p>}

      {!loading && filtered.length === 0
        ? <EmptyState icon="video" message="No videos found." />
        : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {filtered.map(video => (
              <VideoCard key={video._id} video={video} adminMode={adminMode}
                onRemove={() => remove(video._id)} onEdit={() => openEdit(video)} />
            ))}
          </div>
        )
      }

      <div style={{ marginTop:24, padding:"14px 20px", background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:"var(--radius-md)", borderLeft:"3px solid var(--accent-purple)" }}>
        <div style={{ color:"var(--text-muted)", fontSize:13, lineHeight:1.6 }}>
          💡 <strong style={{ color:"var(--text)" }}>Tip:</strong> For YouTube channel links, the card opens directly in YouTube. For individual videos, use the YouTube embed URL format: <code style={{ color:"var(--accent-purple)", fontSize:12 }}>https://www.youtube.com/embed/VIDEO_ID</code>
        </div>
      </div>

      {showModal && (
        <Modal title={editItem ? "Edit Video" : "Add Video"} onClose={() => setShowModal(false)}>
          <Field label="Video Title"       value={form.title}       onChange={v => setForm(f=>({...f,title:v}))}       placeholder="e.g. Platform Demo Q1 2026" />
          <Field label="YouTube URL"       value={form.videoUrl}    onChange={v => setForm(f=>({...f,videoUrl:v}))}    placeholder="Any YouTube URL format works" />
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", color:"var(--text-muted)", fontSize:11, fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Category</label>
            <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} style={{ width:"100%", background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:"var(--radius-sm)", padding:"9px 13px", color:"var(--text)", fontSize:13, outline:"none" }}>
              {CAT_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Description" value={form.description} onChange={v => setForm(f=>({...f,description:v}))} placeholder="What does this video cover?" as="textarea" />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <Btn onClick={save}>{saving ? "Saving…" : editItem ? "Update Video" : "Save Video"}</Btn>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
