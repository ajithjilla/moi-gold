import type {
  AdminStats,
  Affiliate,
  AuditLog,
  AuthResponse,
  Event,
  EventReport,
  EventWriter,
  MoiEntry,
  MoiEntryPayload,
  PlanInfo,
  PublicSettings,
  RevenuePoint,
  Settlement,
  SharedEventResponse,
  User,
  ValidationIssue,
  WriterStats,
} from "../types/domain";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const TOKEN_KEY = "moi_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type UnauthorizedListener = () => void;
type RequestBody = object | FormData | undefined;
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

const listeners = new Set<UnauthorizedListener>();
export const onUnauthorized = (fn: UnauthorizedListener) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const emitUnauthorized = () => listeners.forEach((fn) => fn());

const request = async <T>(
  method: HttpMethod,
  path: string,
  body?: RequestBody,
  { raw = false }: { raw?: boolean } = {}
): Promise<T> => {
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

  if (raw) return res as T;

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data: unknown = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      emitUnauthorized();
    }
    const json = isJson && data && typeof data === "object" ? (data as Record<string, unknown>) : null;
    const message =
      (typeof json?.error === "string" && json.error) ||
      (typeof json?.message === "string" && json.message) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json?.details || json?.issues);
  }
  return data as T;
};

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: RequestBody) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: RequestBody) => request<T>("PATCH", path, body),
  delete: <T>(path: string, body?: RequestBody) => request<T>("DELETE", path, body),
  raw: (method: HttpMethod, path: string, body?: RequestBody) =>
    request<Response>(method, path, body, { raw: true }),
};

export interface LoginPayload {
  phone?: string;
  email?: string;
  password: string;
}

export interface CreateAffiliatePayload {
  name: string;
  phone: string;
  email?: string | null;
  password?: string;
  plan: string;
}

export type UpdateAffiliatePayload = Partial<Pick<Affiliate, "plan" | "status" | "notes">>;
export type UserUpdatePayload = Partial<Pick<User, "name" | "phone" | "email" | "role" | "active">>;
export type EventPayload = Omit<Event, "id" | "created_at" | "updated_at" | "writers" | "_count" | "affiliate">;
export type EventCreatePayload = Pick<
  Event,
  "name" | "date" | "venue" | "owner_name" | "owner_phone" | "owner_email"
> & { type: string; affiliate_id?: string };
export type EventUpdatePayload = Partial<EventCreatePayload & Pick<Event, "status">>;
export type WriterPayload = { phone: string; name?: string };
export type WriterUpdatePayload = Partial<Pick<User, "name" | "phone">>;
export type SettingsMap = Record<string, string>;

// ─── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (creds: LoginPayload) => api.post<AuthResponse>("/api/auth/login", creds),
  me: () => api.get<{ user: User }>("/api/auth/me"),
  logout: () => api.post<{ message: string }>("/api/auth/logout"),
  changePassword: (body: { current_password: string; new_password: string }) =>
    api.patch<{ message: string }>("/api/auth/password", body),
  updateProfile: (body: Partial<Pick<User, "name" | "email" | "phone">>) =>
    api.patch<{ user: User }>("/api/auth/profile", body),
};

// ─── Users ─────────────────────────────────────────────────
export const usersApi = {
  lookup: (phone: string) =>
    api.get<{ found: boolean; user?: User }>(`/api/users/lookup?phone=${encodeURIComponent(phone)}`),
  create: (data: Pick<User, "name" | "phone"> & Partial<Pick<User, "email">> & { password?: string }) =>
    api.post<User>("/api/users", data),
  list: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get<User[]>(`/api/users${q ? `?${q}` : ""}`);
  },
  update: (id: string, data: UserUpdatePayload) => api.patch<User>(`/api/users/${id}`, data),
  resetPassword: (id: string, password: string) =>
    api.post<{ message: string; temporary_password: string }>(`/api/users/${id}/reset-password`, { password }),
};

// ─── Admin ─────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get<AdminStats>("/api/admin/stats"),
  revenueSeries: () => api.get<RevenuePoint[]>("/api/admin/revenue-series"),
  affiliates: () => api.get<Affiliate[]>("/api/admin/affiliates"),
  createAffiliate: (data: CreateAffiliatePayload) => api.post<Affiliate>("/api/admin/affiliates", data),
  updateAffiliate: (id: string, data: UpdateAffiliatePayload) =>
    api.patch<Affiliate>(`/api/admin/affiliates/${id}`, data),
  deleteAffiliate: (id: string) => api.delete<{ message: string }>(`/api/admin/affiliates/${id}`),
  events: () => api.get<Event[]>("/api/admin/events"),
  settings: () => api.get<SettingsMap>("/api/admin/settings"),
  updateSettings: (settings: SettingsMap) => api.patch<SettingsMap>("/api/admin/settings", { settings }),
  auditLog: (limit?: number) => api.get<AuditLog[]>(`/api/admin/audit${limit ? `?limit=${limit}` : ""}`),
};

