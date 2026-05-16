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
  limit: 5,
  totalPages: 1,
});
export const stats = signal<InvoiceStats>({ total: 0, unpaid: 0 });
export const filters = signal({ status: "all", search: "", startDate: "", endDate: "" });

// Actions
export const fetchInvoices = async () => {
  // Prevent concurrent fetches and redundant triggers
  if (isInvoiceLoading.value) return;

  try {
    isInvoiceLoading.value = true;
    invoiceError.value = null;
    const { status, search, startDate, endDate } = filters.value;
    const { page, limit } = pagination.value;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (status && status !== "all") queryParams.append("status", status);
    if (search) queryParams.append("search", search);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const response = await apiFetch<
      ApiResponse<{ invoices: Invoice[] }> & { pagination: PaginationMetadata; stats: InvoiceStats }
    >(`/invoices?${queryParams.toString()}`);

    if (response.status === "success") {
      invoices.value = response.data.invoices;
      
      // Atomic update of metadata only if they changed
      if (response.pagination) {
        const current = pagination.value;
        const next = response.pagination;
        if (
          current.total !== next.total ||
          current.totalPages !== next.totalPages ||
          current.page !== next.page ||
          current.limit !== next.limit
        ) {
          pagination.value = next;
        }
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
      // Refresh both to ensure UI consistency across pages
      if (dashboardStats.value) fetchDashboardStats();
      if (invoices.value.length > 0) fetchInvoices();
      return response.data.invoice;
    }
  } finally {
    isInvoiceLoading.value = false;
  }
};

export const updateInvoiceStatus = async (id: number, status: InvoiceStatus) => {
  try {
    const response = await apiFetch<ApiResponse<{ invoice: Invoice }>>(`/invoices/${id}`, {
      method: "PATCH",
      data: { status },
    });
    if (response.status === "success") {
      // Refresh both to ensure UI consistency across pages
      if (dashboardStats.value) fetchDashboardStats();
      if (invoices.value.length > 0) fetchInvoices();
    }
  } catch (err) {
    console.error("Failed to update status", err);
  }
};

export const updateInvoice = async (id: number, data: Partial<Invoice>) => {
  try {
    const response = await apiFetch<ApiResponse<{ invoice: Invoice }>>(`/invoices/${id}`, {
      method: "PATCH",
      data,
    });
    if (response.status === "success") {
      // Refresh both to ensure UI consistency across pages
      if (dashboardStats.value) fetchDashboardStats();
      if (invoices.value.length > 0) fetchInvoices();
      return response.data.invoice;
    }
  } catch (err) {
    console.error("Failed to update invoice", err);
    throw err;
  }
};

export const deleteInvoice = async (id: number) => {
  try {
    await apiFetch(`/invoices/${id}`, { method: "DELETE" });
    // Refresh both to ensure UI consistency across pages
    if (dashboardStats.value) fetchDashboardStats();
    if (invoices.value.length > 0) fetchInvoices();
  } catch (err) {
    console.error("Failed to delete invoice", err);
  }
};
