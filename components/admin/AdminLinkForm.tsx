"use client";

import { useState, useEffect, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useCreateLink, useUpdateLink, type AdminLink } from "@/queries/links";
import { CreateLinkSchema, UpdateLinkSchema } from "@/validations/link";
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
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import * as v from "valibot";

type FormMode = "create" | "edit";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: FormMode;
  link?: AdminLink | null;
  /** When set, the created link will be a child of this parent */
  parentId?: string | null;
  parentTitle?: string | null;
};

type FormState = {
  title: string;
  description: string;
  slug: string;
  targetUrl: string;
  imageUrl: string | null;
  isProtected: boolean;
  password: string;
  isActive: boolean;
  sortOrder: string;
};

const defaultForm: FormState = {
  title: "",
  description: "",
  slug: "",
  targetUrl: "",
  imageUrl: null,
  isProtected: false,
  password: "",
  isActive: true,
  sortOrder: "0",
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export function AdminLinkForm({ open, onOpenChange, mode, link, parentId, parentTitle }: Props) {
  const { toast } = useToast();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && link) {
      const derivedSlug = link.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);
      setForm({
        title: link.title,
        description: link.description ?? "",
        slug: derivedSlug,
        targetUrl: link.targetUrl,
        imageUrl: link.imageUrl ?? null,
        isProtected: link.isProtected,
        password: "",
        isActive: link.isActive,
        sortOrder: String(link.sortOrder),
      });
      setImagePreview(link.imageUrl ?? null);
    } else {
      setForm(defaultForm);
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
  }, [mode, link, open]);

  function set(field: keyof FormState, value: string | boolean | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"] },
    maxSize: 2 * 1024 * 1024,
    multiple: false,
  });

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    set("imageUrl", null);
  }

  function handleTitleChange(value: string) {
    set("title", value);
    const autoSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
    set("slug", autoSlug);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    let resolvedImageUrl = form.imageUrl;
    if (imageFile) {
      try {
        setIsUploading(true);
        const blob = await upload(imageFile.name, imageFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        resolvedImageUrl = blob.url;
      } catch {
        toast({ title: "Failed to upload image", variant: "error" });
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const payload = {
      title: form.title,
      description: form.description || undefined,
      slug: form.slug,
      targetUrl: form.targetUrl,
      imageUrl: resolvedImageUrl ?? undefined,
      isProtected: form.isProtected,
      password: form.password || undefined,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
      parentId: parentId ?? null,
    };

    if (mode === "create") {
      const parsed = v.safeParse(CreateLinkSchema, payload);
      if (!parsed.success) {
        const fieldErrors: FieldErrors = {};
        for (const issue of parsed.issues) {
          const key = issue.path?.[0]?.key as keyof FormState | undefined;
          if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
        return;
      }

      createLink.mutate(parsed.output, {
        onSuccess: () => {
          toast({ title: "Link created", variant: "success" });
          onOpenChange(false);
        },
        onError: (err) => {
          toast({ title: err.message, variant: "error" });
        },
      });
    } else if (mode === "edit" && link) {
      const parsed = v.safeParse(UpdateLinkSchema, payload);
      if (!parsed.success) {
        const fieldErrors: FieldErrors = {};
        for (const issue of parsed.issues) {
          const key = issue.path?.[0]?.key as keyof FormState | undefined;
          if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
        return;
      }

      updateLink.mutate(
        { id: link.id, data: parsed.output },
        {
          onSuccess: () => {
            toast({ title: "Link updated", variant: "success" });
            onOpenChange(false);
          },
          onError: (err) => {
            toast({ title: err.message, variant: "error" });
          },
        },
      );
    }
  }

  const isLoading = createLink.isPending || updateLink.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? parentId
                ? `Add Child to "${parentTitle ?? "Link"}"`
                : "Create Link"
              : "Edit Link"}
          </DialogTitle>
          <DialogCloseButton />
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="p-[1.25rem_1.5rem] flex flex-col gap-4.5">
            <div className="flex flex-col gap-[0.4rem]">
              <Label htmlFor="lf-title" required>
                Title
              </Label>
              <Input
                id="lf-title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Document Title"
                error={errors.title}
              />
              {form.slug && (
                <span className="text-[0.8rem] text-(--text-muted) font-mono">
                  {form.slug}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-[0.4rem]">
              <Label htmlFor="lf-description">Description</Label>
              <Input
                id="lf-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Optional description"
                error={errors.description}
              />
            </div>

            {!(mode === "edit" && link && link.children.length > 0) && (
              <div className="flex flex-col gap-[0.4rem]">
                <Label htmlFor="lf-url" required>
                  Target URL (Google Drive)
                </Label>
                <Input
                  id="lf-url"
                  type="url"
                  value={form.targetUrl}
                  onChange={(e) => set("targetUrl", e.target.value)}
                  placeholder="https://drive.google.com/..."
                  error={errors.targetUrl}
                />
              </div>
            )}

            <div className="flex flex-col gap-[0.4rem]">
              <Label>Image</Label>
              {imagePreview ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-(--border) bg-(--bg-elevated)">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[rgba(0,0,0,0.6)] text-white text-xs flex items-center justify-center hover:bg-[rgba(0,0,0,0.8)] transition-colors"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={cn(
                    "flex flex-col items-center justify-center h-24 rounded-lg border border-dashed bg-(--bg-elevated) text-(--text-muted) text-sm cursor-pointer transition-colors",
                    isDragActive
                      ? "border-(--accent) text-(--accent) bg-(--accent)/5"
                      : "border-(--border) hover:border-(--accent) hover:text-(--accent)",
                  )}
                >
                  <input {...getInputProps()} />
                  <span>{isDragActive ? "Drop image here" : "Click or drag image here"}</span>
                  <span className="text-xs mt-1 opacity-60">PNG, JPG, WebP — max 2 MB</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
              <div className="flex flex-col gap-[0.4rem]">
                <Label htmlFor="lf-order">Sort Order</Label>
                <Input
                  id="lf-order"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => set("sortOrder", e.target.value)}
                  error={errors.sortOrder}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <Label>Active</Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  className={cn(
                    "relative inline-flex items-center w-11 h-6 rounded-full border-none cursor-pointer shrink-0 transition-colors duration-200 p-0",
                    form.isActive ? "bg-(--accent)" : "bg-(--border)",
                  )}
                  onClick={() => set("isActive", !form.isActive)}
                >
                  <span
                    className={cn(
                      "absolute left-0.75 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
                      form.isActive && "translate-x-5",
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="h-px bg-(--border) my-1" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Password Protection</Label>
                <p className="text-[0.8125rem] text-(--text-muted) mt-[0.2rem]">
                  Require a password before accessing this link
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isProtected}
                className={cn(
                  "relative inline-flex items-center w-11 h-6 rounded-full border-none cursor-pointer shrink-0 transition-colors duration-200 p-0",
                  form.isProtected ? "bg-(--accent)" : "bg-(--border)",
                )}
                onClick={() => set("isProtected", !form.isProtected)}
              >
                <span
                  className={cn(
                    "absolute left-0.75 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
                    form.isProtected && "translate-x-5",
                  )}
                />
              </button>
            </div>

            {form.isProtected && (
              <div className="flex flex-col gap-[0.4rem]">
                <Label htmlFor="lf-password" required={mode === "create"}>
                  {mode === "edit"
                    ? "New Password (leave blank to keep)"
                    : "Password"}
                </Label>
                <PasswordInput
                  id="lf-password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  error={errors.password}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {mode === "create" ? "Create Link" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
