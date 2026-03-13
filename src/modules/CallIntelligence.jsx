import { useState } from "react";
import { analyzeTranscript } from "../utils/api";
import Icon from "../components/Icon";

const EXAMPLE = `Client is a mid-sized e-commerce company, about 50k orders per month.
They were really interested in broadcast automation for cart abandonment.
The main concern they raised was around WhatsApp spam policies and whether bulk messaging is allowed.
They also asked about the AI chatbot builder and whether it can handle product FAQs.
Pricing-wise they pushed back on the Pro plan cost, asking if there's a quarterly option.
Decision maker is the CTO — follow up next Thursday.`;

function TagList({ items, color, label }) {
  if (!items?.length) return null;
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{label}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
        {items.map((item, i) => (
          <span key={i} style={{ padding:"5px 12px", borderRadius:999, background: color + "12", border:`1px solid ${color}30`, color, fontSize:12.5, fontWeight:500, lineHeight:1.3 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function InsightCard({ icon, label, color, children }) {
  return (
    <div style={{ background:"var(--border)", border:`1px solid ${color}25`, borderRadius:12, padding:"18px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{ width:28, height:28, borderRadius:8, background: color + "15", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name={icon} size={13} color={color} />
        </div>
        <span style={{ fontWeight:700, fontSize:13, color }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function CallIntelligence() {
  const [transcript, setTranscript] = useState("");
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  async function handleAnalyze() {
    if (!transcript.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeTranscript(transcript);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLoadExample() {
    setTranscript(EXAMPLE);
    setResult(null);
    setError(null);
  }

  const hasResult = !!result;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"var(--accent-purple)15", border:"1px solid var(--accent-purple)30", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="users" size={18} color="var(--accent-purple)" />
          </div>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:"var(--text)", margin:0, fontFamily:"Syne, sans-serif" }}>Call Intelligence</h1>
            <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:1 }}>Paste a call transcript or meeting notes to extract structured deal insights</div>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: hasResult ? "1fr 1fr" : "1fr", gap:24, alignItems:"start" }}>

        {/* Input panel */}
        <div>
          <div style={{ background:"var(--border)", border:"1px solid var(--border2)", borderRadius:14, padding:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>Transcript / Notes</span>
              <button onClick={handleLoadExample}
                style={{ fontSize:11.5, color:"var(--accent-blue)", background:"none", border:"1px solid var(--accent-blue)30", padding:"4px 10px", borderRadius:6, cursor:"pointer" }}>
                Load Example
              </button>
            </div>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder={"Paste your call transcript, meeting notes, or conversation summary here…\n\nExample: Client is interested in bulk messaging. They raised concerns about compliance…"}
              style={{ width:"100%", minHeight:240, background:"#0d0d10", border:"1px solid var(--border2)", borderRadius:10, padding:"14px", color:"var(--text)", fontSize:13.5, lineHeight:1.7, resize:"vertical", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
            />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
              <span style={{ fontSize:11.5, color:"var(--text-dim)" }}>
                {transcript.split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                onClick={handleAnalyze}
                disabled={!transcript.trim() || loading}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:9, background: transcript.trim() && !loading ? "var(--accent)" : "var(--border2)", border:"none", color: transcript.trim() && !loading ? "#09090b" : "var(--text-dim)", fontSize:13.5, fontWeight:700, cursor: transcript.trim() && !loading ? "pointer" : "not-allowed", transition:"all 0.15s" }}
              >
                {loading
                  ? <><div style={{ width:14, height:14, border:"2px solid #09090b40", borderTopColor:"#09090b", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /> Analyzing…</>
                  : <><Icon name="zap" size={14} color={transcript.trim() ? "#09090b" : "var(--text-dim)"} /> Analyze</>
                }
              </button>
            </div>
          </div>

          {error && (
            <div style={{ marginTop:12, padding:"12px 16px", borderRadius:10, background:"#ff000015", border:"1px solid #ff000040", color:"#f87171", fontSize:13 }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Results panel */}
        {hasResult && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--accent-green)", boxShadow:"0 0 8px var(--accent-green)" }} />
              <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>Analysis Complete</span>
            </div>

            <InsightCard icon="features" label="Features Mentioned" color="var(--accent-purple)">
              {result.featuresMentioned?.length
                ? <TagList items={result.featuresMentioned} color="var(--accent-purple)" label="" />
                : <span style={{ fontSize:12.5, color:"var(--text-dim)" }}>No specific features detected</span>
              }
            </InsightCard>

            <InsightCard icon="close" label="Customer Objections" color="var(--accent-pink)">
              {result.objections?.length
                ? <TagList items={result.objections} color="var(--accent-pink)" label="" />
                : <span style={{ fontSize:12.5, color:"var(--text-dim)" }}>No objections detected</span>
              }
            </InsightCard>

            <InsightCard icon="check" label="Customer Interests" color="var(--accent-green)">
              {result.interests?.length
                ? <TagList items={result.interests} color="var(--accent-green)" label="" />
                : <span style={{ fontSize:12.5, color:"var(--text-dim)" }}>No interests detected</span>
              }
            </InsightCard>

            <InsightCard icon="play" label="Suggested Next Steps" color="var(--accent)">
              {result.nextSteps?.length
                ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {result.nextSteps.map((step, i) => (
                      <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                        <div style={{ width:20, height:20, borderRadius:6, background:"var(--accent)20", border:"1px solid var(--accent)30", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                          <span style={{ fontSize:10, fontWeight:800, color:"var(--accent)" }}>{i+1}</span>
                        </div>
                        <span style={{ fontSize:13, color:"var(--text)", lineHeight:1.55 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                )
                : <span style={{ fontSize:12.5, color:"var(--text-dim)" }}>No next steps extracted</span>
              }
            </InsightCard>
          </div>
        )}
      </div>
    </div>
  );
}
