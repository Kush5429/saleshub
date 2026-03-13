import { useState, useEffect, useCallback } from "react";
import { getRelations, createRelation, deleteRelation } from "../utils/api";
import { featuresApi, docsApi, videosApi, resourcesApi, pricingApi } from "../utils/api";
import Icon from "../components/Icon";

const TYPE_META = {
  feature:  { label:"Feature",   color:"var(--accent-purple)", icon:"features",  api: featuresApi,  nameKey:"featureName" },
  docs:     { label:"Doc",       color:"var(--accent-blue)",   icon:"docs",      api: docsApi,      nameKey:"title" },
  video:    { label:"Video",     color:"var(--accent-pink)",   icon:"video",     api: videosApi,    nameKey:"title" },
  resource: { label:"Resource",  color:"var(--accent-green)",  icon:"resources", api: resourcesApi, nameKey:"title" },
  pricing:  { label:"Plan",      color:"var(--accent)",        icon:"pricing",   api: pricingApi,   nameKey:"name" },
};

const RELATION_LABELS = {
  related:      "Related",
  demo_of:      "Demo of",
  docs_for:     "Docs for",
  priced_at:    "Priced at",
  resource_for: "Resource for",
};

function TypeBadge({ type, small }) {
  const meta = TYPE_META[type] || TYPE_META.docs;
  const sz   = small ? 9 : 10;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding: small ? "2px 7px" : "3px 9px", borderRadius:999, background: meta.color + "15", border:`1px solid ${meta.color}30`, color: meta.color, fontSize: small ? 10.5 : 11.5, fontWeight:700, whiteSpace:"nowrap" }}>
      <Icon name={meta.icon} size={sz} color={meta.color} />
      {meta.label}
    </span>
  );
}

function RelationRow({ rel, isAdmin, onDelete }) {
  const meta = TYPE_META[rel.targetType] || TYPE_META.docs;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:9, background:"var(--bg)", border:"1px solid var(--border2)", transition:"border-color 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = meta.color + "50"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border2)"}
    >
      <div style={{ width:30, height:30, borderRadius:8, background: meta.color + "12", border:`1px solid ${meta.color}25`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon name={meta.icon} size={13} color={meta.color} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {rel.targetName || rel.targetId}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
          <TypeBadge type={rel.targetType} small />
          <span style={{ fontSize:10.5, color:"var(--text-dim)" }}>
            {RELATION_LABELS[rel.relationType] || rel.relationType}
          </span>
        </div>
      </div>
      {isAdmin && (
        <button onClick={() => onDelete(rel._id)} title="Remove relation"
          style={{ width:26, height:26, borderRadius:6, background:"none", border:"1px solid var(--border2)", color:"var(--text-dim)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}
          onMouseEnter={e => { e.currentTarget.style.background="#ff000020"; e.currentTarget.style.borderColor="#ff000060"; e.currentTarget.style.color="#f87171"; }}
          onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.color="var(--text-dim)"; }}
        >
          <Icon name="trash" size={11} color="currentColor" />
        </button>
      )}
    </div>
  );
}

