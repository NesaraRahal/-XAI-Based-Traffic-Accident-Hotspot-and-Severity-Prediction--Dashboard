import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, login as apiLogin, signup as apiSignup } from "../api/auth";
import { getAuthToken, setAuthToken, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);
const NOTICE_KEY = "dashboard.auth.notice";

/** Drop the session and reload, so no data from the previous session stays in memory. */
function resetPage(notice) {
  setAuthToken(null);
  try {
    if (notice) window.sessionStorage.setItem(NOTICE_KEY, notice);
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.search = "";
  window.location.replace(url.toString());
}

function takeNotice() {
  try {
    const n = window.sessionStorage.getItem(NOTICE_KEY);
    window.sessionStorage.removeItem(NOTICE_KEY);
    return n;
  } catch {
    return null;
  }
}

// Read once at load (a useState initializer may run twice in StrictMode).
const INITIAL_NOTICE = takeNotice();

export function AuthProvider({ children }) {
  // "checking" while a saved token is being verified, then "signedIn" or "signedOut".
  const [state, setState] = useState(() => ({
    status: getAuthToken() ? "checking" : "signedOut",
    user: null,
    error: null, // connection problem while verifying a saved token
    notice: INITIAL_NOTICE, // message to show on the sign-in page
    attempt: 0,
  }));

  const signOut = useCallback(() => resetPage(null), []);

  useEffect(() => {
    setUnauthorizedHandler(() => resetPage("Your session has ended. Please sign in again."));
    return () => setUnauthorizedHandler(null);
  }, []);

  // Verify a saved token on first load.
  useEffect(() => {
    if (state.status !== "checking") return undefined;
    let cancelled = false;
    fetchMe()
      .then((user) => !cancelled && setState((s) => ({ ...s, status: "signedIn", user, error: null, notice: null })))
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 401) {
          setAuthToken(null);
          setState((s) => ({ ...s, status: "signedOut", user: null, error: null }));
        } else {
          setState((s) => ({ ...s, error: err }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [state.status, state.attempt]);

  const retryCheck = useCallback(() => setState((s) => ({ ...s, error: null, status: "checking", attempt: s.attempt + 1 })), []);

  const signIn = useCallback(async (email, password) => {
    const res = await apiLogin(email, password);
    setAuthToken(res.access_token);
    setState((s) => ({ ...s, status: "signedIn", user: res.user, error: null, notice: null }));
    return res;
  }, []);

  const signUp = useCallback(async (form) => {
    const res = await apiSignup(form);
    if (res.access_token) {
      setAuthToken(res.access_token);
      setState((s) => ({ ...s, status: "signedIn", user: res.user, error: null, notice: null }));
    }
    return res;
  }, []);

  const value = useMemo(
    () => ({
      status: state.status,
      user: state.user,
      error: state.error,
      notice: state.notice,
      isAdmin: state.user?.role === "admin",
      signIn,
      signUp,
      signOut,
      retryCheck,
    }),
    [state, signIn, signUp, signOut, retryCheck]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
