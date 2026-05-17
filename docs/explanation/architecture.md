# Explanation: Architecture & Design Decisions

This document explains the technical philosophy and architectural choices behind PayTrack.

## 1. Technical Stack Philosophy
PayTrack is designed for speed, simplicity, and a low barrier to entry for developers and users alike.

### Frontend: Preact & Signals
We chose **Preact** as a lightweight alternative to React, providing the same component-based model at a fraction of the bundle size.
- **Signals**: Instead of complex state management libraries like Redux, we use `@preact/signals`. This allows for fine-grained reactivity, where only the specific DOM elements tied to a piece of state update. This is particularly effective for the dashboard, where multiple metrics might update independently.

### Backend: Node.js & SQLite
The backend is built with **Express.js** and **TypeScript**, prioritizing type safety and developer productivity.
- **SQLite (`better-sqlite3`)**: For an application focused on small business financials, SQLite offers the perfect balance of performance and simplicity. It requires zero configuration, making the app highly portable while still providing full relational database capabilities.
- **JWT & Cookies**: Security is handled via JSON Web Tokens stored in HttpOnly, Secure cookies to mitigate XSS and CSRF risks.

## 2. Communication: Resend Integration
PayTrack integrates with **Resend** for email delivery. This choice was driven by the need for a modern, developer-friendly API that handles the complexities of email delivery (SPF, DKIM, etc.) so the application can focus on tracking payments.

## 3. Product Thinking & UX
The core objective was to reduce the cognitive load of managing receivables.

### Dashboard-Centric Workflow
The user is immediately presented with actionable data:
- **Financial Totals**: Immediate visibility into Paid vs. Overdue amounts.
- **Needs Attention**: A prioritized list of invoices that require immediate follow-up.
- **Top Debtors**: Identifying which accounts hold the most significant unpaid balances.

### Simplified Navigation
By using a monorepo structure, we ensure that the frontend and backend remain perfectly in sync, allowing for a seamless experience where data updates across the application without manual refreshes.

## 4. Security & Data Integrity
- **Environment Management**: All sensitive keys (Resend API, JWT Secrets) are handled via environment variables.
- **Ownership Validation**: Every API request is strictly validated against the authenticated user's ID to ensure that data remains private and secure.
