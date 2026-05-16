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

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoiceStats {
  total: number;
  unpaid: number;
}

export interface DashboardStats {
  totals: {
    paid: number;
    pending: number;
    overdue: number;
    total: number;
  };
  topDebtors: {
    id: number;
    username: string;
    email: string;
    total_unpaid: number;
  }[];
  needsAttention: Invoice[];
}

// Signals
export const invoices = signal<Invoice[]>([]);
export const isInvoiceLoading = signal(false);
export const dashboardStats = signal<DashboardStats | null>(null);
export const isDashboardLoading = signal(false);
export const invoiceError = signal<string | null>(null);
export const pagination = signal<PaginationMetadata>({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});
export const stats = signal<InvoiceStats>({ total: 0, unpaid: 0 });
export const filters = signal({ status: "all", search: "" });

// Actions
export const fetchInvoices = async () => {
  try {
    isInvoiceLoading.value = true;
    const { status, search } = filters.value;
    const { page, limit } = pagination.value;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (status && status !== "all") queryParams.append("status", status);
    if (search) queryParams.append("search", search);

    const response = await apiFetch<
      ApiResponse<{ invoices: Invoice[] }> & { pagination: PaginationMetadata; stats: InvoiceStats }
    >(`/invoices?${queryParams.toString()}`);

    if (response.status === "success") {
      invoices.value = response.data.invoices;
      if (response.pagination) {
        pagination.value = response.pagination;
      }
      if (response.stats) {
        stats.value = response.stats;
      }
    }
  } catch (err) {
    invoiceError.value = err instanceof Error ? err.message : "Failed to fetch invoices";
  } finally {
    isInvoiceLoading.value = false;
  }
};

export const fetchDashboardStats = async () => {
  try {
    isDashboardLoading.value = true;
    const response = await apiFetch<ApiResponse<DashboardStats>>("/invoices/stats/dashboard");
    if (response.status === "success") {
      dashboardStats.value = response.data;
    }
  } catch (err) {
    console.error("Failed to fetch dashboard stats", err);
  } finally {
    isDashboardLoading.value = false;
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
