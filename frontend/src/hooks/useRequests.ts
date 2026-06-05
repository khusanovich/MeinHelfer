"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import type { AdminRequestDetail, AdminRequestListItem, PaginatedResponse } from "@/types/api";
import type { RequestStatus, ServiceType } from "@/types/api";

export interface RequestFilters {
  status?: RequestStatus | "";
  service_type?: ServiceType | "";
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export function useRequests(filters: RequestFilters = {}) {
  const params: Record<string, string | number | undefined> = {
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
    sort_by: filters.sort_by ?? "created_at",
    sort_order: filters.sort_order ?? "desc",
  };
  if (filters.status) params.status = filters.status;
  if (filters.service_type) params.service_type = filters.service_type;
  if (filters.search) params.search = filters.search;

  const key = ["requests", JSON.stringify(params)];

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<AdminRequestListItem>
  >(key, () => api.listRequests(params));

  return { data, error, isLoading, mutate };
}

export function useDashboard() {
  const { data, error, isLoading } = useSWR("dashboard", api.getDashboard);
  return { data, error, isLoading };
}

export function useRequest(id: string) {
  const { data, error, isLoading, mutate } = useSWR<AdminRequestDetail>(
    id ? ["request", id] : null,
    () => api.getRequest(id),
  );
  return { data, error, isLoading, mutate };
}
