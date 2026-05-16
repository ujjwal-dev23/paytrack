import { signal } from "@preact/signals";
import { apiFetch } from "../services/api";

export type InvoiceStatus = "pending" | "paid" | "overdue";

export interface Invoice {
  id: number;
  amount: number;
  user_id: number;
  customer_id: number;
  due_date: string;
  status: InvoiceStatus;
  created_on: string;
  customer_name?: string;
  customer_email?: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// Signals
export const invoices = signal<Invoice[]>([]);
export const isInvoiceLoading = signal(false);
export const invoiceError = signal<string | null>(null);

// Actions
export const fetchInvoices = async () => {
  try {
    isInvoiceLoading.value = true;
    const response = await apiFetch<ApiResponse<{ invoices: Invoice[] }>>("/invoices");
    if (response.status === "success") {
      invoices.value = response.data.invoices;
    }
  } catch (err) {
    invoiceError.value = err instanceof Error ? err.message : "Failed to fetch invoices";
  } finally {
    isInvoiceLoading.value = false;
  }
};

export const createInvoice = async (data: Partial<Invoice>) => {
  isInvoiceLoading.value = true;
  try {
    const response = await apiFetch<ApiResponse<{ invoice: Invoice }>>("/invoices", {
      method: "POST",
      data,
    });
    if (response.status === "success") {
      invoices.value = [response.data.invoice, ...invoices.value];
      return response.data.invoice;
    }
  } finally {
    isInvoiceLoading.value = false;
  }
};

export const updateInvoiceStatus = async (id: number, status: InvoiceStatus) => {
  const response = await apiFetch<ApiResponse<{ invoice: Invoice }>>(`/invoices/${id}`, {
    method: "PATCH",
    data: { status },
  });
  if (response.status === "success") {
    invoices.value = invoices.value.map((inv) => (inv.id === id ? response.data.invoice : inv));
  }
};

export const updateInvoice = async (id: number, data: Partial<Invoice>) => {
  const response = await apiFetch<ApiResponse<{ invoice: Invoice }>>(`/invoices/${id}`, {
    method: "PATCH",
    data,
  });
  if (response.status === "success") {
    invoices.value = invoices.value.map((inv) => (inv.id === id ? response.data.invoice : inv));
    return response.data.invoice;
  }
};

export const deleteInvoice = async (id: number) => {
  await apiFetch(`/invoices/${id}`, { method: "DELETE" });
  invoices.value = invoices.value.filter((inv) => inv.id !== id);
};
