# Tutorial: Getting Started with PayTrack

This tutorial will guide you through setting up PayTrack and tracking your first payment.

## Prerequisites
- Node.js **v26**
- **pnpm** installed globally.

## 1. Setup the Project
Clone the repository and install dependencies from the root:
```bash
pnpm install
```

## 2. Configure Environment
PayTrack requires configuration for both the backend and frontend.

### Backend Setup
1. Navigate to `backend/`.
2. Create a `.env` file: `cp .env.example .env`.
3. Add your `RESEND_API_KEY`.

### Frontend Setup
1. Navigate to `frontend/`.
2. Create a `.env` file: `cp .env.example .env`.
3. Configure `VITE_API_URL` (usually `http://localhost:3000/api`).

## 3. Launch Development Mode
Run the following command from the root to start both the frontend and backend:
```bash
pnpm dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 4. Your First Workflow
1. **Sign Up**: Create a new account to access your personal dashboard.
2. **Create a Customer**: Go to the **Customers** tab and add a new contact.
3. **Generate an Invoice**: Navigate to **Invoices** and click **New Invoice**. Select your customer, enter an amount, and set a due date.
4. **Send a Reminder**: Click the "Send Reminder" button on the invoice card to dispatch an email via Resend.
5. **Monitor Health**: Return to the **Dashboard** to see your financial health metrics update in real-time.
