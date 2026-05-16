import { useState } from "preact/hooks";
import { updateInvoiceStatus, deleteInvoice, updateInvoice } from "../store/invoice";
import type { Invoice } from "../store/invoice";
import { sendReminder } from "../store/reminder";
import { Button } from "./Button";
import { formatAmount, currency } from "../store/settings";

interface InvoiceItemProps {
  invoice: Invoice;
}

export function InvoiceItem({ invoice }: InvoiceItemProps) {
  const [loading, setLoading] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [newDueDate, setNewDueDate] = useState(invoice.due_date.split("T")[0]);
  const [newAmount, setNewAmount] = useState(invoice.amount.toString());

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

  const handleDueDateUpdate = async () => {
    setLoading(true);
    try {
      await updateInvoice(invoice.id, { due_date: newDueDate });
      setIsEditingDate(false);
    } catch (_err) {
      alert("Failed to update due date");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountUpdate = async () => {
    const amountNum = parseFloat(newAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await updateInvoice(invoice.id, { amount: amountNum });
      setIsEditingAmount(false);
    } catch (_err) {
      alert("Failed to update amount");
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
    <div className="card group hover:border-primary flex flex-col gap-4 p-4 transition-colors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {isEditingAmount ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="text-text-muted absolute inset-y-0 left-3 flex items-center text-sm">
                    {currency.value.symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    className="input w-32 py-1 pl-6 text-sm font-bold"
                    value={newAmount}
                    onInput={(e) => setNewAmount((e.target as HTMLInputElement).value)}
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleAmountUpdate}
                  disabled={loading}
                  className="text-primary text-xs font-bold hover:underline"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingAmount(false);
                    setNewAmount(invoice.amount.toString());
                  }}
                  className="text-text-muted text-xs hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold">{formatAmount(invoice.amount)}</span>
                <button
                  onClick={() => setIsEditingAmount(true)}
                  className="text-text-muted group-hover:text-primary p-1 opacity-0 transition-colors group-hover:opacity-100"
                  title="Edit Amount"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusColors[invoice.status]}`}
            >
              {invoice.status}
            </span>
          </div>
          <div className="mt-1 flex flex-col">
            <span className="text-text-main text-sm font-medium">
              {invoice.customer_name || "Unknown Customer"}
            </span>
            <span className="text-text-muted text-xs">{invoice.customer_email}</span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          {isEditingDate ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="input py-1 text-xs"
                value={newDueDate}
                onInput={(e) => setNewDueDate((e.target as HTMLInputElement).value)}
              />
              <button
                onClick={handleDueDateUpdate}
                disabled={loading}
                className="text-primary text-xs font-bold hover:underline"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingDate(false)}
                className="text-text-muted text-xs hover:underline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-text-muted text-xs">
                Due: {new Date(invoice.due_date).toLocaleDateString()}
              </span>
              <button
                onClick={() => setIsEditingDate(true)}
                className="text-text-muted group-hover:text-primary p-1 transition-colors"
                title="Change Due Date"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>
          )}
          <span className="text-text-muted mt-1 text-[10px]">
            Created: {new Date(invoice.created_on).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={invoice.status === "paid" ? "secondary" : "primary"}
            className="h-auto px-3 py-1.5 text-xs"
            onClick={handleStatusToggle}
            isLoading={loading}
          >
            {invoice.status === "paid" ? "Mark Pending" : "Mark Paid"}
          </Button>
          {invoice.status !== "paid" && (
            <Button
              variant="secondary"
              className="h-auto px-3 py-1.5 text-xs"
              onClick={handleSendReminder}
              isLoading={loading}
            >
              Send Reminder
            </Button>
          )}
        </div>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this invoice?")) {
              deleteInvoice(invoice.id);
            }
          }}
          className="text-text-muted rounded-custom p-2 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Delete Invoice"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
