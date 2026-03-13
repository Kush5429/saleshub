import { useState, useEffect, useRef } from "react";
import { searchApi } from "../utils/api";
import { Card, Badge, EmptyState } from "../components/UI";
import Icon from "../components/Icon";

const TYPE_CONFIG = {
  docs:      { label: "Documentation", icon: "docs",      accent: "var(--accent)" },
  features:  { label: "Features",      icon: "features",  accent: "var(--accent-pink)" },
  videos:    { label: "Videos",        icon: "video",     accent: "var(--accent-purple)" },
  resources: { label: "Resources",     icon: "resources", accent: "var(--accent-green)" },
  pricing:   { label: "Pricing",       icon: "pricing",   accent: "var(--accent-blue)" },
};

function ResultItem({ type, item, onNav }) {
  const cfg    = TYPE_CONFIG[type];
  const title  = item.title || item.featureName || item.name || "Untitled";
  const desc   = item.description || item.useCase || item.icp || "";
  const badge  = item.category || item.releaseMonth || item.price || "";

  return (
    <Card
      style={{ display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", transition: "border-color 0.15s" }}
      onClick={() => onNav(type === "docs" ? "docs" : type === "features" ? "features" : type === "videos" ? "videos" : type === "resources" ? "resources" : "pricing")}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      <div style={{ width: 38, height: 38, borderRadius: "var(--radius-sm)", flexShrink: 0, background: cfg.accent + "12", border: `1px solid ${cfg.accent}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={cfg.icon} size={15} color={cfg.accent} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>{title}</span>
          {badge && <Badge text={badge} color={cfg.accent} />}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.5 }}>{desc?.slice(0, 120)}{desc?.length > 120 ? "…" : ""}</div>
      </div>
      <Icon name="external" size={13} color="var(--text-dim)" />
    </Card>
  );
}

export default function SearchResults({ query, onNav }) {
  const [results,  setResults]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults(null); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const data = await searchApi(query);
        setResults(data);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const totalResults = results
    ? Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: "var(--text)", fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
          Search Results
        </h2>
        {query && !loading && results && (
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: 0 }}>
            {totalResults} result{totalResults !== 1 ? "s" : ""} for <strong style={{ color: "var(--text)" }}>"{query}"</strong>
          </p>
        )}
      </div>

      {loading && (
        <div style={{ color: "var(--text-muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 14, height: 14, border: "2px solid var(--border2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          Searching…
        </div>
      )}

      {error && <p style={{ color: "#ff6b6b", fontSize: 13 }}>Error: {error}</p>}

      {!loading && results && totalResults === 0 && (
        <EmptyState icon="search" message={`No results found for "${query}". Try a different keyword.`} />
      )}

      {!loading && results && totalResults > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
            const items = results[type] || [];
            if (!items.length) return null;
            return (
              <div key={type}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.accent }} />
                  <span style={{ color: "var(--text-muted)", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{cfg.label}</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ color: "var(--text-dim)", fontSize: 11 }}>{items.length} result{items.length !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map(item => (
                    <ResultItem key={item._id} type={type} item={item} onNav={onNav} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!query && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-dim)" }}>
          <Icon name="search" size={36} color="var(--border2)" />
          <p style={{ marginTop: 16, fontSize: 14 }}>Start typing to search across all content</p>
        </div>
      )}
    </div>
  );
}
