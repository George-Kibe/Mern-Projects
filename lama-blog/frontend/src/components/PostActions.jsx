import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, useUser } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { BookmarkSimple, LinkSimple, Star, Trash } from "@phosphor-icons/react";
import { api, authHeaders, errorMessage } from "../lib/api";
import { useSavedPosts } from "../lib/useSavedPosts";

const actionClass =
  "btn btn-secondary justify-start disabled:opacity-60 data-[on=true]:text-accent data-[on=true]:shadow-[inset_0_0_0_1px_var(--color-accent)]";

const PostActions = ({ post, layout = "column" }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSignedIn, isSaved, toggleSave, isToggling } = useSavedPosts();
  const [confirming, setConfirming] = useState(false);

  const isAdmin = user?.publicMetadata?.role === "admin";
  const isOwner = !!user && post.user?.clerkUserId === user.id;
  const saved = isSaved(post._id);

  const remove = useMutation({
    mutationFn: async () => api.delete(`/posts/${post._id}`, authHeaders(await getToken())),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postsMeta"] });
      toast.success("Post deleted");
      navigate("/posts");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const feature = useMutation({
    mutationFn: async () =>
      api.patch("/posts/feature", { postId: post._id }, authHeaders(await getToken())),
    onSuccess: (res) => {
      queryClient.setQueryData(["post", post.slug], (old) => old && { ...old, isFeatured: res.data.isFeatured });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(res.data.isFeatured ? "Post featured" : "Removed from featured");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const onSave = () => {
    if (!isSignedIn) return navigate("/login");
    toggleSave(post._id);
  };

  const row = layout === "row";

  return (
    <div className={row ? "flex flex-wrap gap-2" : "flex flex-col gap-2"}>
      <button type="button" className={actionClass} data-on={saved} aria-pressed={saved} onClick={onSave} disabled={isToggling}>
        <BookmarkSimple size={18} weight={saved ? "fill" : "regular"} aria-hidden />
        {saved ? "Saved" : "Save"}
      </button>
      <button type="button" className={actionClass} onClick={copyLink}>
        <LinkSimple size={18} aria-hidden />
        Copy link
      </button>
      {isAdmin && (
        <button
          type="button"
          className={actionClass}
          data-on={post.isFeatured}
          aria-pressed={post.isFeatured}
          onClick={() => feature.mutate()}
          disabled={feature.isPending}
        >
          <Star size={18} weight={post.isFeatured ? "fill" : "regular"} aria-hidden />
          {post.isFeatured ? "Featured" : "Feature"}
        </button>
      )}
      {(isOwner || isAdmin) &&
        (confirming ? (
          <div
            role="group"
            aria-label="Confirm delete"
            className={`flex flex-col gap-2 rounded-xl bg-danger-soft p-4 ${row ? "w-full sm:w-auto" : ""}`}
          >
            <p className="text-sm font-medium text-danger">Delete this post for good?</p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-danger" onClick={() => remove.mutate()} disabled={remove.isPending}>
                {remove.isPending ? "Deleting" : "Delete"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)} disabled={remove.isPending}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={`${actionClass} text-danger`} onClick={() => setConfirming(true)}>
            <Trash size={18} aria-hidden />
            Delete
          </button>
        ))}
    </div>
  );
};

export default PostActions;
