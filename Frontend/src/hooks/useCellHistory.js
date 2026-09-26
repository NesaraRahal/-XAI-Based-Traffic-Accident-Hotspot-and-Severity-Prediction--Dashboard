import { fetchCellDetails } from "../api/cells";
import { useAsync } from "./useAsync";

// Cache per cell+month so stepping through months doesn't refetch.
const cache = new Map();

async function loadHistory(h3Cell, months) {
  const results = await Promise.allSettled(
    months.map((m) => {
      const key = `${h3Cell}|${m}`;
      if (!cache.has(key)) {
        cache.set(
          key,
          fetchCellDetails(h3Cell, m).catch((err) => {
            cache.delete(key);
            throw err;
          })
        );
      }
      return cache.get(key);
    })
  );
  return months.map((m, i) => {
    const r = results[i];
    if (r.status !== "fulfilled" || !r.value) {
      return { month: m, probability: null, predicted: null, accidents: null, observedHotspot: null };
    }
    const d = r.value;
    return {
      month: m,
      probability: d.hotspot?.probability ?? null,
      predicted: d.hotspot?.predicted ?? null,
      threshold: d.hotspot?.threshold ?? null,
      accidents: d.observed?.accident_count ?? null,
      observedHotspot: d.observed?.is_hotspot ?? null,
    };
  });
}

/** Hotspot probability + observed accidents for one cell across all months. */
export function useCellHistory(h3Cell, months) {
  const { data, loading, error, fresh } = useAsync(
    loadHistory,
    [h3Cell, months],
    Boolean(h3Cell && months && months.length > 1)
  );
  return { history: fresh ? data : null, loading, error };
}
