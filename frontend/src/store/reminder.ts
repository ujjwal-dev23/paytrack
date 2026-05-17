import { signal } from "@preact/signals";
import { apiFetch } from "../services/api";
import type { Reminder, ApiResponse } from "@app/backend";

export const reminders = signal<Reminder[]>([]);
export const isReminderLoading = signal(false);

export const fetchReminders = async () => {
  try {
    isReminderLoading.value = true;
    const response = await apiFetch<ApiResponse<{ reminders: Reminder[] }>>("/reminders");
    if (response.status === "success") {
      reminders.value = response.data.reminders;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isReminderLoading.value = false;
  }
};

export const sendReminder = async (invoiceId: number, currencySymbol: string) => {
  const response = await apiFetch<ApiResponse<{ reminder: Reminder }>>("/reminders", {
    method: "POST",
    data: { invoice_id: invoiceId, currency_symbol: currencySymbol },
  });
  if (response.status === "success") {
    fetchReminders(); // Refresh to get full contextual data for logs
    return response.data.reminder;
  }
};

export const sendBulkReminders = async (currencySymbol: string) => {
  try {
    isReminderLoading.value = true;
    const response = await apiFetch<ApiResponse<{ reminders: Reminder[] }>>("/reminders/bulk", {
      method: "POST",
      data: { currency_symbol: currencySymbol },
    });
    if (response.status === "success") {
      fetchReminders(); // Refresh all logs
      return response.data.reminders;
    }
  } finally {
    isReminderLoading.value = false;
  }
};
