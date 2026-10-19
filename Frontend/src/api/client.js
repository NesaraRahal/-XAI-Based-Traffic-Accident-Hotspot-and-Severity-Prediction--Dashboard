import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  // 90s: a free Render backend sleeps when idle and takes about a minute to wake up.
  timeout: 90000,
  headers: { "Content-Type": "application/json" },
});

// ── Login token ───────────────────────────────────────────────────────
const TOKEN_KEY = "dashboard.auth.token";
let authToken = readStoredToken();
let onUnauthorized = null;

function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return authToken;
}

export function setAuthToken(token) {
  authToken = token || null;
  try {
    if (authToken) window.localStorage.setItem(TOKEN_KEY, authToken);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable (private mode) – keep the token in memory only */
  }
}

/** Called when the API says the session is no longer valid (expired, disabled…). */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith("/auth/login") || err.config?.url?.startsWith("/auth/signup");
    if (err.response?.status === 401 && authToken && !isAuthCall && onUnauthorized) onUnauthorized();
    return Promise.reject(err);
  }
);
