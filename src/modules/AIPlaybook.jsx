import { useState, useRef, useEffect } from "react";
import { askPlaybook } from "../utils/api";
import Icon from "../components/Icon";

const TYPE_COLORS = {
  docs:     "var(--accent-blue)",
  features: "var(--accent-purple)",
  videos:   "var(--accent-pink)",
  resources:"var(--accent-green)",
  pricing:  "var(--accent)",
};

const TYPE_ICONS = {
  docs:     "docs",
  features: "features",
  videos:   "video",
  resources:"resources",
  pricing:  "pricing",
};

function SourcePill({ type, name }) {
  const color = TYPE_COLORS[type] || "var(--text-muted)";
  const icon  = TYPE_ICONS[type]  || "docs";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999, background: color + "15", border:`1px solid ${color}30`, fontSize:11.5, color, fontWeight:600, whiteSpace:"nowrap" }}>
      <Icon name={icon} size={10} color={color} />
      {name}
    </span>
  );
}

function SourcesPanel({ sources }) {
  const allSources = [
    ...(sources.features || []).map(f => ({ type:"features", name: f.featureName })),
    ...(sources.docs     || []).map(d => ({ type:"docs",     name: d.title })),
    ...(sources.videos   || []).map(v => ({ type:"videos",   name: v.title })),
    ...(sources.pricing  || []).map(p => ({ type:"pricing",  name: p.name })),
    ...(sources.resources|| []).map(r => ({ type:"resources",name: r.title })),
  ];
  if (!allSources.length) return null;
  return (
    <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid var(--border)" }}>
      <div style={{ fontSize:11, color:"var(--text-dim)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Sources used</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {allSources.map((s,i) => <SourcePill key={i} type={s.type} name={s.name} />)}
      </div>
    </div>
  );
}

function MarkdownText({ text }) {
  // Simple inline markdown: **bold**, `code`, bullet lines
  const lines = text.split("\n");
  return (
    <div style={{ fontSize:14, lineHeight:1.75, color:"var(--text)" }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height:8 }} />;

        // Heading
        if (trimmed.startsWith("### ")) return <div key={i} style={{ fontWeight:700, fontSize:15, color:"var(--text)", marginTop:14, marginBottom:4 }}>{trimmed.slice(4)}</div>;
        if (trimmed.startsWith("## "))  return <div key={i} style={{ fontWeight:700, fontSize:16, color:"var(--text)", marginTop:16, marginBottom:6 }}>{trimmed.slice(3)}</div>;
        if (trimmed.startsWith("# "))   return <div key={i} style={{ fontWeight:700, fontSize:17, color:"var(--text)", marginTop:18, marginBottom:8 }}>{trimmed.slice(2)}</div>;

        // Bullet
        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.match(/^\d+\.\s/);
        const content  = isBullet ? trimmed.replace(/^[-•]\s|^\d+\.\s/, "") : trimmed;

        // Inline bold + code
        const parts = [];
        const pattern = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
        let last = 0, m;
        while ((m = pattern.exec(content)) !== null) {
          if (m.index > last) parts.push(<span key={last}>{content.slice(last, m.index)}</span>);
          if (m[2]) parts.push(<strong key={m.index} style={{ color:"var(--text)", fontWeight:700 }}>{m[2]}</strong>);
          if (m[3]) parts.push(<code key={m.index} style={{ background:"var(--border2)", padding:"1px 5px", borderRadius:3, fontSize:12.5, color:"var(--accent-green)", fontFamily:"monospace" }}>{m[3]}</code>);
          last = m.index + m[0].length;
        }
        if (last < content.length) parts.push(<span key={last}>{content.slice(last)}</span>);
        const rendered = parts.length ? parts : content;

        if (isBullet) return (
          <div key={i} style={{ display:"flex", gap:8, marginBottom:3 }}>
            <span style={{ color:"var(--accent)", marginTop:2, flexShrink:0 }}>›</span>
            <span>{rendered}</span>
          </div>
        );
        return <div key={i} style={{ marginBottom:2 }}>{rendered}</div>;
      })}
    </div>
  );
}

const SUGGESTED = [
  "How do I pitch WhatsApp automation to an e-commerce brand?",
  "What's included in the Pro plan vs Starter?",
  "Which add-ons should I recommend for a large enterprise?",
  "How does the AI chatbot builder work?",
  "What compliance documents should I share for Meta GreenTick?",
];

