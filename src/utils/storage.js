// localStorage-based persistence (works in standard browser environments)
export async function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

export async function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Storage save failed:", e);
  }
}

export function genId() {
  return Date.now() + Math.random().toString(36).slice(2, 6);
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}
