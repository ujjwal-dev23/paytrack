import { signal } from "@preact/signals";

export type Currency = {
  symbol: string;
  code: string;
  label: string;
};

export const CURRENCIES: Currency[] = [
  { symbol: "₹", code: "INR", label: "Indian Rupee" },
  { symbol: "$", code: "USD", label: "US Dollar" },
  { symbol: "€", code: "EUR", label: "Euro" },
  { symbol: "£", code: "GBP", label: "Pound" },
];

// Initialize from localStorage if available, default to INR
const savedCurrencyCode = localStorage.getItem("app_currency");
const initialCurrency = CURRENCIES.find((c) => c.code === savedCurrencyCode) || CURRENCIES[0];

export const currency = signal<Currency>(initialCurrency);

export const setCurrency = (code: string) => {
  const newCurrency = CURRENCIES.find((c) => c.code === code);
  if (newCurrency) {
    currency.value = newCurrency;
    localStorage.setItem("app_currency", code);
  }
};

export const formatAmount = (amount: number) => {
  return `${currency.value.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
