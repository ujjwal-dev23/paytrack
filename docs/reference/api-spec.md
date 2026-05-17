# Reference: Technical Specification

PayTrack's backend is a RESTful API built with Express.js, using JWT for authentication and SQLite for persistence.

## Data Models

### User
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `username` | String | User's display name |
| `email` | String | User's email (unique, used for login) |
| `password` | String | Bcrypt-hashed password |
| `reminder_template` | Text | Customizable template for email reminders |

### Customer
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `user_id` | Integer | Foreign Key to User (Owner) |
| `username` | String | Customer/Business name |
| `email` | String | Contact email for reminders (unique per user) |
| `created_at` | Date | Timestamp of customer creation |

### Invoice
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `user_id` | Integer | Foreign Key to User (Owner) |
| `customer_id` | Integer | Foreign Key to Customer |
| `amount` | Number | Total value of the invoice |
| `description` | String | Optional details about the invoice |
| `due_date` | Date | ISO 8601 date when payment is expected |
| `status` | Enum | `pending`, `paid`, `overdue` |
| `created_on` | Date | Timestamp of invoice creation |

### Reminder
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `invoice_id` | Integer | Foreign Key to Invoice |
| `sent_on` | Date | Timestamp of when the email was sent |

---

## API Endpoints

### Authentication
- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/login`: Authenticate and receive a JWT (via HttpOnly cookie).
- `POST /api/auth/logout`: Invalidate the session.
- `GET /api/auth/me`: Get current user profile.
- `PATCH /api/auth/me`: Update profile (username, password, or reminder template).

### Invoices
- `GET /api/invoices`: List invoices with pagination and filtering.
  - **Query Params**: `status`, `search`, `startDate`, `endDate`, `page`, `limit`.
- `GET /api/invoices/:id`: Get detailed invoice info.
- `POST /api/invoices`: Create a new invoice.
- `PATCH /api/invoices/:id`: Update invoice details or status.
- `DELETE /api/invoices/:id`: Remove an invoice.
- `GET /api/invoices/stats/dashboard`: Aggregated statistics for the dashboard.

### Customers
- `GET /api/customers`: List all customers for the user.
- `GET /api/customers/:id`: Get customer details.
- `POST /api/customers`: Add a new customer.
- `PATCH /api/customers/:id`: Update customer info.
- `DELETE /api/customers/:id`: Delete a customer.

### Reminders
- `GET /api/reminders`: History of all sent reminders.
- `POST /api/reminders`: Send a reminder for a specific invoice.
  - **Body**: `{ "invoice_id": number, "currency_symbol": string }`
- `POST /api/reminders/bulk`: Dispatch reminders for all unpaid invoices.
- `DELETE /api/reminders/:id`: Remove a reminder log entry.

## Error Handling
The API returns standard HTTP status codes and a consistent JSON error body:
```json
{
  "status": "error",
  "message": "Descriptive error message"
}
```
