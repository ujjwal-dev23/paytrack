import type { Invoice } from "./invoice";

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

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}
