import { useCallback, useEffect, useState } from "react";

/**
 * Keeps a few string values in the URL query (?month=…&division=…&cell=…)
 * so a view can be bookmarked, refreshed or shared.
 */
export function useUrlState(keys) {
  const [values, setValues] = useState(() => readFromUrl(keys));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const k of keys) {
      if (values[k]) params.set(k, values[k]);
      else params.delete(k);
    }
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", next);
    }
  }, [keys, values]);

  const set = useCallback((key, value) => {
    setValues((v) => (v[key] === (value || null) ? v : { ...v, [key]: value || null }));
  }, []);

  return [values, set];
}

function readFromUrl(keys) {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(keys.map((k) => [k, params.get(k)]));
}
