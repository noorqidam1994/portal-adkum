"use client";

import { useState, useCallback } from "react";

export type ToastVariant = "default" | "success" | "error" | "warning";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

let toastIdCounter = 0;

// Simple in-memory toast store with event emitter pattern
type ToastListener = (toasts: Toast[]) => void;

class ToastStore {
  private toasts: Toast[] = [];
  private listeners: ToastListener[] = [];

  subscribe(listener: ToastListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  add(toast: Omit<Toast, "id">) {
    const id = String(++toastIdCounter);
    const newToast: Toast = { id, ...toast };
    this.toasts = [...this.toasts, newToast];
    this.notify();
    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  getToasts() {
    return this.toasts;
  }

  private notify() {
    this.listeners.forEach((l) => l(this.toasts));
  }
}

export const toastStore = new ToastStore();

export function useToast() {
  const toast = useCallback(
    (payload: Omit<Toast, "id">) => {
      const id = toastStore.add(payload);
      // Auto-dismiss after 5 seconds
      setTimeout(() => toastStore.remove(id), 5000);
    },
    []
  );

  return { toast };
}
