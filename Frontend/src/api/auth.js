import { api } from "./client";

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { access_token, user }
}

export async function signup({ name, email, password, division }) {
  const { data } = await api.post("/auth/signup", { name, email, password, division });
  return data; // { access_token | null, user, message }
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function fetchSignupDivisions() {
  const { data } = await api.get("/auth/divisions");
  return data;
}

// ── Admin ─────────────────────────────────────────────────────────────
export async function fetchUsers() {
  const { data } = await api.get("/auth/users");
  return data;
}

export async function updateUser(id, changes) {
  const { data } = await api.patch(`/auth/users/${id}`, changes);
  return data;
}

export async function deleteUser(id) {
  await api.delete(`/auth/users/${id}`);
}
