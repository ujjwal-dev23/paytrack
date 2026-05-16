import { useState, useEffect } from "preact/hooks";
import { createInvoice } from "../store/invoice";
import { fetchCustomers, customers, createCustomer } from "../store/customer";
import { Input } from "./Input";
import { Button } from "./Button";
import { Autocomplete } from "./Autocomplete";
import { currency } from "../store/settings";

interface InvoiceFormProps {
  onSuccess: () => void;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | number>("");

  // New Customer Inline State
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async () => {
    if (!newCustomerName || !newCustomerEmail) {
      setError("Please provide both name and email for the new customer");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const customer = await createCustomer({
        username: newCustomerName,
        email: newCustomerEmail,
      });
      if (customer) {
        setCustomerId(customer.id);
        setIsCreatingCustomer(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (isCreatingCustomer) {
      await handleCreateCustomer();
      return;
    }

    if (!customerId) {
      setError("Please select or create a customer");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      amount: Number(formData.get("amount")),
      customer_id: Number(customerId),
      due_date: formData.get("due_date") as string,
      status: "pending" as const,
    };

    try {
      await createInvoice(data);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const customerOptions = customers.value.map((c) => ({
    id: c.id,
    label: c.username,
    sublabel: c.email,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={`Amount (${currency.value.symbol})`}
        type="number"
        name="amount"
        step="0.01"
        required
        placeholder="100.00"
        disabled={isCreatingCustomer}
        className={isCreatingCustomer ? "opacity-60 transition-opacity" : "transition-opacity"}
      />

      {!isCreatingCustomer ? (
        <Autocomplete
          label="Customer"
          options={customerOptions}
          value={customerId}
          onSelect={(opt) => setCustomerId(opt.id)}
          onAddOne={(name) => {
            setIsCreatingCustomer(true);
            setNewCustomerName(name);
            setCustomerId("");
          }}
          placeholder="Search by username or email..."
          required
          name="customer_id"
        />
      ) : (
        <div className="bg-primary/5 rounded-custom border-primary/20 animate-in slide-in-from-top-2 space-y-3 border p-4 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-primary text-xs font-bold uppercase">New Customer Details</h3>
            <button
              type="button"
              onClick={() => setIsCreatingCustomer(false)}
              className="text-text-muted hover:text-text-main text-xs"
            >
              Cancel
            </button>
          </div>
          <Input
            label="Username"
            value={newCustomerName}
            onInput={(e) => setNewCustomerName((e.target as HTMLInputElement).value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={newCustomerEmail}
            onInput={(e) => setNewCustomerEmail((e.target as HTMLInputElement).value)}
            placeholder="customer@example.com"
            required
          />
          <p className="text-text-muted text-[10px]">
            This customer will be saved and automatically selected.
          </p>
          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={loading}>
              Create Customer & Continue
            </Button>
          </div>
        </div>
      )}

      <Input
        label="Due Date"
        type="date"
        name="due_date"
        defaultValue={new Date().toISOString().split("T")[0]}
        required
        disabled={isCreatingCustomer}
        className={isCreatingCustomer ? "opacity-60 transition-opacity" : "transition-opacity"}
      />

      {error && <p className="text-center text-xs text-red-500">{error}</p>}

      {!isCreatingCustomer && (
        <div className="pt-2">
          <Button type="submit" className="w-full" isLoading={loading}>
            Create Invoice
          </Button>
        </div>
      )}
    </form>
  );
}
