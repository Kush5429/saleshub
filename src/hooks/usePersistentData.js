import { useState, useEffect } from "react";
import { loadData, saveData } from "../utils/storage";

/**
 * usePersistentData — loads from localStorage on mount, auto-saves on change.
 */
export function usePersistentData(key, defaultValue) {
  const [data, setDataRaw] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
