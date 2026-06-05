import type {
  AdminRequestDetail,
  AdminRequestListItem,
  CreateRequestPayload,
  DashboardResponse,
  PaginatedResponse,
  RequestCreatedResponse,
  RequestStatusResponse,
  TokenResponse,
  UpdateRequestPayload,
} from "@/types/api";
import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? body.title ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Public ────────────────────────────────────────────────────────────────────

export const api = {
  createRequest: (data: CreateRequestPayload) =>
    request<RequestCreatedResponse>("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRequestStatus: (referenceCode: string) =>
    request<RequestStatusResponse>(`/requests/${referenceCode}/status`),

  // ── Auth ───────────────────────────────────────────────────────────────────

  login: (email: string, password: string) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // ── Admin ──────────────────────────────────────────────────────────────────

  getDashboard: () => request<DashboardResponse>("/admin/dashboard"),

  listRequests: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") query.set(k, String(v));
    });
    return request<PaginatedResponse<AdminRequestListItem>>(
      `/admin/requests?${query}`,
    );
  },

  getRequest: (id: string) =>
    request<AdminRequestDetail>(`/admin/requests/${id}`),

  updateRequest: (id: string, data: UpdateRequestPayload) =>
    request<AdminRequestDetail>(`/admin/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  anonymizeRequest: (id: string) =>
    request<{ message: string }>(`/admin/requests/${id}/anonymize`, {
      method: "DELETE",
    }),
};