// ─── Affiliate ─────────────────────────────────────────────
export const affiliateApi = {
  events: () => api.get<Event[]>("/api/affiliate/events"),
  event: (id: string) => api.get<Event>(`/api/affiliate/events/${id}`),
  createEvent: (data: EventCreatePayload) => api.post<Event>("/api/affiliate/events", data),
  updateEvent: (id: string, data: EventUpdatePayload) => api.patch<Event>(`/api/affiliate/events/${id}`, data),
  deleteEvent: (id: string) => api.delete<{ message: string }>(`/api/affiliate/events/${id}`),
  toggleWriterAccess: (id: string, enabled: boolean) =>
    api.patch<{ writer_access_enabled: boolean }>(`/api/affiliate/events/${id}/writer-access`, { enabled }),
  toggleShare: (id: string, enabled: boolean) =>
    api.patch<Pick<Event, "share_enabled" | "share_token">>(`/api/affiliate/events/${id}/share`, { enabled }),
  regenerateShare: (id: string) =>
    api.post<Pick<Event, "share_token">>(`/api/affiliate/events/${id}/regenerate-share`),
  writers: (eventId: string) => api.get<EventWriter[]>(`/api/affiliate/events/${eventId}/writers`),
  assignWriter: (eventId: string, data: WriterPayload) =>
    api.post<EventWriter>(`/api/affiliate/events/${eventId}/writers`, data),
  updateWriter: (eventId: string, writerId: string, data: WriterUpdatePayload) =>
    api.patch<User>(`/api/affiliate/events/${eventId}/writers/${writerId}`, data),
  removeWriter: (eventId: string, writerId: string) =>
    api.delete<{ message: string }>(`/api/affiliate/events/${eventId}/writers/${writerId}`),
};

// ─── Moi ───────────────────────────────────────────────────
export const moiApi = {
  list: (eventId: string) => api.get<{ entries: MoiEntry[] }>(`/api/events/${eventId}/moi`),
  create: (eventId: string, data: MoiEntryPayload) => api.post<MoiEntry>(`/api/events/${eventId}/moi`, data),
  update: (eventId: string, entryId: string, data: Partial<MoiEntryPayload>) =>
    api.patch<MoiEntry>(`/api/events/${eventId}/moi/${entryId}`, data),
  void: (eventId: string, entryId: string) =>
    api.patch<MoiEntry>(`/api/events/${eventId}/moi/${entryId}/void`),
  restore: (eventId: string, entryId: string) =>
    api.patch<MoiEntry>(`/api/events/${eventId}/moi/${entryId}/restore`),
  remove: (eventId: string, entryId: string) =>
    api.delete<{ message: string }>(`/api/events/${eventId}/moi/${entryId}`),
};

// ─── Reports ───────────────────────────────────────────────
export const reportsApi = {
  settlement: (eventId: string) => api.get<Settlement>(`/api/events/${eventId}/settlement`),
  report: (eventId: string) => api.get<EventReport>(`/api/events/${eventId}/report`),
  exportCsvUrl: (eventId: string) => `${BASE_URL}/api/events/${eventId}/export.csv`,
  downloadCsv: async (eventId: string) => {
    const res = await api.raw("GET", `/api/events/${eventId}/export.csv`);
    if (!res.ok) throw new ApiError("Export failed", res.status);
    const blob = await res.blob();
    return blob;
  },
};

// ─── Writer ────────────────────────────────────────────────
export const writerApi = {
  events: () => api.get<Event[]>("/api/writer/events"),
  event: (id: string) => api.get<Event>(`/api/writer/events/${id}`),
  stats: (id: string) => api.get<WriterStats>(`/api/writer/events/${id}/stats`),
};

// ─── Public ────────────────────────────────────────────────
export const publicApi = {
  plans: () => api.get<PlanInfo[]>("/api/public/plans"),
  settings: () => api.get<PublicSettings>("/api/public/settings"),
  sharedEvent: (token: string) => api.get<SharedEventResponse>(`/api/public/events/shared/${token}`),
};

export type { ValidationIssue };
