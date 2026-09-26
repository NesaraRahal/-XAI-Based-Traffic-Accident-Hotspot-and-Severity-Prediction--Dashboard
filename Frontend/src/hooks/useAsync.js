import { useCallback, useEffect, useState } from "react";

/**
 * Small data-fetching helper.
 * - `fetcher` must be a stable (module-level) function.
 * - `args` are serialised into a key; a new key triggers a new request.
 * - Previous data is kept while a new request is in flight, so the UI
 *   (e.g. the map) can stay mounted instead of flashing a spinner.
 */
export function useAsync(fetcher, args, enabled = true) {
  const [state, setState] = useState({ key: null, data: undefined, error: null });
  const [nonce, setNonce] = useState(0);

  const argsKey = JSON.stringify(args);
  const requestKey = enabled ? `${argsKey}#${nonce}` : null;

  useEffect(() => {
    if (!requestKey) return undefined;
    let cancelled = false;
    const parsedArgs = JSON.parse(argsKey);
    fetcher(...parsedArgs)
      .then((data) => {
        if (!cancelled) setState({ key: requestKey, data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState((s) => ({ key: requestKey, data: s.data, error }));
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher, argsKey, requestKey]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const settled = requestKey !== null && state.key === requestKey;
  return {
    data: state.data,
    error: settled ? state.error : null,
    loading: enabled && !settled,
    /** true when `data` belongs to the current arguments */
    fresh: settled && !state.error,
    reload,
  };
}
