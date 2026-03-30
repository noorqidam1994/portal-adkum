import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateUserInput, UpdateUserInput } from "@/validations/auth";
import { api } from "@/lib/api";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: userKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<AdminUser[]>("/api/admin/users");
      return data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const { data: json } = await api.post<AdminUser>("/api/admin/users", data);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const { data: json } = await api.put<AdminUser>(`/api/admin/users/${id}`, data);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
