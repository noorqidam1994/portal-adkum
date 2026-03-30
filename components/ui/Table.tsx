import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Table = forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, children, ...props }, ref) => (
  <div className="w-full overflow-x-auto rounded-xl border border-(--border)">
    <table
      ref={ref}
      className={cn("w-full border-collapse text-[0.9rem]", className)}
      {...props}
    >
      {children}
    </table>
  </div>
));
Table.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-(--bg-elevated)", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
));
TableBody.displayName = "TableBody";

export const TableRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-(--border-muted) transition-colors duration-100 last:border-0 hover:bg-(--bg-elevated)",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-4 py-3 text-left text-[0.8125rem] font-semibold text-(--text-muted) uppercase tracking-[0.04em] whitespace-nowrap border-b border-(--border)",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-4 py-3.5 text-(--text-primary) align-middle", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";
