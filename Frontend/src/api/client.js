import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  // 90s: a free Render backend sleeps when idle and takes about a minute to wake up.
  timeout: 90000,
  headers: { "Content-Type": "application/json" },
});
