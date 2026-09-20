import { useEffect, useState } from "react";
import { fetchMonths } from "../api/cells";

export function useMonths() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMonths()
      .then((data) => { if (!cancelled) setMonths(data); })
      .catch(() => { if (!cancelled) setMonths([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { months, loading };
}