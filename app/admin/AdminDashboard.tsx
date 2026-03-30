"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { AdminLinkTable } from "@/components/admin/AdminLinkTable";
import { AdminUserPanel } from "@/components/admin/AdminUserForm";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogCloseButton,
} from "@/components/ui/Dialog";
import { useToast } from "@/hooks/useToast";
import Image from "next/image";
import { cn } from "@/lib/utils";
import * as v from "valibot";
import { ChangePasswordSchema } from "@/validations/auth";
import { api } from "@/lib/api";

type Tab = "links" | "users";
type Props = { session: Session };

export function AdminDashboard({ session }: Props) {
  const isSuperadmin = session.user?.role === "superadmin";
  const [activeTab, setActiveTab] = useState<Tab>("links");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Close drawer on route change / resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setDrawerOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const sidebarContent = (fullWidth = false) => (
    <>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-5 border-b border-(--border-muted) min-h-18.5">
        <Image
          src="/logo-setneg.svg"
          alt="Setneg Logo"
          width={34}
          height={34}
          className="shrink-0"
        />
        <span
          className={cn(
            "text-[0.9375rem] font-bold text-(--text-primary) whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200",
            fullWidth || sidebarOpen
              ? "opacity-100 max-w-xs"
              : "opacity-0 max-w-0",
          )}
        >
          Portal Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-2 py-3.5 flex-1">
        <NavItem
          active={activeTab === "links"}
          onClick={() => {
            setActiveTab("links");
            setDrawerOpen(false);
          }}
          label="Links"
          open={fullWidth || sidebarOpen}
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          }
        />
        {isSuperadmin && (
          <NavItem
            active={activeTab === "users"}
            onClick={() => {
              setActiveTab("users");
              setDrawerOpen(false);
            }}
            label="Users"
            open={fullWidth || sidebarOpen}
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
        )}
        <NavItem
          active={false}
          href="/"
          label="View Site"
          open={fullWidth || sidebarOpen}
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          }
        />
      </nav>

      {/* Footer */}
      <div className="px-2 py-3.5 border-t border-(--border-muted) flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-sm font-bold text-white shrink-0">
            {session.user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div
            className={cn(
              "flex flex-col min-w-0 overflow-hidden transition-[opacity,max-width] duration-200",
              fullWidth || sidebarOpen
                ? "opacity-100 max-w-xs"
                : "opacity-0 max-w-0",
            )}
          >
            <span className="text-sm font-semibold text-(--text-primary) whitespace-nowrap overflow-hidden text-ellipsis">
              {session.user?.name}
            </span>
            <span className="text-xs text-(--text-muted) capitalize">
              {session.user?.role}
            </span>
          </div>
        </div>
        {(fullWidth || sidebarOpen) ? (
          <div className="flex flex-col gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChangePasswordOpen(true)}
              className="w-full justify-center text-sm"
            >
              Change Password
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full justify-center text-sm"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setChangePasswordOpen(true)}
            className="w-full flex flex-col items-center gap-1 py-1.5 rounded-[9px] text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors"
            aria-label="Change Password"
          >
            <KeyIcon />
            <span className="text-[0.6rem] font-medium leading-tight text-center">Key</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-(--bg-base)">
      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
      {/* ── DESKTOP sidebar (md+) ─────────────────────────────── */}
      <div
        className={cn(
          "relative shrink-0 transition-[width] duration-200 hidden md:block",
          sidebarOpen ? "w-60" : "w-18",
        )}
      >
        <aside
          className={cn(
            "bg-(--bg-surface) border-r border-(--border-muted) flex flex-col sticky top-0 h-screen overflow-hidden transition-[width] duration-200",
            sidebarOpen ? "w-60" : "w-18",
          )}
        >
          {sidebarContent()}
        </aside>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="absolute -right-3.5 top-5.75 z-20 w-7 h-7 rounded-full bg-(--bg-surface) border border-(--border-muted) flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) hover:border-(--border) transition-colors shadow-sm"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "transition-transform duration-200",
              !sidebarOpen && "rotate-180",
            )}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* ── MOBILE top bar (< md) ─────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-(--bg-surface) border-b border-(--border-muted) flex items-center px-4 gap-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors"
          aria-label="Open menu"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Image
          src="/logo-setneg.svg"
          alt="Setneg Logo"
          width={28}
          height={28}
        />
        <span className="text-[0.9375rem] font-bold text-(--text-primary)">
          Portal Admin
        </span>
        <div className="ml-auto w-8 h-8 rounded-full bg-linear-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-sm font-bold text-white">
          {session.user?.name?.charAt(0).toUpperCase() ?? "A"}
        </div>
      </div>

      {/* ── MOBILE drawer overlay ─────────────────────────────── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-(--bg-surface) flex flex-col transition-transform duration-250 shadow-2xl",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-(--border-muted) shrink-0">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-setneg.svg"
              alt="Setneg Logo"
              width={28}
              height={28}
            />
            <span className="text-[0.9375rem] font-bold text-(--text-primary)">
              Portal Admin
            </span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors"
            aria-label="Close menu"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-2 py-3.5 flex-1 overflow-y-auto">
          <NavItem
            active={activeTab === "links"}
            onClick={() => {
              setActiveTab("links");
              setDrawerOpen(false);
            }}
            label="Links"
            open
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            }
          />
          {isSuperadmin && (
            <NavItem
              active={activeTab === "users"}
              onClick={() => {
                setActiveTab("users");
                setDrawerOpen(false);
              }}
              label="Users"
              open
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
          )}
          <NavItem
            active={false}
            href="/"
            label="View Site"
            open
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            }
          />
        </nav>
        <div className="px-3 py-4 border-t border-(--border-muted) flex flex-col gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-sm font-bold text-white shrink-0">
              {session.user?.name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-(--text-primary) truncate">
                {session.user?.name}
              </span>
              <span className="text-xs text-(--text-muted) capitalize">
                {session.user?.role}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setChangePasswordOpen(true); setDrawerOpen(false); }}
              className="flex-1 justify-center text-sm"
            >
              Change Password
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex-1 justify-center text-sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-x-auto md:pt-0 pt-14">
        <div className="p-5 md:p-8 max-w-275">
          {activeTab === "links" && <AdminLinkTable />}
          {activeTab === "users" && isSuperadmin && <AdminUserPanel />}
        </div>
      </main>
    </div>
  );
}

type NavItemProps = {
  active: boolean;
  onClick?: () => void;
  href?: string;
  label: string;
  open: boolean;
  icon: React.ReactNode;
};

function KeyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6" />
      <path d="M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  );
}

function getPasswordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak" };
  if (score < 5) return { score, label: "Medium" };
  return { score, label: "Strong" };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const { score, label } = getPasswordStrength(password);
  const bars = 3;
  const filled = score <= 2 ? 1 : score < 5 ? 2 : 3;
  const color =
    label === "Weak" ? "#f87171" : label === "Medium" ? "#fbbf24" : "#34d399";

  return (
    <div className="flex flex-col gap-1.5 mt-0.5">
      <div className="flex gap-1">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-200"
            style={{ backgroundColor: i < filled ? color : "var(--border-muted, #2a3a50)" }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color }}>
          {label}
        </p>
        <p className="text-xs text-(--text-muted)">
          {score < 5 ? "Use uppercase, lowercase, number & symbol" : ""}
        </p>
      </div>
    </div>
  );
}

type ChangePasswordDialogProps = {
  open: boolean;
  onClose: () => void;
};

function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = v.safeParse(ChangePasswordSchema, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      setError(parsed.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/admin/me/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast({ title: "Password changed successfully" });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-5 px-6 py-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <PasswordInput
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 chars, uppercase, number, symbol"
              />
              {newPassword && <PasswordStrengthIndicator password={newPassword} />}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
            {error && (
              <p className="text-sm text-[#f87171] -mt-1">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Change Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NavItem({ active, onClick, href, label, open, icon }: NavItemProps) {
  const cls = cn(
    "flex px-2.5 py-[0.6rem] rounded-[9px] text-[0.9rem] font-medium text-(--text-muted) bg-transparent border-none cursor-pointer transition-colors duration-150 no-underline hover:bg-(--bg-elevated) hover:text-(--text-primary) w-full",
    active &&
      "bg-[rgba(99,102,241,0.12)] text-[#818cf8] hover:bg-[rgba(99,102,241,0.18)] hover:text-[#818cf8]",
    open ? "items-center gap-2.5" : "flex-col items-center gap-1",
  );

  const content = open ? (
    <>
      <span className="shrink-0">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </>
  ) : (
    <>
      <span className="shrink-0">{icon}</span>
      <span className="text-[0.6rem] font-medium leading-tight text-center w-full">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return (
    <button className={cls} onClick={onClick}>
      {content}
    </button>
  );
}
