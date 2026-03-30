"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoginSchema } from "@/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/Label";
import Image from "next/image";
import * as v from "valibot";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const parsed = v.safeParse(LoginSchema, { email, password });
    if (!parsed.success) {
      const fe: { email?: string; password?: string } = {};
      for (const issue of parsed.issues) {
        const key = issue.path?.[0]?.key as "email" | "password" | undefined;
        if (key && !fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: parsed.output.email,
        password: parsed.output.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Invalid email or password. Please try again.");
        setPassword("");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-(--bg-base) bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.08)_0%,transparent_60%)]">
      <div className="bg-(--bg-surface) border border-(--border) rounded-[20px] p-10 w-full max-w-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-2">
            <Image
              src="/logo-setneg.svg"
              alt="Setneg Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain drop-shadow-lg"
              priority
              unoptimized
            />
          </div>
          <h1 className="text-[1.375rem] font-bold text-(--text-primary) m-0">
            Admin Login
          </h1>
          <p className="text-[0.9rem] text-(--text-secondary) m-0">
            Sign in to manage your portal
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4.5"
          noValidate
        >
          <div className="flex flex-col gap-[0.4rem]">
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="admin@example.com"
              autoComplete="email"
              autoFocus
              error={errors.email}
            />
          </div>

          <div className="flex flex-col gap-[0.4rem]">
            <Label htmlFor="password" required>
              Password
            </Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined }));
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password}
            />
          </div>

          {serverError && (
            <div
              className="bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] rounded-[10px] p-[0.75rem_1rem] text-sm text-[#fca5a5] leading-normal"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            loading={isLoading}
            size="lg"
            className="w-full mt-1"
          >
            Sign In
          </Button>
        </form>
      </div>
    </main>
  );
}
