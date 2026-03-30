"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyPassword } from "@/queries/verify";
import { VerifyPasswordSchema } from "@/validations/verify";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/Label";
import * as v from "valibot";

type Props = {
  slug: string;
  title: string;
  description?: string | null;
};

export function PasswordForm({ slug, title, description }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [expiredError, setExpiredError] = useState(false);

  const { mutate: verifyPassword, isPending, error } = useVerifyPassword(slug);

  useEffect(() => {
    if (searchParams.get("error") === "expired") {
      setExpiredError(true);
    }
  }, [searchParams]);

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setFieldError(null);
    setExpiredError(false);

    const parsed = v.safeParse(VerifyPasswordSchema, { password });
    if (!parsed.success) {
      setFieldError(parsed.issues[0].message);
      return;
    }

    verifyPassword(
      { password: parsed.output.password },
      {
        onSuccess: ({ token }) => {
          window.location.href = `/api/${slug}?token=${token}`;
        },
        onError: () => {
          setPassword("");
        },
      },
    );
  }

  const serverError = error?.message ?? null;
  const displayError = expiredError
    ? "Your session expired. Please enter the password again."
    : serverError;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-(--bg-base)">
      <div className="bg-(--bg-surface) border border-(--border) rounded-[20px] p-10 w-full max-w-105 flex flex-col items-center gap-6 shadow-[0_16px_48px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-center w-16 h-16 rounded-[18px] bg-linear-to-br from-[rgba(99,102,241,0.2)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.3)] text-(--accent)">
          <LockIcon />
        </div>

        <div className="text-center w-full">
          <h1 className="text-[1.375rem] font-bold text-(--text-primary) mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-[0.9rem] text-(--text-secondary) mb-3 leading-normal">
              {description}
            </p>
          )}
          <p className="text-sm text-(--text-muted) leading-normal">
            This link is password protected. Enter the password to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" required>
              Password
            </Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldError(null);
              }}
              placeholder="Enter password"
              autoFocus
              autoComplete="current-password"
              error={fieldError ?? undefined}
            />
          </div>

          {displayError && (
            <div
              className="bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] rounded-[10px] p-[0.75rem_1rem] text-sm text-[#fca5a5] leading-normal"
              role="alert"
            >
              {displayError}
            </div>
          )}

          <Button
            type="submit"
            loading={isPending}
            size="lg"
            className="w-full"
          >
            Unlock
          </Button>
        </form>

        <button
          className="bg-transparent border-none text-(--text-secondary) text-sm cursor-pointer p-0 transition-colors duration-150 no-underline hover:text-(--text-primary)"
          onClick={() => router.push("/")}
          type="button"
        >
          ← Back to links
        </button>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
