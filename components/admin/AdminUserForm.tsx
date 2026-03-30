"use client";

import { useState, useEffect } from "react";
import {
  useAdminUsers,
  useCreateUser,
  useUpdateUser,
  type AdminUser,
} from "@/queries/admin";
import { CreateUserSchema, UpdateUserSchema } from "@/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import * as v from "valibot";

export function AdminUserPanel() {
  const { data: users, isLoading } = useAdminUsers();
  const updateUser = useUpdateUser();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);

  function handleToggleActive(user: AdminUser) {
    updateUser.mutate(
      { id: user.id, data: { isActive: !user.isActive } },
      {
        onSuccess: () =>
          toast({
            title: `User ${user.isActive ? "disabled" : "enabled"}`,
            variant: "success",
          }),
        onError: (err) => toast({ title: err.message, variant: "error" }),
      },
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.125rem] font-semibold text-[#f1f5f9] m-0">
          Admin Users
        </h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          + New User
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-[#64748b] py-12 text-[0.9375rem]">
          Loading users...
        </div>
      ) : !users?.length ? (
        <div className="text-center text-[#64748b] py-12 text-[0.9375rem]">
          No users found.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-(--text-primary)">
                  {user.name}
                </TableCell>
                <TableCell className="text-(--text-primary) text-[0.9rem]">
                  {user.email}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      user.role === "superadmin"
                        ? "text-[0.8rem] text-[#c084fc] bg-[rgba(192,132,252,0.12)] px-[0.6rem] py-1 rounded-full capitalize"
                        : "text-[0.8rem] text-[#60a5fa] bg-[rgba(96,165,250,0.12)] px-[0.6rem] py-1 rounded-full capitalize"
                    }
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    className={cn(
                      "relative inline-flex items-center w-10 h-5.5 rounded-full border-none cursor-pointer shrink-0 transition-colors duration-200 p-0",
                      user.isActive ? "bg-[#6366f1]" : "bg-[#334155]",
                    )}
                    role="switch"
                    aria-checked={user.isActive}
                    onClick={() => handleToggleActive(user)}
                  >
                    <span
                      className={cn(
                        "absolute left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
                        user.isActive && "translate-x-4.5",
                      )}
                    />
                  </button>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditTarget(user)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditUserDialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
        user={editTarget}
      />
    </div>
  );
}

// ── Create User Dialog ──────────────────────────────────────────────────────

function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createUser = useCreateUser();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "superadmin",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setForm({ name: "", email: "", password: "", role: "admin" });
      setErrors({});
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = v.safeParse(CreateUserSchema, form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.issues) {
        const key = String(issue.path?.[0]?.key ?? "");
        if (key && !fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      return;
    }

    createUser.mutate(parsed.output, {
      onSuccess: () => {
        toast({ title: "User created", variant: "success" });
        onOpenChange(false);
      },
      onError: (err) => toast({ title: err.message, variant: "error" }),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Admin User</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-[1.25rem_1.5rem] flex flex-col gap-4.5">
            <div className="flex flex-col gap-[0.4rem]">
              <Label htmlFor="cu-name" required>
                Name
              </Label>
              <Input
                id="cu-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                error={errors.name}
              />
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <Label htmlFor="cu-email" required>
                Email
              </Label>
              <Input
                id="cu-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                error={errors.email}
              />
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <Label htmlFor="cu-password" required>
                Password
              </Label>
              <PasswordInput
                id="cu-password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                autoComplete="new-password"
                error={errors.password}
              />
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <Label htmlFor="cu-role" required>
                Role
              </Label>
              <select
                id="cu-role"
                className="h-10.5 px-3.5 bg-[#0f172a] border-[1.5px] border-[#334155] rounded-[10px] text-[#f1f5f9] text-[0.9375rem] outline-none cursor-pointer transition-all duration-150 w-full focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]"
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    role: e.target.value as "admin" | "superadmin",
                  }))
                }
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createUser.isPending}>
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit User Dialog ────────────────────────────────────────────────────────

function EditUserDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: AdminUser | null;
}) {
  const updateUser = useUpdateUser();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    password: "",
    role: "admin" as "admin" | "superadmin",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) setForm({ name: user.name, password: "", role: user.role });
    else setErrors({});
  }, [user]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const payload: Record<string, unknown> = {
      name: form.name,
      role: form.role,
    };
    if (form.password) payload.password = form.password;

    const parsed = v.safeParse(UpdateUserSchema, payload);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.issues) {
        const key = String(issue.path?.[0]?.key ?? "");
        if (key && !fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      return;
    }

    updateUser.mutate(
      { id: user.id, data: parsed.output },
      {
        onSuccess: () => {
          toast({ title: "User updated", variant: "success" });
          onOpenChange(false);
        },
        onError: (err) => toast({ title: err.message, variant: "error" }),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-[1.25rem_1.5rem] flex flex-col gap-4.5">
            <div className="flex flex-col gap-[0.4rem]">
              <Label htmlFor="eu-name" required>
                Name
              </Label>
              <Input
                id="eu-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                error={errors.name}
              />
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <Label htmlFor="eu-password">New Password</Label>
              <PasswordInput
                id="eu-password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
                error={errors.password}
              />
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <Label htmlFor="eu-role" required>
                Role
              </Label>
              <select
                id="eu-role"
                className="h-10.5 px-3.5 bg-[#0f172a] border-[1.5px] border-[#334155] rounded-[10px] text-[#f1f5f9] text-[0.9375rem] outline-none cursor-pointer transition-all duration-150 w-full focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]"
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    role: e.target.value as "admin" | "superadmin",
                  }))
                }
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={updateUser.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
