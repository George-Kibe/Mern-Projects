import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Faders } from "@phosphor-icons/react";
import { api, shouldRetry } from "../lib/api";
import { categoryLabel } from "../lib/categories";
import { SORT_OPTIONS, usePostFilters } from "../lib/usePostFilters";
import { usePostsMeta } from "../lib/usePostsMeta";
import { useSavedPosts } from "../lib/useSavedPosts";
import PostCard, { PostCardSkeleton } from "../components/PostCard";
import Pagination from "../components/Pagination";
import SubjectTabs from "../components/SubjectTabs";
import SearchInput from "../components/SearchInput";
import FilterPanel, { ActiveFilters } from "../components/FilterPanel";
import Sheet from "../components/Sheet";
import StateMessage, { QueryError } from "../components/StateMessage";

const fetchPosts = async (params, getToken) => {
  // Saved posts are per-user, so that request needs a token.
  const headers = params.saved ? { Authorization: `Bearer ${await getToken()}` } : {};
  const res = await api.get("/posts", { params, headers });
  return res.data;
};

const pageTitle = (filters) => {
  if (filters.saved) return "Saved posts";
  if (filters.search) return `Results for "${filters.search}"`;
  if (filters.author) return `Posts by ${filters.author}`;
  if (filters.cat.length === 1) return categoryLabel(filters.cat[0]);
  if (filters.featured) return "Featured posts";
  return "All posts";
};

const PostsListPage = () => {
  const { filters, apiParams, update, toggleCategory, clearAll, activeCount } = usePostFilters();
  const [params] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { isSignedIn, getToken, isLoaded } = useAuth();
  const { isSaved } = useSavedPosts();
  const queryClient = useQueryClient();
  const meta = usePostsMeta();

  const needsSignIn = filters.saved && isLoaded && !isSignedIn;

  const posts = useQuery({
    queryKey: ["posts", apiParams],
    queryFn: () => fetchPosts(apiParams, getToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: shouldRetry,
    enabled: !needsSignIn && (!filters.saved || isLoaded),
  });

  const data = posts.data;

  // Asked for a page past the end (e.g. after filtering): go to the last page.
  useEffect(() => {
    if (data && data.totalPages > 0 && filters.page > data.totalPages) {
      update({ page: data.totalPages }, { resetPage: false });
    }
  }, [data, filters.page, update]);

  // Warm the next page so "Next" feels instant.
  useEffect(() => {
    if (!data?.hasMore) return;
    const next = { ...apiParams, page: filters.page + 1 };
    queryClient.prefetchQuery({
      queryKey: ["posts", next],
      queryFn: () => fetchPosts(next, getToken),
      staleTime: 30_000,
    });
  }, [data, apiParams, filters.page, queryClient, getToken]);

  const hrefFor = (page) => {
    const next = new URLSearchParams(params);
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    const qs = next.toString();
    return qs ? `/posts?${qs}` : "/posts";
  };

  const activeTab = filters.cat.length === 0 ? "" : filters.cat.length === 1 ? filters.cat[0] : null;
  const panelProps = { filters, update, toggleCategory, meta: meta.data, isSignedIn: !!isSignedIn };

  let results;
  if (needsSignIn) {
    results = (
      <StateMessage
        title="Sign in to see your saved posts"
        body="Posts you save are kept on your account."
        action={<Link to="/login" className="btn btn-primary">Sign in</Link>}
      />
    );
  } else if (posts.isPending) {
    results = (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading posts">
        {Array.from({ length: 4 }, (_, i) => <PostCardSkeleton key={i} variant="filed" />)}
      </div>
    );
  } else if (posts.isError && !data) {
    results = <QueryError error={posts.error} onRetry={() => posts.refetch()} />;
  } else if (!data.posts.length) {
    results = (
      <StateMessage
        title={filters.saved ? "No saved posts yet" : "No posts match these filters"}
        body={
          filters.saved
            ? "Use Save on any post to keep it here."
            : "Try a different subject, a shorter search, or a wider date range."
        }
        action={
          activeCount > 0 && (
            <button type="button" onClick={clearAll} className="btn btn-secondary">
              Clear all filters
            </button>
          )
        }
      />
    );
  } else {
    results = (
      <div className="flex flex-col gap-12">
        {posts.isError && <QueryError error={posts.error} onRetry={() => posts.refetch()} />}
        <ul
          key={`${filters.page}-${JSON.stringify(apiParams)}`}
          className={`flex flex-col gap-4 transition-opacity ${
            posts.isPlaceholderData ? "opacity-60" : ""
          }`}
          aria-busy={posts.isFetching}
        >
          {data.posts.map((post, i) => (
            <li key={post._id}>
              <PostCard post={post} variant="filed" index={i} saved={isSaved(post._id)} headingLevel={2} />
            </li>
          ))}
        </ul>
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          limit={data.limit}
          hrefFor={hrefFor}
        />
      </div>
    );
  }

  return (
    <div className="container-page flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold md:text-4xl">{pageTitle(filters)}</h1>
        <p className="text-ink-soft" aria-live="polite">
          {data
            ? `${data.total} ${data.total === 1 ? "post" : "posts"}`
            : "Loading posts"}
          {filters.sort !== "newest" &&
            `, ${SORT_OPTIONS.find((o) => o.value === filters.sort).label.toLowerCase()}`}
        </p>
      </header>

      <SubjectTabs
        active={activeTab}
        counts={meta.data?.categories}
        total={meta.data?.total}
        onSelect={(value) => update({ cat: value ? [value] : [] })}
      >
        <section className="flex min-w-0 flex-col gap-6" aria-label="Results">
          {/* Filing rules: search, sort and the full filter set */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <SearchInput
              value={filters.search}
              onChange={(search) => update({ search })}
              className="sm:flex-1"
            />
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="sr-only">Sort by</label>
              <select
                id="sort"
                className="field field-select min-h-11 flex-1 rounded-full sm:w-56 sm:flex-none"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value })}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-secondary min-h-11"
                onClick={() => setSheetOpen(true)}
                aria-haspopup="dialog"
              >
                <Faders size={18} aria-hidden />
                Filters
                {activeCount > 0 && (
                  <span className="rounded-full bg-accent px-2 text-xs leading-5 font-semibold text-white">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <ActiveFilters filters={filters} update={update} toggleCategory={toggleCategory} clearAll={clearAll} />

          {results}
        </section>
      </SubjectTabs>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filter posts"
        footer={
          <div className="flex items-center justify-between gap-4">
            <button type="button" className="btn btn-ghost" onClick={clearAll} disabled={!activeCount}>
              Clear all
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setSheetOpen(false)}>
              {data ? `Show ${data.total} ${data.total === 1 ? "post" : "posts"}` : "Show posts"}
            </button>
          </div>
        }
      >
        <FilterPanel {...panelProps} idPrefix="sheet" />
      </Sheet>
    </div>
  );
};

export default PostsListPage;
