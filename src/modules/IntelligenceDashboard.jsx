import { useState, useEffect } from "react";
import { getIntelligence } from "../utils/api";
import { Card, StatCard, Badge, SectionHeader } from "../components/UI";
import Icon from "../components/Icon";

const EVENT_COLORS = { view: "var(--accent)", open: "var(--accent-blue)", play: "var(--accent-purple)", click: "var(--accent-green)", demo_request: "var(--accent-pink)", mention: "var(--accent-orange)" };
const TYPE_LABELS  = { docs: "Docs", video: "Video", feature: "Feature", resource: "Resource", pricing: "Pricing" };

function TopContentRow({ item, rank, type }) {
  const accent = { docs: "var(--accent)", video: "var(--accent-purple)", feature: "var(--accent-pink)", resource: "var(--accent-green)", pricing: "var(--accent-blue)" }[type] || "var(--accent)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: accent + "15", border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: accent, fontSize: 10, fontWeight: 700 }}>#{rank}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.contentName || item.contentId}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div style={{ width: 60, height: 4, borderRadius: 2, background: "var(--border2)", overflow: "hidden" }}>
          <div style={{ height: "100%", background: accent, width: `${Math.min(100, (item.count / 10) * 100)}%`, borderRadius: 2 }} />
        </div>
        <span style={{ color: accent, fontSize: 12, fontWeight: 700, minWidth: 24, textAlign: "right" }}>{item.count}</span>
      </div>
    </div>
  );
}

export default function IntelligenceDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getIntelligence()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "var(--text-muted)", fontSize: 13, padding: 32 }}>Loading intelligence data…</div>;
  if (error)   return <div style={{ color: "#ff6b6b", fontSize: 13, padding: 32 }}>Error: {error}</div>;

  const { topContent, recentEvents, featureMetrics, totalEvents, eventBreakdown } = data;

  return (
    <div className="animate-in">
      <SectionHeader
        title="Sales Intelligence"
        subtitle="Engagement analytics, content performance, and feature adoption metrics."
      />

      {/* Top-line stats */}
      <div className="grid-cols-3" style={{ marginBottom: 28 }}>
        <StatCard label="Total Engagements"   value={totalEvents}                               icon="zap"      accent="var(--accent)" />
        <StatCard label="Features Tracked"    value={featureMetrics?.length || 0}               icon="features" accent="var(--accent-pink)" />
        <StatCard label="Recent Events (50)"  value={recentEvents?.length || 0}                 icon="tag"      accent="var(--accent-blue)" />
      </div>

      <div className="grid-2col" style={{ marginBottom: 24 }}>

        {/* Top Content by Type */}
        {Object.entries(topContent || {}).map(([type, items]) => {
          if (!items?.length) return null;
          const accent = { docs: "var(--accent)", video: "var(--accent-purple)", feature: "var(--accent-pink)", resource: "var(--accent-green)", pricing: "var(--accent-blue)" }[type] || "var(--accent)";
          return (
            <Card key={type} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />
                <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 13 }}>Top {TYPE_LABELS[type] || type}</span>
                <span style={{ marginLeft: "auto", color: "var(--text-dim)", fontSize: 11 }}>30 days</span>
              </div>
              {items.slice(0, 5).map((item, i) => (
                <TopContentRow key={i} item={item} rank={i + 1} type={type} />
              ))}
            </Card>
          );
        })}
      </div>

      <div className="grid-2col" style={{ marginBottom: 24 }}>

        {/* Event Type Breakdown */}
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13, marginBottom: 16 }}>Event Breakdown</div>
          {(eventBreakdown || []).map(item => {
            const color = EVENT_COLORS[item._id] || "var(--accent)";
            const pct   = totalEvents ? Math.round((item.count / totalEvents) * 100) : 0;
            return (
              <div key={item._id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "capitalize" }}>{item._id?.replace("_", " ")}</span>
                  <span style={{ color: color, fontSize: 12, fontWeight: 700 }}>{item.count} <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({pct}%)</span></span>
                </div>
                <div style={{ height: 4, background: "var(--border2)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: color, width: `${pct}%`, borderRadius: 2, transition: "width 0.6s ease" }} />
                </div>
              </div>
            );
          })}
          {!eventBreakdown?.length && <div style={{ color: "var(--text-dim)", fontSize: 13 }}>No events recorded yet.</div>}
        </Card>

        {/* Feature Adoption */}
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13, marginBottom: 16 }}>Feature Adoption</div>
          {(featureMetrics || []).slice(0, 6).map(fm => (
            <div key={fm._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--text)", fontSize: 12.5, fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fm.featureName || "Unknown"}</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>{fm.views}</div>
                  <div style={{ color: "var(--text-dim)", fontSize: 9.5, textTransform: "uppercase" }}>Views</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--accent-orange)", fontSize: 13, fontWeight: 700 }}>{fm.mentions}</div>
                  <div style={{ color: "var(--text-dim)", fontSize: 9.5, textTransform: "uppercase" }}>Mentions</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--accent-pink)", fontSize: 13, fontWeight: 700 }}>{fm.demoRequests}</div>
                  <div style={{ color: "var(--text-dim)", fontSize: 9.5, textTransform: "uppercase" }}>Demos</div>
                </div>
              </div>
            </div>
          ))}
          {!featureMetrics?.length && <div style={{ color: "var(--text-dim)", fontSize: 13 }}>No feature metrics yet. Views will appear as users navigate features.</div>}
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card style={{ padding: "18px 20px" }}>
        <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13, marginBottom: 16 }}>Recent Activity</div>
        {(recentEvents || []).slice(0, 15).map((ev, i) => {
          const color = EVENT_COLORS[ev.eventType] || "var(--accent)";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 14 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: color + "12", border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={ev.contentType === "video" ? "video" : ev.contentType === "feature" ? "features" : ev.contentType === "docs" ? "docs" : "resources"} size={11} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <Badge text={ev.eventType?.replace("_", " ")} color={color} />
                  {ev.contentName
                    ? <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 13 }}>{ev.contentName}</span>
                    : <span style={{ color: "var(--text-dim)", fontSize: 12.5, textTransform: "capitalize" }}>{ev.contentType}</span>
                  }
                </div>
              </div>
              <span style={{ color: "var(--text-dim)", fontSize: 11, flexShrink: 0 }}>
                {new Date(ev.timestamp).toLocaleDateString()}
              </span>
            </div>
          );
        })}
        {!recentEvents?.length && <div style={{ color: "var(--text-dim)", fontSize: 13 }}>No activity recorded yet.</div>}
      </Card>
    </div>
  );
}
