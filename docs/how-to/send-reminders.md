# How-to: Feature Implementation (Reminders)

This document describes the technical implementation of the reminder dispatch pipeline.

## Reminder Dispatch Workflow

The reminder system is designed as a transactional flow between the Express backend and the Resend API.

1. **Trigger**: An authenticated request is made to `POST /api/reminders`.
2. **Context Aggregation**: The server performs a join across `invoices`, `customers`, and `users` to gather the necessary interpolation data (amounts, customer emails, and the user's custom reminder template).
3. **Template Interpolation**: The backend regex engine replaces placeholders (e.g., `{amount}`, `{due_date}`) with formatted localized data.
4. **External Dispatch**: The server calls the Resend API. If successful, it proceeds to the persistence layer.
5. **Audit Logging**: A record is inserted into the `reminders` table, serving as both an audit trail and a trigger for the "Last Reminded" UI state.

## Manual vs. Automated Status Updates

While reminders can be sent manually via the **Invoices** page, the system also tracks reminder activity in the **Reminders** tab. 

- **Sync Logic**: Sending a reminder does not automatically change an invoice to `Paid`. It maintains the `Pending` or `Overdue` state while updating the `sent_on` timestamp in the reminder log.
- **State Transition**: When a payment is received, the developer/user updates the invoice status to `Paid` via `PATCH /api/invoices/:id`. This transition immediately reconciles the dashboard metrics via Preact Signals.

## Error Handling

The reminder pipeline includes specific error handling for external API failures. If the Resend API returns an error, the audit log entry is suppressed, and a `500 Internal Server Error` (or specific Resend error) is returned to the frontend to ensure data consistency.
