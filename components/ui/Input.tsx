import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      <input
        ref={ref}
        className={cn(
          "w-full h-10.5 px-3.5 bg-(--bg-base) border-[1.5px] border-(--border) rounded-[10px] text-(--text-primary) text-[0.9375rem] outline-none transition-all duration-150 box-border",
          "placeholder:text-(--text-secondary)",
          "focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error &&
            "border-[#f87171] focus:border-[#f87171] focus:shadow-[0_0_0_3px_rgba(248,113,113,0.2)]",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && (
        <span className="text-[0.8125rem] text-(--error) m-0" role="alert">
          {error}
        </span>
      )}
    </div>
  ),
);

Input.displayName = "Input";
