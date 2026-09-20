import { useEffect, useState } from "react";
import { fetchCells } from "../api/cells";

export function useCells(yearMonth, policeDivision) {
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!yearMonth) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCells({ yearMonth, policeDivision })
      .then((data) => { if (!cancelled) setCells(data); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [yearMonth, policeDivision]);

  return { cells, loading, error };
}