export default function KnowledgeGraph({ isAdmin }) {
  const [catalog,       setCatalog]       = useState({});  // { type: [items] }
  const [sourceType,    setSourceType]    = useState("feature");
  const [sourceId,      setSourceId]      = useState("");
  const [relations,     setRelations]     = useState([]);
  const [loadingCat,    setLoadingCat]    = useState(true);
  const [loadingRels,   setLoadingRels]   = useState(false);

  // Add relation form state
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [addTargetType, setAddTargetType] = useState("docs");
  const [addTargetId,   setAddTargetId]   = useState("");
  const [addRelType,    setAddRelType]    = useState("related");
  const [adding,        setAdding]        = useState(false);
  const [addError,      setAddError]      = useState(null);

  // Load all catalog data once
  useEffect(() => {
    async function load() {
      setLoadingCat(true);
      try {
        const [features, docs, videos, resources, pricing] = await Promise.all([
          featuresApi.getAll(),
          docsApi.getAll(),
          videosApi.getAll(),
          resourcesApi.getAll(),
          pricingApi.getAll(),
        ]);
        setCatalog({ feature: features, docs, video: videos, resource: resources, pricing });
        // Default select first feature
        if (features?.length) setSourceId(features[0]._id);
      } catch (e) {
        console.error("Catalog load failed", e);
      } finally {
        setLoadingCat(false);
      }
    }
    load();
  }, []);

  // Load relations when source changes
  useEffect(() => {
    if (!sourceId) return;
    setLoadingRels(true);
    setRelations([]);
    getRelations(sourceType, sourceId)
      .then(setRelations)
      .catch(e => console.error("Relations load failed", e))
      .finally(() => setLoadingRels(false));
  }, [sourceType, sourceId]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteRelation(id);
      setRelations(prev => prev.filter(r => r._id !== id));
    } catch (e) { alert(e.message); }
  }, []);

  const handleAdd = useCallback(async () => {
    if (!addTargetId || adding) return;
    setAdding(true);
    setAddError(null);
    try {
      const newRel = await createRelation({ sourceType, sourceId, targetType: addTargetType, targetId: addTargetId, relationType: addRelType });
      // Re-fetch to get enriched name
      const updated = await getRelations(sourceType, sourceId);
      setRelations(updated);
      setShowAddForm(false);
      setAddTargetId("");
    } catch (e) {
      setAddError(e.message);
    } finally {
      setAdding(false);
    }
  }, [sourceType, sourceId, addTargetType, addTargetId, addRelType, adding]);

  const sourceItems  = catalog[sourceType] || [];
  const targetItems  = catalog[addTargetType] || [];
  const sourceMeta   = TYPE_META[sourceType];
  const selectedItem = sourceItems.find(i => i._id === sourceId);

  const selectStyle = { background:"var(--border)", border:"1px solid var(--border2)", color:"var(--text)", fontSize:13, padding:"8px 12px", borderRadius:8, outline:"none", cursor:"pointer", width:"100%" };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"var(--accent-green)15", border:"1px solid var(--accent-green)30", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="link" size={18} color="var(--accent-green)" />
          </div>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:"var(--text)", margin:0, fontFamily:"Syne, sans-serif" }}>Knowledge Graph</h1>
            <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:1 }}>Link content assets together — features, docs, videos, pricing, resources</div>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:24, alignItems:"start" }}>

        {/* Left: Source selector */}
        <div style={{ background:"var(--border)", border:"1px solid var(--border2)", borderRadius:14, padding:"18px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Source Content</div>

          {/* Type selector pills */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
            {Object.entries(TYPE_META).map(([type, meta]) => (
              <button key={type} onClick={() => { setSourceType(type); setSourceId(catalog[type]?.[0]?._id || ""); setRelations([]); setShowAddForm(false); }}
                style={{ padding:"5px 11px", borderRadius:999, background: sourceType === type ? meta.color + "20" : "var(--bg)", border:`1px solid ${sourceType === type ? meta.color + "50" : "var(--border2)"}`, color: sourceType === type ? meta.color : "var(--text-muted)", fontSize:11.5, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
              >
                {meta.label}
              </button>
            ))}
          </div>

          {/* Item list */}
          {loadingCat
            ? <div style={{ color:"var(--text-dim)", fontSize:13, textAlign:"center", padding:20 }}>Loading…</div>
            : (
              <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:380, overflowY:"auto" }}>
                {sourceItems.map(item => {
                  const name = item[sourceMeta.nameKey] || item.title || item.name || item.featureName;
                  const active = item._id === sourceId;
                  return (
                    <button key={item._id} onClick={() => setSourceId(item._id)}
                      style={{ textAlign:"left", padding:"9px 12px", borderRadius:9, background: active ? sourceMeta.color + "15" : "var(--bg)", border:`1px solid ${active ? sourceMeta.color + "50" : "var(--border2)"}`, color: active ? "var(--text)" : "var(--text-muted)", fontSize:13, cursor:"pointer", transition:"all 0.12s", fontWeight: active ? 600 : 400 }}
                    >
                      {name}
                    </button>
                  );
                })}
                {!sourceItems.length && <div style={{ color:"var(--text-dim)", fontSize:12.5, padding:"8px 0" }}>No {sourceMeta.label.toLowerCase()}s found</div>}
              </div>
            )
          }
        </div>

        {/* Right: Relations panel */}
        <div>
          {/* Selected item header */}
          {selectedItem && (
            <div style={{ padding:"16px 20px", background:"var(--border)", border:`1px solid ${sourceMeta.color}30`, borderRadius:12, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:9, background: sourceMeta.color + "15", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon name={sourceMeta.icon} size={16} color={sourceMeta.color} />
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:"var(--text)" }}>
                    {selectedItem[sourceMeta.nameKey]}
                  </div>
                  <TypeBadge type={sourceType} small />
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => { setShowAddForm(v => !v); setAddError(null); }}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:8, background: showAddForm ? "var(--border2)" : "var(--accent)15", border:`1px solid ${showAddForm ? "var(--border2)" : "var(--accent)40"}`, color: showAddForm ? "var(--text-muted)" : "var(--accent)", fontSize:12.5, fontWeight:700, cursor:"pointer" }}>
                  <Icon name="plus" size={13} color="currentColor" />
                  {showAddForm ? "Cancel" : "Link Content"}
                </button>
              )}
            </div>
          )}

          {/* Add relation form */}
          {showAddForm && isAdmin && (
            <div style={{ padding:"18px 20px", background:"var(--border)", border:"1px solid var(--accent)30", borderRadius:12, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:14 }}>Link New Content</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:11.5, color:"var(--text-dim)", marginBottom:5, fontWeight:600 }}>Target Type</div>
                  <select value={addTargetType} onChange={e => { setAddTargetType(e.target.value); setAddTargetId(""); }} style={selectStyle}>
                    {Object.entries(TYPE_META).filter(([t]) => t !== sourceType).map(([t, m]) => (
                      <option key={t} value={t}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:11.5, color:"var(--text-dim)", marginBottom:5, fontWeight:600 }}>Content Item</div>
                  <select value={addTargetId} onChange={e => setAddTargetId(e.target.value)} style={selectStyle}>
                    <option value="">Select…</option>
                    {(catalog[addTargetType] || []).map(item => {
                      const meta = TYPE_META[addTargetType];
                      const name = item[meta.nameKey] || item.title || item.name;
                      return <option key={item._id} value={item._id}>{name}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:11.5, color:"var(--text-dim)", marginBottom:5, fontWeight:600 }}>Relation Type</div>
                  <select value={addRelType} onChange={e => setAddRelType(e.target.value)} style={selectStyle}>
                    {Object.entries(RELATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              {addError && <div style={{ fontSize:12.5, color:"#f87171", marginBottom:10 }}>⚠ {addError}</div>}
              <button onClick={handleAdd} disabled={!addTargetId || adding}
                style={{ padding:"9px 20px", borderRadius:8, background: addTargetId && !adding ? "var(--accent)" : "var(--border2)", border:"none", color: addTargetId && !adding ? "#09090b" : "var(--text-dim)", fontSize:13, fontWeight:700, cursor: addTargetId && !adding ? "pointer" : "not-allowed" }}>
                {adding ? "Linking…" : "Add Relation"}
              </button>
            </div>
          )}

          {/* Relations list */}
          <div style={{ background:"var(--border)", border:"1px solid var(--border2)", borderRadius:12, padding:"18px 20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>Linked Content</span>
              {!loadingRels && <span style={{ fontSize:12, color:"var(--text-dim)", background:"var(--border2)", padding:"2px 9px", borderRadius:999 }}>{relations.length}</span>}
            </div>

            {loadingRels && (
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:16, color:"var(--text-dim)", fontSize:13 }}>
                <div style={{ width:16, height:16, border:"2px solid var(--border2)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                Loading relations…
              </div>
            )}

            {!loadingRels && !relations.length && (
              <div style={{ textAlign:"center", padding:"32px 20px" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                  <Icon name="link" size={18} color="var(--text-dim)" />
                </div>
                <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text-muted)", marginBottom:4 }}>No linked content yet</div>
                {isAdmin
                  ? <div style={{ fontSize:12.5, color:"var(--text-dim)" }}>Use "Link Content" above to connect related assets</div>
                  : <div style={{ fontSize:12.5, color:"var(--text-dim)" }}>No related content has been linked by an admin</div>
                }
              </div>
            )}

            {!loadingRels && relations.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {relations.map(rel => (
                  <RelationRow key={rel._id} rel={rel} isAdmin={isAdmin} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
