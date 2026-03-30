import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateLinkInput, UpdateLinkInput } from "@/validations/link";
import { api } from "@/lib/api";

export type PublicLink = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  isProtected: boolean;
  isActive: boolean;
  sortOrder: number;
  clickCount: number;
  parentId: string | null;
  children: PublicLink[];
};

export type AdminLink = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  isProtected: boolean;
  isActive: boolean;
  sortOrder: number;
  clickCount: number;
  parentId: string | null;
  targetUrl: string;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
  children: AdminLink[];
};

export const linkKeys = {
  all: ["links"] as const,
  public: () => [...linkKeys.all, "public"] as const,
  admin: () => [...linkKeys.all, "admin"] as const,
  detail: (id: string) => [...linkKeys.all, "detail", id] as const,
};

// ── Public Queries ──────────────────────────────────────────────────────────

export function usePublicLinks() {
  return useQuery<PublicLink[]>({
    queryKey: linkKeys.public(),
    queryFn: async () => {
      const { data } = await api.get<PublicLink[]>("/api/links");
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
}

// ── Admin Queries ───────────────────────────────────────────────────────────

export function useAdminLinks() {
  return useQuery<AdminLink[]>({
    queryKey: linkKeys.admin(),
    queryFn: async () => {
      const { data } = await api.get<AdminLink[]>("/api/admin/links");
      return data;
    },
  });
}

export function useLinkDetail(id: string) {
  return useQuery<AdminLink>({
    queryKey: linkKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<AdminLink>(`/api/links/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

// ── Admin Mutations ─────────────────────────────────────────────────────────

function makeTempLink(data: CreateLinkInput): AdminLink {
  return {
    id: `temp-${Date.now()}`,
    title: data.title,
    description: data.description ?? null,
    slug: data.slug,
    targetUrl: data.targetUrl,
    imageUrl: data.imageUrl ?? null,
    isProtected: data.isProtected ?? false,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    clickCount: 0,
    parentId: data.parentId ?? null,
    hasPassword: Boolean(data.password),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    children: [],
  };
}

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLinkInput) => {
      const { data: json } = await api.post<AdminLink>("/api/links", data);
      return json;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: linkKeys.admin() });
      const previousLinks = queryClient.getQueryData<AdminLink[]>(linkKeys.admin());
      const temp = makeTempLink(data);

      queryClient.setQueryData<AdminLink[]>(linkKeys.admin(), (old = []) => {
        if (data.parentId) {
          return old.map((link) =>
            link.id === data.parentId
              ? { ...link, children: [...link.children, temp] }
              : link,
          );
        }
        return [...old, temp];
      });
      return { previousLinks };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(linkKeys.admin(), context?.previousLinks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.all });
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLinkInput }) => {
      const { data: json } = await api.put<AdminLink>(`/api/links/${id}`, data);
      return json;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: linkKeys.admin() });
      const previousLinks = queryClient.getQueryData<AdminLink[]>(linkKeys.admin());

      queryClient.setQueryData<AdminLink[]>(linkKeys.admin(), (old = []) =>
        old.map((link) => {
          if (link.id === id) return { ...link, ...data, updatedAt: new Date().toISOString() };
          return {
            ...link,
            children: link.children.map((child) =>
              child.id === id
                ? { ...child, ...data, updatedAt: new Date().toISOString() }
                : child,
            ),
          };
        }),
      );
      return { previousLinks };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(linkKeys.admin(), context?.previousLinks);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: linkKeys.all });
      queryClient.invalidateQueries({ queryKey: linkKeys.detail(id) });
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/api/links/${id}`);
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: linkKeys.admin() });
      const previousLinks = queryClient.getQueryData<AdminLink[]>(linkKeys.admin());

      queryClient.setQueryData<AdminLink[]>(linkKeys.admin(), (old = []) =>
        old
          .map((link) => ({
            ...link,
            children: link.children.filter((child) => child.id !== id),
          }))
          .filter((link) => link.id !== id),
      );
      return { previousLinks };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(linkKeys.admin(), context?.previousLinks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.all });
    },
  });
}

export function useToggleLinkActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await api.put<AdminLink>(`/api/links/${id}`, { isActive });
      return data;
    },
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: linkKeys.admin() });
      const previousLinks = queryClient.getQueryData<AdminLink[]>(linkKeys.admin());

      queryClient.setQueryData<AdminLink[]>(linkKeys.admin(), (old = []) =>
        old.map((link) => ({
          ...link,
          ...(link.id === id ? { isActive } : {}),
          children: link.children.map((child) =>
            child.id === id ? { ...child, isActive } : child,
          ),
        })),
      );
      return { previousLinks };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(linkKeys.admin(), context?.previousLinks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.all });
    },
  });
}
