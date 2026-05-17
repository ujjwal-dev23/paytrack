export interface Reminder {
  id: number;
  sent_on: string;
  invoice_id: number;
  amount?: number;
  due_date?: string;
  description?: string | null;
  customer_name?: string;
}
