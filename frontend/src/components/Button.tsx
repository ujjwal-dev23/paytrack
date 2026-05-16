import type { JSX } from "preact";

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  isLoading,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: "btn-primary",
    secondary: "px-4 py-2 border border-border text-text-main rounded-custom hover:bg-bg-main",
    danger: "px-4 py-2 bg-red-600 text-white rounded-custom hover:bg-red-700",
  };

  return (
    <button
      className={`${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
