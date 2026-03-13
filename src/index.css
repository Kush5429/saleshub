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
export function searchApi(q) {
  return request(`search?q=${encodeURIComponent(q)}`);
}

// Intelligence dashboard
export function getIntelligence() {
  return request("intelligence");
}

// Feature metrics
export function getFeatureMetrics() {
  return request("feature-metrics");
}

export function trackFeatureView(featureId, featureName) {
  return request("feature-metrics/view", {
    method: "POST",
    body: JSON.stringify({ featureId, featureName }),
  });
}

export function trackFeatureMention(featureId, featureName) {
  return request("feature-metrics/mention", {
    method: "POST",
    body: JSON.stringify({ featureId, featureName }),
  });
}

export function trackFeatureDemo(featureId, featureName) {
  return request("feature-metrics/demo", {
    method: "POST",
    body: JSON.stringify({ featureId, featureName }),
  });
}

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
