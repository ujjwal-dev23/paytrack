import { signal } from "@preact/signals";
import { apiFetch } from "../services/api";

export interface Reminder {
  id: number;
  invoice_id: number;
  sent_on: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

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

export const sendReminder = async (invoiceId: number) => {
  const response = await apiFetch<ApiResponse<{ reminder: Reminder }>>("/reminders", {
    method: "POST",
    data: { invoice_id: invoiceId },
  });
  if (response.status === "success") {
    reminders.value = [response.data.reminder, ...reminders.value];
    return response.data.reminder;
  }
};
