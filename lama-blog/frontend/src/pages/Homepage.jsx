import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "@phosphor-icons/react";
import { api, shouldRetry } from "../lib/api";
import { categoryCode } from "../lib/categories";
import { formatCount } from "../lib/format";
import { useSavedPosts } from "../lib/useSavedPosts";
import PostCard, { PostCardSkeleton } from "../components/PostCard";
import SubjectTabs from "../components/SubjectTabs";
import SearchInput from "../components/SearchInput";
import { QueryError } from "../components/StateMessage";
import { usePostsMeta } from "../lib/usePostsMeta";

const usePosts = (key, params) =>
  useQuery({
    queryKey: ["posts", key, params],
    queryFn: async () => (await api.get("/posts", { params })).data,
    staleTime: 30_000,
    retry: shouldRetry,
  });

const SectionHeading = ({ id, title, link }) => (
  <div className="flex items-end justify-between gap-4">
    <h2 id={id} className="text-2xl font-semibold md:text-3xl">
      {title}
    </h2>
    {link}
  </div>
);

const Featured = ({ isSaved }) => {
  const featured = usePosts("featured", { featured: "true", limit: 4, sort: "newest" });

  if (featured.isPending) {
    return (
      <div className="grid items-start gap-6 lg:grid-cols-12" aria-busy="true">
        <div className="lg:col-span-7"><PostCardSkeleton /></div>
        <div className="flex flex-col gap-4 lg:col-span-5">
          {[0, 1, 2].map((i) => <PostCardSkeleton key={i} variant="row" />)}
        </div>
      </div>
    );
  }
  if (featured.isError) return <QueryError error={featured.error} onRetry={() => featured.refetch()} />;

  const [lead, ...rest] = featured.data.posts;
  if (!lead) return null;

  return (
    <section aria-labelledby="featured-heading" className="flex flex-col gap-4 md:gap-6">
      <h2 id="featured-heading" className="sr-only">Featured posts</h2>
      <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PostCard post={lead} variant="feature" saved={isSaved(lead._id)} />
        </div>
        {rest.length > 0 && (
          <ul className="flex flex-col gap-4 lg:col-span-5">
            {rest.map((post, i) => (
              <li key={post._id}>
                <PostCard post={post} variant="row" index={i + 1} saved={isSaved(post._id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link to="/posts?featured=true" className="flex items-center gap-2 self-end px-2 pb-2 font-medium text-accent hover:underline sm:px-0 sm:pb-0">
        All featured posts
        <ArrowRight size={16} aria-hidden />
      </Link>
    </section>
  );
};

const MostRead = () => {
  const popular = usePosts("popular", { sort: "popular", limit: 5 });
  if (popular.isError || (popular.data && !popular.data.posts.length)) return null;

  return (
    <section aria-labelledby="most-read-heading" className="flex flex-col gap-6">
      <h2 id="most-read-heading" className="text-2xl font-semibold">Most read</h2>
      <ol className="flex flex-col rounded-xl bg-card px-6 shadow-card">
        {popular.isPending
          ? [0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="flex gap-4 border-b border-line-soft py-4 last:border-0">
                <div className="skeleton h-5 w-6" />
                <div className="skeleton h-5 flex-1" />
              </li>
            ))
          : popular.data.posts.map((post, i) => (
              <li key={post._id} className="group relative flex gap-4 border-b border-line-soft py-4 last:border-0">
                <span className="w-6 shrink-0 font-mono text-lg font-medium text-accent tabular-nums" aria-hidden>
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <Link
                    to={`/posts/${post.slug}`}
                    className="font-medium leading-snug group-hover:text-accent after:absolute after:inset-0"
                  >
                    {post.title}
                  </Link>
                  <span className="call-label">
                    {categoryCode(post.category)} / {formatCount(post.visit)} reads
                  </span>
                </div>
              </li>
            ))}
      </ol>
    </section>
  );
};

const Homepage = () => {
  const navigate = useNavigate();
  const meta = usePostsMeta();
  const latest = usePosts("latest", { limit: 6, sort: "newest" });
  const { isSaved } = useSavedPosts();
  const total = meta.data?.total;

  return (
    <div className="flex flex-col gap-12 pb-8 md:gap-16">
      {/* Intro */}
      <section className="container-page grid gap-8 pt-12 md:pt-16 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end lg:gap-16">
        <div className="flex flex-col gap-4">
          <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Practical engineering writing.
          </h1>
          <p className="max-w-[52ch] text-lg text-ink-soft md:text-xl">
            Hands-on articles on AI, programming, databases and the web, from the team at Realhive Consultants.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <SearchInput
            id="home-search"
            value=""
            onChange={(search) => search && navigate(`/posts?search=${encodeURIComponent(search)}`)}
          />
          {total > 0 && (
            <p className="px-2 text-sm text-ink-faint">
              {total} posts across {Object.keys(meta.data.categories).length} subjects
            </p>
          )}
        </div>
      </section>

      {/* Catalog drawer: subjects + featured */}
      <div className="container-page flex flex-col gap-8">
        <SubjectTabs
          leadTab={{ label: "Featured", href: "/posts?featured=true" }}
          counts={meta.data?.categories}
          total={total}
          hrefFor={(value) => (value ? `/posts?cat=${value}` : "/posts")}
        >
          <Featured isSaved={isSaved} />
        </SubjectTabs>
      </div>

      {/* Latest + most read */}
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-12">
        <section aria-labelledby="latest-heading" className="flex flex-col gap-6 lg:col-span-8">
          <SectionHeading
            id="latest-heading"
            title="Latest posts"
            link={
              <Link to="/posts" className="flex shrink-0 items-center gap-2 font-medium text-accent hover:underline">
                Browse all
                <ArrowRight size={16} aria-hidden />
              </Link>
            }
          />
          {latest.isError ? (
            <QueryError error={latest.error} onRetry={() => latest.refetch()} />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2">
              {latest.isPending
                ? [0, 1, 2, 3].map((i) => <li key={i}><PostCardSkeleton /></li>)
                : latest.data.posts.map((post, i) => (
                    <li key={post._id}>
                      <PostCard post={post} index={i} saved={isSaved(post._id)} />
                    </li>
                  ))}
            </ul>
          )}
        </section>
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <MostRead />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Homepage;
