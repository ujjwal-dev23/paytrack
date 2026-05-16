import { useState } from "preact/hooks";
import { updateInvoiceStatus, deleteInvoice } from "../store/invoice";
import type { Invoice } from "../store/invoice";
import { sendReminder } from "../store/reminder";
import { Button } from "./Button";

interface InvoiceItemProps {
  invoice: Invoice;
}

export function InvoiceItem({ invoice }: InvoiceItemProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusToggle = async () => {
    const nextStatus = invoice.status === "paid" ? "pending" : "paid";
    await updateInvoiceStatus(invoice.id, nextStatus);
  };

  const handleSendReminder = async () => {
    setLoading(true);
    try {
      await sendReminder(invoice.id);
      alert("Reminder sent!");
    } catch (_err) {
      alert("Failed to send reminder");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="card group hover:border-primary flex items-center justify-between transition-colors">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">${invoice.amount}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusColors[invoice.status]}`}
          >
            {invoice.status}
          </span>
        </div>
        <span className="text-text-muted mt-1 text-xs">
          Due: {new Date(invoice.due_date).toLocaleDateString()}
        </span>
      </div>

      <div className="flex gap-2">
        {invoice.status !== "paid" && (
          <Button
            variant="secondary"
            className="h-auto px-2 py-1 text-[10px]"
            onClick={handleSendReminder}
            isLoading={loading}
          >
            Remind
          </Button>
        )}
        <Button
          variant="secondary"
          className="h-auto px-2 py-1 text-[10px]"
          onClick={handleStatusToggle}
        >
          {invoice.status === "paid" ? "Mark Pending" : "Mark Paid"}
        </Button>
        <button
          onClick={() => deleteInvoice(invoice.id)}
          className="text-text-muted rounded-custom p-1 transition-colors hover:text-red-500"
          title="Delete"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
