export type InvoiceStatus = "pending" | "paid" | "overdue";

export interface Invoice {
  id: number;
  amount: number;
  description: string | null;
  user_id: number;
  customer_id: number;
  due_date: string;
  status: InvoiceStatus;
  created_on: string;
  customer_name?: string;
  customer_email?: string;
}
