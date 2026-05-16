import { useState } from "preact/hooks";
import { createInvoice } from "../store/invoice";
import { Input } from "./Input";
import { Button } from "./Button";

interface InvoiceFormProps {
  onSuccess: () => void;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      amount: Number(formData.get("amount")),
      customer_id: Number(formData.get("customer_id")),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Amount ($)"
        type="number"
        name="amount"
        step="0.01"
        required
        placeholder="100.00"
      />
      <Input label="Customer ID" type="number" name="customer_id" required placeholder="123" />
      <Input label="Due Date" type="date" name="due_date" required />

      {error && <p className="text-center text-xs text-red-500">{error}</p>}

      <div className="pt-2">
        <Button type="submit" className="w-full" isLoading={loading}>
          Create Invoice
        </Button>
      </div>
    </form>
  );
}
