import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendReminderOptions {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}

export const sendInvoiceReminder = async ({ to, replyTo, subject, text }: SendReminderOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [to],
      replyTo,
      subject,
      text,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    throw error;
  }
};
