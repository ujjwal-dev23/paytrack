export type InvoiceStatus = "pending" | "paid" | "overdue";

export interface Invoice {
  id: number;
  amount: number;
  user_id: number;
  customer_id: number;
  due_date: string;
  status: InvoiceStatus;
  created_on: string;
}
