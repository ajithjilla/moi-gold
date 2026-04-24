const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const TOKEN_KEY = "moi_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const listeners = new Set();
export const onUnauthorized = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const emitUnauthorized = () => listeners.forEach((fn) => fn());

const request = async (method, path, body, { raw = false } = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined
      ? { body: body instanceof FormData ? body : JSON.stringify(body) }
      : {}),
  });

  if (raw) return res;

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      emitUnauthorized();
    }
    const message =
      (isJson && (data?.error || data?.message)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, isJson ? data?.details || data?.issues : null);
  }
  return data;
};

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path, body) => request("DELETE", path, body),
  raw: (method, path, body) => request(method, path, body, { raw: true }),
};

// ─── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (creds) => api.post("/api/auth/login", creds),
  me: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
  changePassword: (body) => api.patch("/api/auth/password", body),
  updateProfile: (body) => api.patch("/api/auth/profile", body),
};

// ─── Users ─────────────────────────────────────────────────
export const usersApi = {
  lookup: (phone) => api.get(`/api/users/lookup?phone=${encodeURIComponent(phone)}`),
  create: (data) => api.post("/api/users", data),
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/users${q ? `?${q}` : ""}`);
  },
  update: (id, data) => api.patch(`/api/users/${id}`, data),
  resetPassword: (id, password) => api.post(`/api/users/${id}/reset-password`, { password }),
};

// ─── Admin ─────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get("/api/admin/stats"),
  revenueSeries: () => api.get("/api/admin/revenue-series"),
  affiliates: () => api.get("/api/admin/affiliates"),
  createAffiliate: (data) => api.post("/api/admin/affiliates", data),
  updateAffiliate: (id, data) => api.patch(`/api/admin/affiliates/${id}`, data),
  deleteAffiliate: (id) => api.delete(`/api/admin/affiliates/${id}`),
  events: () => api.get("/api/admin/events"),
  settings: () => api.get("/api/admin/settings"),
  updateSettings: (settings) => api.patch("/api/admin/settings", { settings }),
  auditLog: (limit) => api.get(`/api/admin/audit${limit ? `?limit=${limit}` : ""}`),
};

// ─── Affiliate ─────────────────────────────────────────────
export const affiliateApi = {
  events: () => api.get("/api/affiliate/events"),
  event: (id) => api.get(`/api/affiliate/events/${id}`),
  createEvent: (data) => api.post("/api/affiliate/events", data),
  updateEvent: (id, data) => api.patch(`/api/affiliate/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/api/affiliate/events/${id}`),
  toggleWriterAccess: (id, enabled) =>
    api.patch(`/api/affiliate/events/${id}/writer-access`, { enabled }),
  toggleShare: (id, enabled) =>
    api.patch(`/api/affiliate/events/${id}/share`, { enabled }),
  regenerateShare: (id) => api.post(`/api/affiliate/events/${id}/regenerate-share`),
  writers: (eventId) => api.get(`/api/affiliate/events/${eventId}/writers`),
  assignWriter: (eventId, data) => api.post(`/api/affiliate/events/${eventId}/writers`, data),
  updateWriter: (eventId, writerId, data) =>
    api.patch(`/api/affiliate/events/${eventId}/writers/${writerId}`, data),
  removeWriter: (eventId, writerId) =>
    api.delete(`/api/affiliate/events/${eventId}/writers/${writerId}`),
};

// ─── Moi ───────────────────────────────────────────────────
export const moiApi = {
  list: (eventId) => api.get(`/api/events/${eventId}/moi`),
  create: (eventId, data) => api.post(`/api/events/${eventId}/moi`, data),
  update: (eventId, entryId, data) => api.patch(`/api/events/${eventId}/moi/${entryId}`, data),
  void: (eventId, entryId) => api.patch(`/api/events/${eventId}/moi/${entryId}/void`),
  restore: (eventId, entryId) => api.patch(`/api/events/${eventId}/moi/${entryId}/restore`),
  remove: (eventId, entryId) => api.delete(`/api/events/${eventId}/moi/${entryId}`),
};

// ─── Reports ───────────────────────────────────────────────
export const reportsApi = {
  settlement: (eventId) => api.get(`/api/events/${eventId}/settlement`),
  report: (eventId) => api.get(`/api/events/${eventId}/report`),
  exportCsvUrl: (eventId) => `${BASE_URL}/api/events/${eventId}/export.csv`,
  downloadCsv: async (eventId) => {
    const res = await api.raw("GET", `/api/events/${eventId}/export.csv`);
    if (!res.ok) throw new ApiError("Export failed", res.status);
    const blob = await res.blob();
    return blob;
  },
};

// ─── Writer ────────────────────────────────────────────────
export const writerApi = {
  events: () => api.get("/api/writer/events"),
  event: (id) => api.get(`/api/writer/events/${id}`),
  stats: (id) => api.get(`/api/writer/events/${id}/stats`),
};

// ─── Public ────────────────────────────────────────────────
export const publicApi = {
  plans: () => api.get("/api/public/plans"),
  settings: () => api.get("/api/public/settings"),
  sharedEvent: (token) => api.get(`/api/public/events/shared/${token}`),
};
