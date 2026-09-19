import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
};

export function Button({ variant = "primary", loading, children, className = "", ...props }: Props) {
  const styles = {
    primary:
      "bg-gradient-to-r from-amber-400 to-amber-500 text-rail-950 hover:from-amber-300 hover:to-amber-400",
    secondary:
      "border border-white/15 bg-white/5 text-white hover:bg-white/10",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
    ghost: "text-sky-100 hover:bg-white/5",
  }[variant];

  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
