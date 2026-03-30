import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#6366f1] text-white border-[#6366f1] hover:bg-[#4f46e5] hover:border-[#4f46e5]",
  secondary:
    "bg-(--bg-surface) text-(--text-primary) border-(--border) hover:bg-(--bg-elevated) hover:border-(--text-muted)",
  ghost:
    "bg-transparent text-(--text-secondary) border-transparent hover:bg-(--bg-elevated) hover:text-(--text-primary)",
  danger:
    "bg-transparent text-[#f87171] border-[#f87171] hover:bg-[rgba(248,113,113,0.12)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[0.8125rem] rounded-lg",
  md: "h-[42px] px-5 text-[0.9375rem]",
  lg: "h-[52px] px-7 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      asChild = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] border border-transparent cursor-pointer transition-all duration-150 whitespace-nowrap no-underline outline-none",
          "focus-visible:outline focus-visible:outline-[#6366f1] focus-visible:outline-offset-2",
          "active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          loading && "relative pointer-events-none",
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
              aria-hidden="true"
            />
            <span className="opacity-60">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";
