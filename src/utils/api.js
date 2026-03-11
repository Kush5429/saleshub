/**
 * api.js — Frontend API client
 *
 * All functions talk to the Vercel serverless API routes.
 * Base URL is inferred from the current origin in production,
 * or from VITE_API_BASE_URL in development (.env.local).
 */

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request(path, options = {}) {
  const url = `${BASE}/api/${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    const message = json?.error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return json.data;
}

// ── Generic CRUD factory ───────────────────────────────────────────────
function makeCrud(endpoint) {
  return {
    getAll:  ()           => request(endpoint),
    create:  (body)       => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
    update:  (id, body)   => request(`${endpoint}?id=${id}`, { method: "PUT",  body: JSON.stringify(body) }),
    remove:  (id)         => request(`${endpoint}?id=${id}`, { method: "DELETE" }),
  };
}

// ── Named exports per module ──────────────────────────────────────────
export const docsApi     = makeCrud("docs");
export const pricingApi  = makeCrud("pricing");
export const addonsApi   = makeCrud("addons");
export const videosApi   = makeCrud("videos");
export const resourcesApi= makeCrud("resources");
export const featuresApi = makeCrud("features");

// ── File upload ────────────────────────────────────────────────────────
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE}/api/upload`, { method: "POST", body: formData });
  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? "Upload failed");
  }

  return json.data; // { url, publicId, resourceType, format, bytes }
}
