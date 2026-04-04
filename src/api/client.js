// Empty string = same origin (nginx proxies /api/* to backend in Docker)
// "http://localhost:4000" = direct backend when running without Docker
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const getToken = () => localStorage.getItem("moi_token");

const request = async (method, path, body) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (creds) => api.post("/api/auth/login", creds),
  me: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const usersApi = {
  lookup: (phone) => api.get(`/api/users/lookup?phone=${encodeURIComponent(phone)}`),
  create: (data) => api.post("/api/users", data),
  list: (role) => api.get(`/api/users${role ? `?role=${role}` : ""}`),
  update: (id, data) => api.patch(`/api/users/${id}`, data),
};

// ─── Admin ─────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get("/api/admin/stats"),
  affiliates: () => api.get("/api/admin/affiliates"),
  createAffiliate: (data) => api.post("/api/admin/affiliates", data),
  updateAffiliate: (id, data) => api.patch(`/api/admin/affiliates/${id}`, data),
  events: () => api.get("/api/admin/events"),
};

// ─── Affiliate ─────────────────────────────────────────────────────────────
export const affiliateApi = {
  events: () => api.get("/api/affiliate/events"),
  createEvent: (data) => api.post("/api/affiliate/events", data),
  updateEvent: (id, data) => api.patch(`/api/affiliate/events/${id}`, data),
  toggleWriterAccess: (id, enabled) =>
    api.patch(`/api/affiliate/events/${id}/writer-access`, { enabled }),
  writers: (eventId) => api.get(`/api/affiliate/events/${eventId}/writers`),
  assignWriter: (eventId, data) => api.post(`/api/affiliate/events/${eventId}/writers`, data),
  updateWriter: (eventId, writerId, data) =>
    api.patch(`/api/affiliate/events/${eventId}/writers/${writerId}`, data),
  removeWriter: (eventId, writerId) =>
    api.delete(`/api/affiliate/events/${eventId}/writers/${writerId}`),
};

// ─── Moi ───────────────────────────────────────────────────────────────────
export const moiApi = {
  list: (eventId) => api.get(`/api/events/${eventId}/moi`),
  create: (eventId, data) => api.post(`/api/events/${eventId}/moi`, data),
  update: (eventId, entryId, data) => api.patch(`/api/events/${eventId}/moi/${entryId}`, data),
  void: (eventId, entryId) => api.patch(`/api/events/${eventId}/moi/${entryId}/void`),
};

// ─── Reports ───────────────────────────────────────────────────────────────
export const reportsApi = {
  settlement: (eventId) => api.get(`/api/events/${eventId}/settlement`),
  report: (eventId) => api.get(`/api/events/${eventId}/report`),
};

// ─── Writer ────────────────────────────────────────────────────────────────
export const writerApi = {
  events: () => api.get("/api/writer/events"),
  event: (eventId) => api.get(`/api/writer/events/${eventId}`),
};
