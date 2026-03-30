"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogPortal({ children }: { children: React.ReactNode }) {
  return <RadixDialog.Portal>{children}</RadixDialog.Portal>;
}

export function DialogOverlay() {
  return (
    <RadixDialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-xs z-100 dialog-overlay-anim" />
  );
}

export function DialogContent({
  children,
  className,
  ...props
}: RadixDialog.DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <RadixDialog.Content
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-101 bg-(--bg-surface) border border-(--border) rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-[90vw] max-w-130 max-h-[85vh] overflow-y-auto dialog-content-anim focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </DialogPortal>
  );
}

export function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-5 border-b border-(--border)",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 px-6 py-4 border-t border-(--border)",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Title
      className={cn(
        "text-[1.0625rem] font-semibold text-(--text-primary) m-0",
        className,
      )}
    >
      {children}
    </RadixDialog.Title>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Description
      className={cn(
        "text-sm text-(--text-secondary) m-0 leading-normal",
        className,
      )}
    >
      {children}
    </RadixDialog.Description>
  );
}

export function DialogCloseButton() {
  return (
    <RadixDialog.Close
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-(--text-muted) cursor-pointer transition-all duration-150 shrink-0 hover:bg-(--bg-elevated) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-(--accent) focus-visible:outline-offset-2"
      aria-label="Close"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="2" y1="2" x2="14" y2="14" />
        <line x1="14" y1="2" x2="2" y2="14" />
      </svg>
    </RadixDialog.Close>
  );
}
