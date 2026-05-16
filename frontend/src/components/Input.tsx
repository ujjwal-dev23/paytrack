import type { JSX } from "preact";

type InputProps = JSX.IntrinsicElements["input"] & {
  label?: string;
  error?: string | null;
};

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="label">{label}</label>}
      <input className={`input-field ${error ? "border-red-500" : ""}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
