import { signal } from "@preact/signals";
import { apiFetch } from "../services/api";
import type { 
  Invoice, 
  InvoiceStatus, 
  PaginationMetadata, 
  InvoiceStats, 
  DashboardStats,
  ApiResponse
} from "@app/backend";

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

// Track the current fetch request to handle concurrency
let currentFetchController: AbortController | null = null;

// Actions
export const fetchInvoices = async () => {
  // Cancel any pending request
  if (currentFetchController) {
    currentFetchController.abort();
  }
  
  currentFetchController = new AbortController();
  const { signal: abortSignal } = currentFetchController;

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
    >(`/invoices?${queryParams.toString()}`, { signal: abortSignal });

    if (response.status === "success" && !abortSignal.aborted) {
      invoices.value = response.data.invoices;
      
      if (response.pagination) {
        pagination.value = response.pagination;
      }
      
      if (response.stats) {
        stats.value = response.stats;
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return;
    }
    invoiceError.value = err instanceof Error ? err.message : "Failed to fetch invoices";
  } finally {
    if (currentFetchController?.signal === abortSignal) {
      isInvoiceLoading.value = false;
      currentFetchController = null;
    }
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
  try {
    const response = await apiFetch<ApiResponse<{ invoice: Invoice }>>("/invoices", {
      method: "POST",
      data,
    });
    if (response.status === "success") {
      // Refresh both to ensure UI consistency across pages
      fetchDashboardStats();
      fetchInvoices();
      return response.data.invoice;
    }
  } catch (err) {
    console.error("Failed to create invoice", err);
    throw err;
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
      fetchDashboardStats();
      fetchInvoices();
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
      fetchDashboardStats();
      fetchInvoices();
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
    fetchDashboardStats();
    fetchInvoices();
  } catch (err) {
    console.error("Failed to delete invoice", err);
  }
};
