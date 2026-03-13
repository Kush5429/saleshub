const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function getToken() {
  return localStorage.getItem("dt_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const url   = `${BASE}/api/${path}`;
  const res   = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const message = json?.error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json.data;
}

function makeCrud(endpoint) {
  return {
    getAll: ()         => request(endpoint),
    create: (body)     => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) => request(`${endpoint}?id=${id}`, { method: "PUT",    body: JSON.stringify(body) }),
    remove: (id)       => request(`${endpoint}?id=${id}`, { method: "DELETE" }),
  };
}

export const docsApi      = makeCrud("docs");
export const pricingApi   = makeCrud("pricing");
export const addonsApi    = makeCrud("addons");
export const videosApi    = makeCrud("videos");
export const resourcesApi = makeCrud("resources");
export const featuresApi  = makeCrud("features");

// Search
export const searchApi = (q) => request(`search?q=${encodeURIComponent(q)}`);

// Intelligence dashboard
export const getIntelligence = () => request("intelligence");

// Feature metrics
export const getFeatureMetrics = () => request("feature-metrics");
export const trackFeatureView    = (featureId, featureName) => request("feature-metrics/view",    { method: "POST", body: JSON.stringify({ featureId, featureName }) });
export const trackFeatureMention = (featureId, featureName) => request("feature-metrics/mention", { method: "POST", body: JSON.stringify({ featureId, featureName }) });
export const trackFeatureDemo    = (featureId, featureName) => request("feature-metrics/demo",    { method: "POST", body: JSON.stringify({ featureId, featureName }) });

// File upload
export async function uploadFile(file) {
  const token    = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const res  = await fetch(`${BASE}/api/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.error ?? "Upload failed");
  return json.data;
}

// ── Phase 4: AI Playbook ─────────────────────────────────────
export const askPlaybook     = (question) => request("ai-playbook",  { method: "POST", body: JSON.stringify({ question }) });
export const getAIHistory    = ()          => request("ai-queries");

// ── Phase 4: Call Intelligence ───────────────────────────────
export const analyzeTranscript = (transcript) => request("call-intelligence", { method: "POST", body: JSON.stringify({ transcript }) });
export const getDealInsights   = ()             => request("deal-insights");

// ── Phase 4: Content Relations ───────────────────────────────
export const getRelations    = (sourceType, sourceId) => request(`relations?sourceType=${sourceType}&sourceId=${sourceId}`);
export const createRelation  = (body)  => request("relations",        { method: "POST",   body: JSON.stringify(body) });
export const deleteRelation  = (id)    => request(`relations?id=${id}`, { method: "DELETE" });
