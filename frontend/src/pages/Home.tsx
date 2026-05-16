import { useEffect } from "preact/hooks";
import { fetchDashboardStats, dashboardStats, isDashboardLoading } from "../store/invoice";
import { user, isAuthenticated } from "../store/auth";
import { InvoiceItem } from "../components/InvoiceItem";
import { formatAmount } from "../store/settings";

export default function Home() {
  useEffect(() => {
    if (isAuthenticated.value) {
      fetchDashboardStats();
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

  const stats = dashboardStats.value;

  if (isDashboardLoading.value && !stats) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-muted animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-text-muted text-sm">
            Hi {user.value?.username}, here&apos;s your business at a glance.
          </p>
        </div>
        <a
          href="/invoices"
          className="btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm"
        >
          <span>Manage Invoices</span>
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
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </header>

      {/* Financial Health Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card py-6 text-center">
          <span className="text-3xl font-extrabold text-green-600">
            {formatAmount(stats?.totals.paid || 0)}
          </span>
          <p className="text-text-muted mt-2 text-xs font-bold tracking-widest uppercase">
            Total Revenue
          </p>
        </div>
        <div className="card py-6 text-center">
          <span className="text-3xl font-extrabold text-yellow-600">
            {formatAmount(stats?.totals.pending || 0)}
          </span>
          <p className="text-text-muted mt-2 text-xs font-bold tracking-widest uppercase">
            Pending
          </p>
        </div>
        <div className="card border-red-100 bg-red-50/30 py-6 text-center">
          <span className="text-3xl font-extrabold text-red-600">
            {formatAmount(stats?.totals.overdue || 0)}
          </span>
          <p className="text-text-muted mt-2 text-xs font-bold tracking-widest uppercase">
            At Risk (Overdue)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Action Center: Needs Attention */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Needs Attention</h2>
            <a href="/invoices" className="text-primary text-xs font-bold hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-4">
            {!stats || stats.needsAttention.length === 0 ? (
              <div className="card border-dashed py-12 text-center">
                <p className="text-text-muted text-sm">All caught up! No urgent invoices.</p>
              </div>
            ) : (
              stats.needsAttention.map((invoice) => (
                <InvoiceItem key={invoice.id} invoice={invoice} />
              ))
            )}
          </div>
        </div>

        {/* Top Debtors */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Top Debtors</h2>
          <div className="card overflow-hidden p-0">
            {!stats || stats.topDebtors.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-text-muted text-xs">No outstanding balances.</p>
              </div>
            ) : (
              <div className="divide-border divide-y">
                {stats.topDebtors.map((debtor) => (
                  <div key={debtor.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-bold" title={debtor.username}>
                        {debtor.username}
                      </span>
                      <span className="text-text-muted truncate text-[10px]" title={debtor.email}>
                        {debtor.email}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-red-600">
                      {formatAmount(debtor.total_unpaid)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
