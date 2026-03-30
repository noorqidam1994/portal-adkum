import { useMutation } from "@tanstack/react-query";
import type { VerifyPasswordInput } from "@/validations/verify";
import { api } from "@/lib/api";

type VerifyResult = {
  token: string;
};

export function useVerifyPassword(slug: string) {
  return useMutation<VerifyResult, Error, VerifyPasswordInput>({
    mutationFn: async (data) => {
      const { data: json } = await api.post<VerifyResult>(`/api/verify/${slug}`, data);
      return json;
    },
  });
}
