import { useState, useEffect } from "react";
import { loadData, saveData } from "../utils/storage";

// Bump this version string whenever you want to reset all users to fresh default data
const DATA_VERSION = "doubletick-v2";
const VERSION_KEY  = "sip:data_version";

/**
 * usePersistentData — loads from localStorage on mount, auto-saves on change.
 * If DATA_VERSION has changed, clears old data and reloads defaults.
 */
export function usePersistentData(key, defaultValue) {
  const [data, setDataRaw] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check version — if stale, wipe all keys and reload defaults
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== DATA_VERSION) {
      // Clear all sip: keys
      Object.keys(localStorage)
        .filter(k => k.startsWith("sip:"))
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem(VERSION_KEY, DATA_VERSION);
      setDataRaw(defaultValue);
      saveData(key, defaultValue);
      setLoaded(true);
      return;
    }

    loadData(key, defaultValue).then((stored) => {
      setDataRaw(stored);
      setLoaded(true);
    });
  }, [key]);

  const setData = (valueOrUpdater) => {
    setDataRaw((prev) => {
      const next =
        typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater;
      saveData(key, next);
      return next;
    });
  };

  return [data, setData, loaded];
}
