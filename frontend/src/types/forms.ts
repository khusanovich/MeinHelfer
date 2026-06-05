import type { ServiceType } from "./api";

export interface BookingFormData {
  service_type: ServiceType;
  helper_count: number;
  scheduled_date: string;
  scheduled_time: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  address_notes: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  description: string;
}

export type BookingStep = 1 | 2 | 3 | 4 | 5;