export default function AIPlaybook() {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  async function handleAsk(q) {
    const question = (q || input).trim();
    if (!question || loading) return;
    setInput("");
    setError(null);
    setMessages(prev => [...prev, { role:"user", text: question }]);
    setLoading(true);
    try {
      const { answer, sources } = await askPlaybook(question);
      setMessages(prev => [...prev, { role:"assistant", text: answer, sources }]);
    } catch (e) {
      setError(e.message);
      setMessages(prev => [...prev, { role:"error", text: e.message }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)", minHeight:500 }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"var(--accent)15", border:"1px solid var(--accent)30", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="zap" size={18} color="var(--accent)" />
          </div>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:"var(--text)", margin:0, fontFamily:"Syne, sans-serif" }}>AI Playbook</h1>
            <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:1 }}>Ask anything about DoubleTick — powered by your knowledge base</div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex:1, overflowY:"auto", paddingRight:4, marginBottom:16 }}>

        {/* Empty state + suggestions */}
        {isEmpty && (
          <div style={{ textAlign:"center", paddingTop:40 }}>
            <div style={{ width:64, height:64, borderRadius:20, background:"var(--accent)10", border:"1px solid var(--accent)25", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <Icon name="zap" size={28} color="var(--accent)" />
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:"var(--text)", marginBottom:8 }}>Your AI Sales Assistant</div>
            <div style={{ fontSize:13.5, color:"var(--text-muted)", marginBottom:32, maxWidth:480, margin:"0 auto 32px" }}>
              Ask about pricing, features, objection handling, demo strategy — answers grounded in your internal docs.
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", maxWidth:640, margin:"0 auto" }}>
              {SUGGESTED.map((s, i) => (
                <button key={i} onClick={() => handleAsk(s)}
                  style={{ padding:"9px 14px", borderRadius:8, background:"var(--border)", border:"1px solid var(--border2)", color:"var(--text-muted)", fontSize:12.5, cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="var(--accent)40"; e.currentTarget.style.color="var(--text)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.color="var(--text-muted)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom:20, display:"flex", flexDirection:"column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "user" && (
              <div style={{ maxWidth:"72%", padding:"12px 16px", borderRadius:"14px 14px 4px 14px", background:"var(--accent)", color:"#09090b", fontSize:14, fontWeight:600, lineHeight:1.5 }}>
                {msg.text}
              </div>
            )}
            {msg.role === "assistant" && (
              <div style={{ maxWidth:"88%", padding:"18px 20px", borderRadius:"4px 14px 14px 14px", background:"var(--border)", border:"1px solid var(--border2)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ width:22, height:22, borderRadius:6, background:"var(--accent)20", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon name="zap" size={11} color="var(--accent)" />
                  </div>
                  <span style={{ fontSize:11.5, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.07em" }}>AI Playbook</span>
                </div>
                <MarkdownText text={msg.text} />
                {msg.sources && <SourcesPanel sources={msg.sources} />}
              </div>
            )}
            {msg.role === "error" && (
              <div style={{ maxWidth:"88%", padding:"12px 16px", borderRadius:10, background:"#ff000015", border:"1px solid #ff000040", color:"#f87171", fontSize:13.5 }}>
                ⚠ {msg.text}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display:"flex", alignItems:"flex-start", marginBottom:20 }}>
            <div style={{ padding:"16px 20px", borderRadius:"4px 14px 14px 14px", background:"var(--border)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", gap:4 }}>
                {[0,1,2].map(n => (
                  <div key={n} style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent)", animation:`bounce 1s ${n*0.15}s infinite ease-in-out` }} />
                ))}
              </div>
              <span style={{ fontSize:13, color:"var(--text-muted)" }}>Searching knowledge base…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ position:"relative", flexShrink:0 }}>
        <div style={{ display:"flex", gap:10, padding:"14px 16px", background:"var(--border)", border:"1px solid var(--border2)", borderRadius:14, alignItems:"flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            placeholder="Ask about pricing, features, objection handling, demo strategy…"
            rows={1}
            style={{ flex:1, background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:14, resize:"none", lineHeight:1.6, maxHeight:120, overflowY:"auto", fontFamily:"inherit" }}
          />
          <button
            onClick={() => handleAsk()}
            disabled={!input.trim() || loading}
            style={{ width:38, height:38, borderRadius:10, background: (input.trim() && !loading) ? "var(--accent)" : "var(--border2)", border:"none", cursor: (input.trim() && !loading) ? "pointer" : "not-allowed", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}
          >
            <Icon name="play" size={14} color={ (input.trim() && !loading) ? "#09090b" : "var(--text-dim)" } />
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:"var(--text-dim)" }}>
          Answers are grounded in your internal knowledge base · Press Enter to send
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
                    }
