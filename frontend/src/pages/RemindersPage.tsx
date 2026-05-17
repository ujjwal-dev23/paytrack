import { useEffect, useState } from "preact/hooks";
import { reminders, fetchReminders, isReminderLoading, sendBulkReminders } from "../store/reminder";
import { formatAmount, currency } from "../store/settings";
import { Button } from "../components/Button";

export default function RemindersPage() {
  const [isBulkSending, setIsBulkSending] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleBulkSend = async () => {
    if (!confirm("Are you sure you want to send reminders for all unpaid invoices?")) return;
    
    setIsBulkSending(true);
    try {
      const sent = await sendBulkReminders(currency.value.symbol);
      if (sent && sent.length > 0) {
        alert(`Successfully sent ${sent.length} reminders!`);
      } else {
        alert("No unpaid invoices found to remind.");
      }
    } catch (_err) {
      alert("Failed to send bulk reminders.");
    } finally {
      setIsBulkSending(false);
    }
  };

  return (
    <div className="animate-in fade-in max-w-full space-y-8 overflow-hidden duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reminder Logs</h1>
          <p className="text-text-muted text-sm">Track all sent reminders and manage bulk notifications.</p>
        </div>
        <Button 
          onClick={handleBulkSend} 
          className="w-full text-sm sm:w-auto" 
          isLoading={isBulkSending}
          disabled={isReminderLoading.value}
        >
          Send Bulk Reminders
        </Button>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Recent History</h2>
        
        {isReminderLoading.value && reminders.value.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-text-muted animate-pulse">Loading reminder logs...</p>
          </div>
        ) : reminders.value.length === 0 ? (
          <div className="card flex flex-col items-center border-dashed py-12 text-center">
            <p className="text-text-muted text-sm">No reminders have been sent yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-1">
            {reminders.value.map((reminder) => (
              <div key={reminder.id} className="card group flex flex-col gap-4 p-4 transition-colors hover:border-primary">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="block truncate text-xl font-bold">
                        {reminder.amount ? formatAmount(reminder.amount) : "N/A"}
                      </span>
                      <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                        Sent
                      </span>
                    </div>
                    <div className="mt-1 flex min-w-0 flex-col">
                      <span className="text-text-main truncate text-sm font-medium">
                        To: {reminder.customer_name || "Unknown"}
                      </span>
                      <span className="text-text-muted truncate text-xs">
                        {reminder.description || "No description"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-start sm:items-end text-xs space-y-1">
                    <span className="text-text-main font-semibold">
                      Sent on: {new Date(reminder.sent_on).toLocaleString()}
                    </span>
                    <span className="text-text-muted italic">
                      Invoice Due: {reminder.due_date ? new Date(reminder.due_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
