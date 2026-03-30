import * as RadixLabel from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export type LabelProps = React.ComponentPropsWithoutRef<
  typeof RadixLabel.Root
> & {
  required?: boolean;
};

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <RadixLabel.Root
      className={cn(
        "block text-sm font-medium text-[#cbd5e1] cursor-pointer leading-[1.4]",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-[#f87171]" aria-hidden="true">
          {" "}
          *
        </span>
      )}
    </RadixLabel.Root>
  );
}
