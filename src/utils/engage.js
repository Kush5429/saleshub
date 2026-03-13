/**
 * engage.js — fire-and-forget engagement event tracker
 * Never throws — failures are silent so they never break the UI.
 */

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function trackEvent({ contentType, contentId, eventType }) {
  try {
    const token = localStorage.getItem("dt_token");
    if (!token) return;
    await fetch(`${BASE}/api/engage`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ contentType, contentId, eventType }),
    });
  } catch {
    // silent — engagement tracking must never crash the app
  }
}

// Convenience wrappers
export const trackView        = (type, id)  => trackEvent({ contentType: type, contentId: id, eventType: "view" });
export const trackOpen        = (type, id)  => trackEvent({ contentType: type, contentId: id, eventType: "open" });
export const trackPlay        = (id)        => trackEvent({ contentType: "video",   contentId: id, eventType: "play" });
export const trackDemoRequest = (id)        => trackEvent({ contentType: "feature", contentId: id, eventType: "demo_request" });
