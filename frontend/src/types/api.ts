// API Contract Types

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}

// Booking API Types
export interface Appointment {
  id: string;
  client_id: string;
  master_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  status: 'booked' | 'confirmed' | 'started' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface BookAppointmentRequest {
  client_id: string;
  master_id: string;
  service_id: string;
  starts_at: string;
  duration_minutes: number;
}

// POS API Types
export interface Visit {
  id: string;
  appointment_id?: string;
  client_id: string;
  master_id: string;
  status: 'open' | 'closed';
  started_at: string;
  closed_at?: string;
  created_at: string;
}

export interface Order {
  id: string;
  visit_id: string;
  client_id: string;
  total_amount: number;
  vat_amount: number;
  status: 'open' | 'closed';
  created_at: string;
  closed_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_id?: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  total_amount: number;
}

export interface CreateOrderRequest {
  visit_id: string;
  items: Array<{
    service_id?: string;
    product_id?: string;
    quantity: number;
    unit_price: number;
    vat_rate: number;
  }>;
}

// Payments API Types
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: 'card' | 'cash' | 'online' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  captured_at?: string;
}

export interface InitiatePaymentRequest {
  order_id: string;
  amount: number;
  method: 'card' | 'cash' | 'online' | 'bank_transfer';
}

// Customer API Types
export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  gdpr_consent: boolean;
  created_at: string;
}

export interface RegisterClientRequest {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  gdpr_consent: boolean;
}

// Staff API Types
export interface Master {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  created_at: string;
}

export interface CreateMasterRequest {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

// Analytics API Types
export interface DailySales {
  date: string;
  tenant_id: string;
  total_amount: number;
  vat_amount: number;
  order_count: number;
}

export interface MasterUtilization {
  master_id: string;
  master_name: string;
  total_hours: number;
  booked_hours: number;
  utilization_rate: number;
}

export interface ClientLTV {
  client_id: string;
  client_name: string;
  total_spent: number;
  visit_count: number;
  average_visit_value: number;
}

