"use client";

import * as RadixToast from "@radix-ui/react-toast";
import { useEffect, useState } from "react";
import { toastStore, type Toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixToast.Provider swipeDirection="right">
      {children}
      <ToastViewport />
    </RadixToast.Provider>
  );
}

function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsub = toastStore.subscribe(setToasts);
    setToasts(toastStore.getToasts());
    return unsub;
  }, []);

  return (
    <>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => toastStore.remove(toast.id)}
        />
      ))}
      <RadixToast.Viewport className="fixed bottom-6 right-6 flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)] z-[200] list-none m-0 p-0 outline-none" />
    </>
  );
}

const variantToastClasses: Record<string, string> = {
  default: "border-l-[3px] border-l-[#6366f1]",
  success: "border-l-[3px] border-l-[#34d399]",
  error: "border-l-[3px] border-l-[#f87171]",
  warning: "border-l-[3px] border-l-[#fbbf24]",
};

const variantIconClasses: Record<string, string> = {
  default: "bg-[rgba(99,102,241,0.2)] text-[#818cf8]",
  success: "bg-[rgba(52,211,153,0.2)] text-[#34d399]",
  error: "bg-[rgba(248,113,113,0.2)] text-[#f87171]",
  warning: "bg-[rgba(251,191,36,0.2)] text-[#fbbf24]",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const variant = toast.variant ?? "default";

  return (
    <RadixToast.Root
      data-radix-toast-root
      className={cn(
        "bg-[#1e293b] border border-[#334155] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden toast-slide-in",
        variantToastClasses[variant]
      )}
      open={true}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      duration={5000}
    >
      <div className="flex items-start gap-3 p-[0.875rem_1rem]">
        <div
          className={cn(
            "flex items-center justify-center w-[22px] h-[22px] rounded-full text-[0.75rem] font-bold flex-shrink-0 mt-[1px]",
            variantIconClasses[variant]
          )}
          aria-hidden="true"
        >
          {variant === "success" && "✓"}
          {variant === "error" && "✕"}
          {variant === "warning" && "⚠"}
          {(variant === "default") && "ℹ"}
        </div>
        <div className="flex-1 min-w-0">
          <RadixToast.Title className="text-[0.9rem] font-semibold text-[#f1f5f9] m-0 leading-[1.4]">
            {toast.title}
          </RadixToast.Title>
          {toast.description && (
            <RadixToast.Description className="text-[0.8125rem] text-[#94a3b8] m-0 mt-[0.2rem] leading-normal">
              {toast.description}
            </RadixToast.Description>
          )}
        </div>
        <RadixToast.Close
          className="flex items-center justify-center w-5 h-5 border-none bg-transparent text-[#64748b] cursor-pointer text-[0.75rem] flex-shrink-0 rounded p-0 transition-colors duration-150 hover:text-[#f1f5f9]"
          aria-label="Dismiss"
        >
          ✕
        </RadixToast.Close>
      </div>
    </RadixToast.Root>
  );
}
