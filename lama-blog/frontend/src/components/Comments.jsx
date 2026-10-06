import { useState } from "react";
import { Link } from "react-router";
import { useAuth, useUser } from "@clerk/react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { format } from "timeago.js";
import { api, authHeaders, errorMessage, shouldRetry } from "../lib/api";
import Image from "./Image";
import { QueryError } from "./StateMessage";

const MAX_LENGTH = 1000;
const PAGE_SIZE = 10;

const Avatar = ({ user }) =>
  user?.img ? (
    <Image src={user.img} w="40" h="40" className="size-10 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent uppercase" aria-hidden>
      {user?.username?.[0] ?? "?"}
    </span>
  );

const Comment = ({ comment, postId, canDelete, pending }) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: async () => api.delete(`/comments/${comment._id}`, authHeaders(await getToken())),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment deleted");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <li className={`flex gap-4 py-6 ${pending ? "opacity-60" : ""}`}>
      <Avatar user={comment.user} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-semibold">{comment.user?.username}</span>
          <time className="text-sm text-ink-faint" dateTime={comment.createdAt}>
            {pending ? "Sending" : format(comment.createdAt)}
          </time>
          {canDelete && !pending && (
            <button
              type="button"
              className="ml-auto text-sm text-ink-faint hover:text-danger disabled:opacity-50"
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
            >
              {remove.isPending ? "Deleting" : "Delete"}
            </button>
          )}
        </div>
        <p className="break-words whitespace-pre-line text-ink-soft">{comment.description}</p>
      </div>
    </li>
  );
};

const Comments = ({ postId }) => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const comments = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: async ({ pageParam }) =>
      (await api.get(`/comments/${postId}`, { params: { page: pageParam, limit: PAGE_SIZE } })).data,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    retry: shouldRetry,
  });

  const add = useMutation({
    mutationFn: async (description) =>
      api.post(`/comments/${postId}`, { description }, authHeaders(await getToken())),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const isAdmin = user?.publicMetadata?.role === "admin";
  const list = comments.data?.pages.flatMap((p) => p.comments) ?? [];
  const total = comments.data?.pages[0]?.total ?? 0;
  const remaining = total - list.length;
  const trimmed = text.trim();

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-6">
      <h2 id="comments-heading" className="text-2xl font-semibold">
        Comments {total > 0 && <span className="font-mono text-lg text-ink-faint">{total}</span>}
      </h2>

      {isSignedIn ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed && !add.isPending) add.mutate(trimmed);
          }}
        >
          <label htmlFor="comment" className="field-label mb-0">
            Add a comment
          </label>
          <textarea
            id="comment"
            rows={3}
            maxLength={MAX_LENGTH}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share a thought or a question"
            className="field resize-y"
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-ink-faint tabular-nums">
              {text.length}/{MAX_LENGTH}
            </span>
            <button type="submit" className="btn btn-primary" disabled={!trimmed || add.isPending}>
              {add.isPending ? "Posting" : "Post comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className="rounded-xl bg-card px-6 py-4 text-ink-soft shadow-card">
          <Link to="/login" className="font-medium text-accent underline">Sign in</Link> to join the conversation.
        </p>
      )}

      {comments.isPending ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4 py-4">
              <div className="skeleton size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.isError && !list.length ? (
        <QueryError error={comments.error} onRetry={() => comments.refetch()} />
      ) : list.length === 0 && !add.isPending ? (
        <p className="text-ink-faint">No comments yet. Start the conversation.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {add.isPending && (
            <Comment
              pending
              postId={postId}
              comment={{
                _id: "pending",
                description: add.variables,
                createdAt: new Date().toISOString(),
                user: { username: user?.username || user?.firstName || "You", img: user?.imageUrl },
              }}
            />
          )}
          {list.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              postId={postId}
              canDelete={!!user && (comment.user?.clerkUserId === user.id || isAdmin)}
            />
          ))}
        </ul>
      )}

      {comments.hasNextPage && (
        <button
          type="button"
          className="btn btn-secondary self-start"
          onClick={() => comments.fetchNextPage()}
          disabled={comments.isFetchingNextPage}
        >
          {comments.isFetchingNextPage
            ? "Loading"
            : `Show ${Math.min(remaining, PAGE_SIZE)} more of ${remaining}`}
        </button>
      )}
    </section>
  );
};

export default Comments;
