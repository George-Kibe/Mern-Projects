import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api, authHeaders, errorMessage } from "./api";

// Saved post ids for the signed-in reader, plus a toggle with optimistic UI.
export const useSavedPosts = () => {
  const { isSignedIn, getToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedIds = [] } = useQuery({
    queryKey: ["savedPosts"],
    enabled: !!isSignedIn,
    staleTime: 60_000,
    queryFn: async () => {
      const token = await getToken();
      const res = await api.get("/users/saved", authHeaders(token));
      return res.data;
    },
  });

  const toggle = useMutation({
    mutationFn: async (postId) => {
      const token = await getToken();
      return api.patch("/users/save", { postId }, authHeaders(token));
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["savedPosts"] });
      const previous = queryClient.getQueryData(["savedPosts"]) || [];
      queryClient.setQueryData(
        ["savedPosts"],
        previous.includes(postId)
          ? previous.filter((id) => id !== postId)
          : [...previous, postId]
      );
      return { previous };
    },
    onError: (error, _postId, context) => {
      queryClient.setQueryData(["savedPosts"], context?.previous);
      toast.error(errorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    isSignedIn: !!isSignedIn,
    savedIds,
    isSaved: (id) => savedIds.includes(id),
    toggleSave: (id) => toggle.mutate(id),
    isToggling: toggle.isPending,
  };
};
