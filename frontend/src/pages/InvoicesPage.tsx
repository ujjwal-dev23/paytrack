import { useState, useEffect } from "preact/hooks";
import { batch } from "@preact/signals";
import { fetchInvoices, invoices, isInvoiceLoading, filters, pagination } from "../store/invoice";
import { fetchReminders } from "../store/reminder";
import { isAuthenticated } from "../store/auth";
import { Button } from "../components/Button";
import { InvoiceItem } from "../components/InvoiceItem";
import { InvoiceForm } from "../components/InvoiceForm";

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    if (isAuthenticated.value) {
      fetchReminders();
    }
  }, [isAuthenticated.value]);

  useEffect(() => {
    if (isAuthenticated.value) {
      fetchInvoices();
    }
  }, [isAuthenticated.value, filters.value, pagination.value.page]);

  if (!isAuthenticated.value) {
    return null; // Layout.tsx handles auth redirect/messaging if needed, or we just show nothing
  }

  const hasActiveAdvancedFilters = !!(filters.value.startDate || filters.value.endDate);

  return (
    <div className="animate-in fade-in max-w-full overflow-hidden space-y-8 duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-text-muted text-sm">Manage and track your payments.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full text-sm sm:w-auto">
          + New Invoice
        </Button>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold">Invoice Management</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 sm:min-w-[240px]">
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="input-field py-1.5 pl-8 text-xs"
                  value={filters.value.search}
                  onInput={(e) => {
                    batch(() => {
                      filters.value = {
                        ...filters.value,
                        search: (e.target as HTMLInputElement).value,
                      };
                      pagination.value = { ...pagination.value, page: 1 };
                    });
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
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`rounded-custom flex h-9 w-9 items-center justify-center border transition-all ${
                  showAdvancedFilters || hasActiveAdvancedFilters
                    ? "bg-primary border-primary text-white shadow-md"
                    : "border-border text-text-muted hover:border-primary hover:text-primary bg-card"
                }`}
                title="Advanced Filters"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>
            </div>
            <div className="relative w-full sm:w-36">
              <select
                className="input-field appearance-none py-1.5 pr-8 pl-3 text-xs"
                value={filters.value.status}
                onChange={(e) => {
                  const target = e.target as HTMLSelectElement;
                  batch(() => {
                    filters.value = {
                      ...filters.value,
                      status: target.value,
                    };
                    pagination.value = { ...pagination.value, page: 1 };
                  });
                  target.blur();
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <svg
                className="text-text-muted pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-primary/5 rounded-custom border-primary/10 animate-in slide-in-from-top-2 border p-4 duration-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-text-muted text-[10px] font-bold tracking-wider uppercase">
                  From Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="input-field py-1.5 pl-8 text-xs"
                    value={filters.value.startDate}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      batch(() => {
                        filters.value = {
                          ...filters.value,
                          startDate: target.value,
                        };
                        pagination.value = { ...pagination.value, page: 1 };
                      });
                      target.blur();
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-text-muted text-[10px] font-bold tracking-wider uppercase">
                  To Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="input-field py-1.5 pl-8 text-xs"
                    value={filters.value.endDate}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      batch(() => {
                        filters.value = {
                          ...filters.value,
                          endDate: target.value,
                        };
                        pagination.value = { ...pagination.value, page: 1 };
                      });
                      target.blur();
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => {
                  batch(() => {
                    filters.value = { ...filters.value, startDate: "", endDate: "" };
                    pagination.value = { ...pagination.value, page: 1 };
                  });
                }}
                className="hover:text-primary-dark text-primary flex h-9 items-center px-4 text-xs font-bold transition-colors"
              >
                Clear Dates
              </button>
            </div>
          </div>
        )}

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
