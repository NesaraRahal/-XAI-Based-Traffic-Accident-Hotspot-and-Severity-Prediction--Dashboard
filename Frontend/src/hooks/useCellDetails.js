import { useEffect, useState } from "react";
import { fetchCellDetails } from "../api/cells";

export function useCellDetails(h3Cell, yearMonth) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!h3Cell || !yearMonth) {
      setDetails(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCellDetails(h3Cell, yearMonth)
      .then((data) => { if (!cancelled) setDetails(data); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [h3Cell, yearMonth]);

  return { details, loading, error };
}