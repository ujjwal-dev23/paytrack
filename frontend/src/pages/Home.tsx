import { useState, useEffect } from "preact/hooks";
import { fetchInvoices, invoices, isInvoiceLoading } from "../store/invoice";
import { fetchReminders, reminders } from "../store/reminder";
import { user, isAuthenticated } from "../store/auth";
import { Button } from "../components/Button";
import { InvoiceItem } from "../components/InvoiceItem";
import { InvoiceForm } from "../components/InvoiceForm";

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated.value) {
      fetchInvoices();
      fetchReminders();
    }
  }, [isAuthenticated.value]);

  if (!isAuthenticated.value) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center justify-center py-12 text-center duration-700">
        <h1 className="text-text-main text-4xl font-extrabold tracking-tight sm:text-6xl">
          Track payments <span className="text-primary">effortlessly.</span>
        </h1>
        <p className="text-text-muted mx-auto mt-6 max-w-lg text-lg">
          A minimal, secure way to manage your invoices and automated reminders. Built for
          simplicity and speed.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a href="/signup" className="btn-primary px-8 py-3 text-base">
            Get Started for Free
          </a>
          <a
            href="/login"
            className="text-text-main hover:text-primary px-8 py-3 text-base font-medium transition-colors"
          >
            Sign In &rarr;
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-text-muted text-sm">
            Hi {user.value?.username}, here&apos;s your overview.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="text-sm">
          + New Invoice
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <span className="text-primary text-3xl font-bold">{invoices.value.length}</span>
          <p className="text-text-muted mt-1 text-xs font-semibold tracking-wider uppercase">
            Invoices
          </p>
        </div>
        <div className="card text-center">
          <span className="text-primary text-3xl font-bold">{reminders.value.length}</span>
          <p className="text-text-muted mt-1 text-xs font-semibold tracking-wider uppercase">
            Reminders Sent
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Recent Invoices</h2>
        </div>

        {isInvoiceLoading.value && invoices.value.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-text-muted animate-pulse">Loading invoices...</p>
          </div>
        ) : invoices.value.length === 0 ? (
          <div className="card flex flex-col items-center border-dashed py-12 text-center">
            <p className="text-text-muted text-sm">No invoices found.</p>
            <Button variant="secondary" onClick={() => setShowForm(true)} className="mt-4 text-xs">
              + Create First Invoice
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.value.map((invoice) => (
              <InvoiceItem key={invoice.id} invoice={invoice} />
            ))}
          </div>
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
