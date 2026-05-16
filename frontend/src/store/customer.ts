import { signal } from "@preact/signals";
import { apiFetch } from "../services/api";

export interface Customer {
  id: number;
  username: string;
  email: string;
  user_id: number;
  created_at?: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// Signals
export const customers = signal<Customer[]>([]);
export const isCustomerLoading = signal(false);
export const customerError = signal<string | null>(null);

// Actions
export const fetchCustomers = async () => {
  try {
    isCustomerLoading.value = true;
    const response = await apiFetch<ApiResponse<{ customers: Customer[] }>>("/customers");
    if (response.status === "success") {
      customers.value = response.data.customers;
    }
  } catch (err) {
    customerError.value = err instanceof Error ? err.message : "Failed to fetch customers";
  } finally {
    isCustomerLoading.value = false;
  }
};

export const createCustomer = async (data: { username: string; email: string }) => {
  isCustomerLoading.value = true;
  try {
    const response = await apiFetch<ApiResponse<{ customer: Customer }>>("/customers", {
      method: "POST",
      data,
    });
    if (response.status === "success") {
      customers.value = [response.data.customer, ...customers.value];
      return response.data.customer;
    }
  } finally {
    isCustomerLoading.value = false;
  }
};
