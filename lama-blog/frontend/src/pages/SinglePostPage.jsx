import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { CaretRight, Eye } from "@phosphor-icons/react";
import { api, shouldRetry } from "../lib/api";
import { categoryCode, categoryLabel } from "../lib/categories";
import { filingDate, formatCount, minutesFromHtml, readingTime } from "../lib/format";
import Image from "../components/Image";
import PostActions from "../components/PostActions";
import Comments from "../components/Comments";
import PostCard from "../components/PostCard";
import StateMessage, { QueryError } from "../components/StateMessage";

const sanitize = (html) =>
  DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allowfullscreen", "frameborder"],
  });

const Related = ({ post }) => {
  const related = useQuery({
    queryKey: ["posts", "related", post.category, post.slug],
    queryFn: async () =>
      (await api.get("/posts", { params: { cat: post.category, exclude: post.slug, limit: 3, sort: "popular" } })).data,
    staleTime: 60_000,
    retry: shouldRetry,
  });
  const posts = related.data?.posts ?? [];
  if (!posts.length) return null;

  return (
    <section aria-labelledby="related-heading" className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <h2 id="related-heading" className="text-2xl font-semibold">
          More in {categoryLabel(post.category)}
        </h2>
        <Link to={`/posts?cat=${post.category}`} className="shrink-0 font-medium text-link hover:underline">
          See all
        </Link>
      </div>
      <ul className="grid gap-6 md:grid-cols-3">
        {posts.map((p, i) => (
          <li key={p._id}>
            <PostCard post={p} index={i} />
          </li>
        ))}
      </ul>
    </section>
  );
};

const PostSkeleton = () => (
  <div className="container-page flex flex-col gap-8 py-8 md:py-12" aria-busy="true">
    <div className="skeleton h-4 w-48" />
    <div className="flex max-w-[24ch] flex-col gap-4">
      <div className="skeleton h-10 w-full" />
      <div className="skeleton h-10 w-2/3" />
    </div>
    <div className="skeleton aspect-[16/9] w-full rounded-xl md:aspect-[21/9]" />
  </div>
);

const SinglePostPage = () => {
  const { slug } = useParams();
  const { isPending, error, data: post, refetch } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => (await api.get(`/posts/${slug}`)).data,
    retry: shouldRetry,
  });

  if (isPending) return <PostSkeleton />;

  if (error) {
    return (
      <div className="container-page py-16">
        {error.response?.status === 404 ? (
          <StateMessage
            title="This post isn't in the catalog"
            body="It may have been deleted, or the link is mistyped."
            action={<Link to="/posts" className="btn btn-primary">Browse all posts</Link>}
          />
        ) : (
          <QueryError error={error} onRetry={refetch} />
        )}
      </div>
    );
  }

  const author = post.user?.username;

  return (
    <article className="flex flex-col gap-16 py-8 md:gap-24 md:py-12">
      <div className="container-page flex flex-col gap-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <li><Link to="/posts" className="hover:text-link hover:underline">Browse</Link></li>
            <li aria-hidden><CaretRight size={12} /></li>
            <li>
              <Link to={`/posts?cat=${post.category}`} className="hover:text-link hover:underline">
                {categoryLabel(post.category)}
              </Link>
            </li>
          </ol>
        </nav>

        <header className="flex max-w-[60rem] flex-col gap-6">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
            {post.title}
          </h1>
          {post.description && (
            <p className="max-w-[60ch] text-lg text-ink-soft md:text-xl">{post.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            {author && (
              <Link to={`/posts?author=${encodeURIComponent(author)}`} className="flex items-center gap-2 font-medium text-ink hover:text-link">
                {post.user.img ? (
                  <Image src={post.user.img} w="32" h="32" className="size-8 rounded-full object-cover" />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft font-semibold text-link uppercase" aria-hidden>
                    {author[0]}
                  </span>
                )}
                {author}
              </Link>
            )}
            <span className="call-label">
              <span className="text-link">{categoryCode(post.category)}</span> /{" "}
              <time dateTime={post.createdAt}>{filingDate(post.createdAt)}</time>
            </span>
            <span>{readingTime(minutesFromHtml(post.content))}</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Eye size={16} aria-hidden />
              {formatCount(post.visit)} reads
            </span>
            {post.isFeatured && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-link">Featured</span>
            )}
          </div>
        </header>

        <Image
          src={post.img || "postImg.jpeg"}
          w="1200"
          h="600"
          alt=""
          priority
          className="aspect-[16/9] w-full rounded-xl object-cover shadow-card md:aspect-[2/1]"
        />
      </div>

      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="lg:hidden">
            <PostActions post={post} layout="row" />
          </div>
          <div
            className="post-content max-w-[68ch]"
            dangerouslySetInnerHTML={{ __html: sanitize(post.content) }}
          />
        </div>
        <aside className="hidden lg:block" aria-label="Post actions">
          <div className="sticky top-24 flex flex-col gap-8">
            <PostActions post={post} />
            <div className="flex flex-col gap-2 border-t border-line pt-6 text-sm">
              <span className="text-ink-faint">Filed under</span>
              <Link to={`/posts?cat=${post.category}`} className="font-medium text-link hover:underline">
                {categoryLabel(post.category)}
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="container-page flex flex-col gap-16 md:gap-24">
        <Related post={post} />
        <div className="max-w-[68ch]">
          <Comments postId={post._id} />
        </div>
      </div>
    </article>
  );
};

export default SinglePostPage;
