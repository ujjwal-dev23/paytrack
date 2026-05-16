import { useState, useEffect } from "preact/hooks";
import { fetchInvoices, invoices, isInvoiceLoading, filters, pagination } from "../store/invoice";
import { fetchReminders } from "../store/reminder";
import { isAuthenticated } from "../store/auth";
import { Button } from "../components/Button";
import { InvoiceItem } from "../components/InvoiceItem";
import { InvoiceForm } from "../components/InvoiceForm";

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated.value) {
      fetchInvoices();
      fetchReminders();
    }
  }, [isAuthenticated.value, filters.value, pagination.value.page]);

  if (!isAuthenticated.value) {
    return null; // Layout.tsx handles auth redirect/messaging if needed, or we just show nothing
  }

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-text-muted text-sm">Manage and track your payments.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="text-sm">
          + New Invoice
        </Button>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold">Invoice Management</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers..."
                className="input py-1.5 pl-8 text-xs"
                value={filters.value.search}
                onInput={(e) => {
                  filters.value = {
                    ...filters.value,
                    search: (e.target as HTMLInputElement).value,
                  };
                  pagination.value = { ...pagination.value, page: 1 };
                }}
              />
              <svg
                className="text-text-muted absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              className="input w-full py-1.5 text-xs sm:w-32"
              value={filters.value.status}
              onChange={(e) => {
                filters.value = { ...filters.value, status: (e.target as HTMLSelectElement).value };
                pagination.value = { ...pagination.value, page: 1 };
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {isInvoiceLoading.value && invoices.value.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-text-muted animate-pulse">Loading invoices...</p>
          </div>
        ) : invoices.value.length === 0 ? (
          <div className="card flex flex-col items-center border-dashed py-12 text-center">
            <p className="text-text-muted text-sm">No invoices found matching your criteria.</p>
            {!filters.value.search && filters.value.status === "all" && (
              <Button
                variant="secondary"
                onClick={() => setShowForm(true)}
                className="mt-4 text-xs"
              >
                + Create First Invoice
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-1">
              {invoices.value.map((invoice) => (
                <InvoiceItem key={invoice.id} invoice={invoice} />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-text-muted text-xs">
                Showing {invoices.value.length} of {pagination.value.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="h-auto px-3 py-1.5 text-xs"
                  disabled={pagination.value.page <= 1}
                  onClick={() => {
                    pagination.value = { ...pagination.value, page: pagination.value.page - 1 };
                  }}
                >
                  Previous
                </Button>
                <div className="text-text-main flex items-center px-2 text-xs font-medium">
                  {pagination.value.page} / {pagination.value.totalPages}
                </div>
                <Button
                  variant="secondary"
                  className="h-auto px-3 py-1.5 text-xs"
                  disabled={pagination.value.page >= pagination.value.totalPages}
                  onClick={() => {
                    pagination.value = { ...pagination.value, page: pagination.value.page + 1 };
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      {showForm && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200">
          <div className="bg-card rounded-custom animate-in zoom-in-95 w-full max-w-md overflow-hidden shadow-2xl duration-200">
            <div className="border-border flex items-center justify-between border-b p-6">
              <h2 className="text-lg font-bold">Create New Invoice</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-text-muted hover:text-text-main"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <InvoiceForm onSuccess={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
