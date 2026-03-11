import { useState, useEffect, useCallback } from "react";

/**
 * useApiData
 *
 * Replaces usePersistentData. Fetches data from a backend API function,
 * and exposes create / update / remove helpers that call the API
 * then refresh local state — so the UI stays in sync without full-page reloads.
 *
 * @param {object} api   — An object with { getAll, create, update, remove }
 * @param {Array}  seed  — Fallback shown while loading (not persisted)
 */
export function useApiData(api, seed = []) {
  const [data,    setData]    = useState(seed);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAll();
      setData(result);
    } catch (err) {
      console.error("[useApiData] fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const create = useCallback(async (body) => {
    const item = await api.create(body);
    setData(prev => [item, ...prev]);
    return item;
  }, [api]);

  const update = useCallback(async (id, body) => {
    const item = await api.update(id, body);
    setData(prev => prev.map(d => (d._id === id ? item : d)));
    return item;
  }, [api]);

  const remove = useCallback(async (id) => {
    await api.remove(id);
    setData(prev => prev.filter(d => d._id !== id));
  }, [api]);

  return { data, loading, error, refetch: fetch_, create, update, remove };
}
