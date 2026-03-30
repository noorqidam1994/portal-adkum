"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import {
  useAdminLinks,
  useDeleteLink,
  useToggleLinkActive,
  type AdminLink,
} from "@/queries/links";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from "@/components/ui/Dialog";
import { AdminLinkForm } from "./AdminLinkForm";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export function AdminLinkTable() {
  const { data: links, isLoading, error } = useAdminLinks();
  const deleteLink = useDeleteLink();
  const toggleActive = useToggleLinkActive();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminLink | null>(null);
  const [addChildTarget, setAddChildTarget] = useState<AdminLink | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleToggleActive(link: AdminLink) {
    toggleActive.mutate(
      { id: link.id, isActive: !link.isActive },
      {
        onSuccess: () =>
          toast({ title: `Link ${link.isActive ? "disabled" : "enabled"}`, variant: "success" }),
        onError: (err) => toast({ title: err.message, variant: "error" }),
      },
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteLink.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast({ title: "Link deleted", variant: "success" });
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast({ title: err.message, variant: "error" });
        setDeleteTarget(null);
      },
    });
  }

  if (isLoading && !links) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[1.125rem] font-semibold text-(--text-primary) m-0">Links</h2>
          <Button size="sm" disabled>+ New Link</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>No</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Protected</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell />
                <TableCell><div className="h-4 w-4 rounded skeleton-shimmer" /></TableCell>
                <TableCell><div className="h-10 w-10 rounded skeleton-shimmer" /></TableCell>
                <TableCell>
                  <div className="h-4 w-40 rounded skeleton-shimmer mb-1.5" />
                  <div className="h-3 w-56 rounded skeleton-shimmer" />
                </TableCell>
                <TableCell><div className="h-5 w-48 rounded skeleton-shimmer" /></TableCell>
                <TableCell><div className="h-5 w-20 rounded-full skeleton-shimmer" /></TableCell>
                <TableCell><div className="h-4 w-6 rounded skeleton-shimmer" /></TableCell>
                <TableCell><div className="h-5.5 w-10 rounded-full skeleton-shimmer" /></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <div className="h-7 w-12 rounded skeleton-shimmer" />
                    <div className="h-7 w-14 rounded skeleton-shimmer" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-(--error) py-12 text-[0.9375rem]">
        Failed to load links: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.125rem] font-semibold text-(--text-primary) m-0">Links</h2>
        <Button onClick={() => setCreateOpen(true)} size="sm">+ New Link</Button>
      </div>

      {!links?.length ? (
        <div className="text-center text-(--text-muted) py-12 text-[0.9375rem]">
          No links yet.{" "}
          <button
            className="bg-transparent border-none text-(--accent) cursor-pointer underline p-0 hover:text-(--accent-hover)"
            onClick={() => setCreateOpen(true)}
          >
            Create your first link
          </button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>No</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Protected</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link, idx) => (
              <Fragment key={link.id}>
                {/* ── Parent row ── */}
                <TableRow>
                  {/* Expand toggle */}
                  <TableCell className="w-8 pr-0">
                    {link.children.length > 0 ? (
                      <button
                        onClick={() => toggleExpand(link.id)}
                        className="w-6 h-6 flex items-center justify-center rounded text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors"
                        aria-label={expandedIds.has(link.id) ? "Collapse" : "Expand"}
                      >
                        <svg
                          width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round"
                          className={cn("transition-transform duration-150", expandedIds.has(link.id) && "rotate-90")}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-[#475569] text-sm w-10">
                    {idx + 1}
                    {link.children.length > 0 && (
                      <span className="ml-1.5 text-[0.65rem] text-(--text-muted)">
                        ({link.children.length})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="w-12">
                    <LinkImage link={link} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-(--text-primary) text-[0.9375rem]">{link.title}</div>
                    {link.description && (
                      <div className="text-[0.8rem] text-(--text-muted) mt-[0.15rem]">{link.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <SlugBadge slug={link.slug} />
                  </TableCell>
                  <TableCell>
                    <ProtectedBadge isProtected={link.isProtected} />
                  </TableCell>
                  <TableCell className="tabular-nums text-(--text-secondary) text-[0.9rem]">
                    {link.clickCount}
                  </TableCell>
                  <TableCell>
                    <ActiveToggle link={link} onToggle={handleToggleActive} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center flex-wrap">
                      <Button size="sm" variant="secondary" onClick={() => setAddChildTarget(link)}>
                        + Child
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditTarget(link)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget(link)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* ── Child rows (shown when expanded) ── */}
                {expandedIds.has(link.id) &&
                  link.children.map((child, ci) => (
                    <TableRow key={child.id} className="bg-(--bg-elevated)/40">
                      <TableCell />
                      <TableCell className="text-[#475569] text-sm pl-6">
                        {idx + 1}.{ci + 1}
                      </TableCell>
                      <TableCell className="w-12">
                        <LinkImage link={child} small />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-(--text-muted) text-xs">↳</span>
                          <div>
                            <div className="font-medium text-(--text-primary) text-[0.9rem]">{child.title}</div>
                            {child.description && (
                              <div className="text-[0.75rem] text-(--text-muted) mt-[0.1rem]">{child.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <SlugBadge slug={child.slug} />
                      </TableCell>
                      <TableCell>
                        <ProtectedBadge isProtected={child.isProtected} />
                      </TableCell>
                      <TableCell className="tabular-nums text-(--text-secondary) text-[0.9rem]">
                        {child.clickCount}
                      </TableCell>
                      <TableCell>
                        <ActiveToggle link={child} onToggle={handleToggleActive} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          <Button size="sm" variant="secondary" onClick={() => setEditTarget(child)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(child)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create top-level link */}
      <AdminLinkForm open={createOpen} onOpenChange={setCreateOpen} mode="create" />

      {/* Add child link */}
      <AdminLinkForm
        open={Boolean(addChildTarget)}
        onOpenChange={(open) => !open && setAddChildTarget(null)}
        mode="create"
        parentId={addChildTarget?.id}
        parentTitle={addChildTarget?.title}
      />

      {/* Edit link (parent or child) */}
      <AdminLinkForm
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
        mode="edit"
        link={editTarget}
      />

      {/* Delete confirmation */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <div className="p-[1.25rem_1.5rem]">
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
              {deleteTarget && deleteTarget.children?.length > 0 && (
                <> This will also delete its <strong>{deleteTarget.children.length} child link{deleteTarget.children.length > 1 ? "s" : ""}</strong>.</>
              )}{" "}
              This action cannot be undone.
            </DialogDescription>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteLink.isPending} onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Small shared sub-components ─────────────────────────────────────────────

function LinkImage({ link, small }: { link: AdminLink; small?: boolean }) {
  const size = small ? "w-8 h-8" : "w-10 h-10";
  return link.imageUrl ? (
    <div className={cn("relative rounded overflow-hidden bg-(--bg-elevated) shrink-0", size)}>
      <Image src={link.imageUrl} alt={link.title} fill className="object-cover" unoptimized />
    </div>
  ) : (
    <div className={cn("rounded bg-(--bg-elevated) flex items-center justify-center text-(--text-muted) text-xs", size)}>
      —
    </div>
  );
}

function SlugBadge({ slug }: { slug: string }) {
  return (
    <code className="text-[0.8125rem] text-(--text-secondary) bg-(--bg-elevated) px-2 py-[0.2rem] rounded-[5px] font-mono">
      {slug}
    </code>
  );
}

function ProtectedBadge({ isProtected }: { isProtected: boolean }) {
  return isProtected ? (
    <span className="text-[0.8rem] text-[#fbbf24] bg-[rgba(251,191,36,0.1)] px-[0.6rem] py-1 rounded-full whitespace-nowrap">
      🔒 Protected
    </span>
  ) : (
    <span className="text-[0.8rem] text-[#34d399] bg-[rgba(52,211,153,0.1)] px-[0.6rem] py-1 rounded-full">
      Public
    </span>
  );
}

function ActiveToggle({ link, onToggle }: { link: AdminLink; onToggle: (link: AdminLink) => void }) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center w-10 h-5.5 rounded-full border-none cursor-pointer shrink-0 transition-colors duration-200 p-0",
        link.isActive ? "bg-(--accent)" : "bg-(--border)",
      )}
      role="switch"
      aria-checked={link.isActive}
      onClick={() => onToggle(link)}
      title={link.isActive ? "Disable link" : "Enable link"}
    >
      <span
        className={cn(
          "absolute left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
          link.isActive && "translate-x-4.5",
        )}
      />
    </button>
  );
}
