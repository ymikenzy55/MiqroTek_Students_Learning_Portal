import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "default" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  default: "bg-[var(--primary)] text-[var(--white)] hover:bg-[var(--primary-hover)] focus-visible:ring-[var(--primary)]",
  outline: "border border-[var(--border)] bg-[var(--white)] text-[var(--foreground)] hover:bg-[var(--surface)] focus-visible:ring-[var(--border)]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--surface)] focus-visible:ring-[var(--border)]",
  destructive: "bg-[var(--danger)] text-white hover:bg-red-800 focus-visible:ring-[var(--danger)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
