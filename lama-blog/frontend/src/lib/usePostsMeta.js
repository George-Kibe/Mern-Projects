import { useQuery } from "@tanstack/react-query";
import { api, shouldRetry } from "./api";

// Category counts and authors for tabs and filters.
export const usePostsMeta = () =>
  useQuery({
    queryKey: ["postsMeta"],
    queryFn: async () => (await api.get("/posts/meta")).data,
    staleTime: 60_000,
    retry: shouldRetry,
  });
