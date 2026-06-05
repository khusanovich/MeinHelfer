export type ServiceType =
  | "moving"
  | "assembly"
  | "loading"
  | "cleaning"
  | "gardening"
  | "general";

export type RequestStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

// ── Request creation ──────────────────────────────────────────────────────────

export interface CreateRequestPayload {
  service_type: ServiceType;
  helper_count: number;
  scheduled_date: string;
  scheduled_time: string;
  address: {
    street: string;
    city: string;
    zip: string;
    notes?: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  description: string;
}

export interface RequestCreatedResponse {
  reference_code: string;
  status: RequestStatus;
  message: string;
}

export interface RequestStatusResponse {
  reference_code: string;
  status: RequestStatus;
  service_type: ServiceType;
  scheduled_date: string;
  scheduled_time: string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminRequestListItem {
  id: string;
  reference_code: string;
  service_type: ServiceType;
  helper_count: number;
  scheduled_date: string;
  scheduled_time: string;
  customer_name: string;
  customer_email: string;
  status: RequestStatus;
  assigned_helper: string | null;
  created_at: string;
}

export interface StatusLogEntry {
  old_status: RequestStatus | null;
  new_status: RequestStatus;
  note: string | null;
  created_at: string;
}

export interface AdminRequestDetail {
  id: string;
  reference_code: string;
  service_type: ServiceType;
  helper_count: number;
  scheduled_date: string;
  scheduled_time: string;
  address: {
    street: string;
    city: string;
    zip: string;
    notes: string | null;
  };
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };
  description: string;
  status: RequestStatus;
  assigned_helper: string | null;
  admin_notes: string | null;
  estimated_price: number | null;
  estimated_hours: number | null;
  ai_summary: string | null;
  status_history: StatusLogEntry[];
  confirmed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateRequestPayload {
  status?: RequestStatus;
  assigned_helper?: string;
  admin_notes?: string;
  estimated_price?: number;
  estimated_hours?: number;
}

export interface DashboardResponse {
  overview: {
    total_requests: number;
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  this_week: {
    new_requests: number;
    completed: number;
  };
  by_service_type: Record<string, number>;
  upcoming_scheduled: Array<{
    reference_code: string;
    service_type: ServiceType;
    scheduled_date: string;
    scheduled_time: string;
    customer_name: string;
    status: RequestStatus;
  }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface APIError {
  title: string;
  detail: string;
  status: number;
}
