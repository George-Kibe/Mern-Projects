import { Link } from "react-router";
import { Eye } from "@phosphor-icons/react";
import Image from "./Image";
import { categoryCode, categoryLabel } from "../lib/categories";
import { filingDate, formatCount, readingTime } from "../lib/format";

/*
  An index card: title, the blue ruled line under it, the summary, and a foot
  with the byline and the catalog call label (subject code, filing date).
*/

const CallLabel = ({ post, withReads = false }) => (
  <p className="call-label flex flex-wrap items-center gap-x-2">
    <span className="whitespace-nowrap">
      <span className="text-accent" title={categoryLabel(post.category)}>
        {categoryCode(post.category)}
      </span>
      {" / "}
      <time dateTime={post.createdAt}>{filingDate(post.createdAt)}</time>
    </span>
    <span className="whitespace-nowrap">/ {readingTime(post.readingMinutes)}</span>
    {withReads && (
      <span className="flex items-center gap-1 whitespace-nowrap" title={`${post.visit} reads`}>
        / <Eye size={14} aria-hidden /> {formatCount(post.visit)}
        <span className="sr-only">reads</span>
      </span>
    )}
  </p>
);

export const Initial = ({ name, size = "size-6 text-xs" }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent uppercase ${size}`}
    aria-hidden
  >
    {name?.[0] ?? "?"}
  </span>
);

const Byline = ({ post }) =>
  post.user?.username ? (
    <Link
      to={`/posts?author=${encodeURIComponent(post.user.username)}`}
      className="relative z-10 flex min-w-0 items-center gap-2 rounded text-sm text-ink-soft hover:text-accent"
    >
      {post.user.img ? (
        <Image src={post.user.img} w="24" h="24" className="size-6 shrink-0 rounded-full object-cover" />
      ) : (
        <Initial name={post.user.username} />
      )}
      <span className="truncate">{post.user.username}</span>
    </Link>
  ) : null;

// Whole card is clickable through the stretched title link; inner links sit above it.
const titleLink = "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";
const cardShell =
  "group relative flex overflow-hidden rounded-xl bg-card shadow-card transition-[box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-lift focus-within:shadow-[0_0_0_2px_var(--color-accent)]";

// The ruled line sits on a wrapper so clamped titles never peek below it.
const Title = ({ post, as: Heading, className, rule = "pb-4" }) => (
  <div className={`border-b border-accent ${rule}`}>
    <Heading className={`font-semibold group-hover:text-accent ${className}`}>
      <Link to={`/posts/${post.slug}`} className={titleLink}>
        {post.title}
      </Link>
    </Heading>
  </div>
);

/**
 * variant:
 *  - "card"    image on top, for grids (home latest, related)
 *  - "feature" larger card, for the featured lead
 *  - "filed"   horizontal index card, for the browse run
 *  - "row"     compact horizontal card, for the featured stack
 */
const PostCard = ({ post, variant = "card", saved = false, index = 0, headingLevel = 3 }) => {
  const Heading = `h${headingLevel}`;
  const style = { "--i": index };
  const flag = saved && <span className="saved-flag" aria-label="Saved" />;

  if (variant === "row") {
    return (
      <article className={`${cardShell} file-in flex-row gap-4 p-4`} style={style}>
        {post.img && (
          <Image src={post.img} alt="" w="128" h="96" className="aspect-[4/3] w-24 shrink-0 self-start rounded-lg object-cover sm:w-32" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Title post={post} as={Heading} rule="pb-2" className="line-clamp-2 text-base leading-snug" />
          {post.description && <p className="line-clamp-2 text-sm text-ink-soft">{post.description}</p>}
          <CallLabel post={post} />
        </div>
        {flag}
      </article>
    );
  }

  if (variant === "filed") {
    return (
      <article className={`${cardShell} file-in flex-col sm:flex-row`} style={style}>
        {post.img && (
          <Image
            src={post.img}
            alt=""
            w="320"
            h="240"
            className="aspect-[16/9] w-full shrink-0 object-cover sm:aspect-auto sm:w-56 md:w-72"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
          <Title post={post} as={Heading} className="text-xl leading-snug md:text-2xl" />
          {post.description && <p className="line-clamp-3 text-ink-soft md:line-clamp-2">{post.description}</p>}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2">
            <Byline post={post} />
            <CallLabel post={post} withReads />
          </div>
        </div>
        {flag}
      </article>
    );
  }

  const isFeature = variant === "feature";

  return (
    <article className={`${cardShell} file-in h-full flex-col`} style={style}>
      {post.img && (
        <Image
          src={post.img}
          alt=""
          w={isFeature ? "800" : "480"}
          h={isFeature ? "450" : "300"}
          className={`w-full object-cover ${isFeature ? "aspect-[16/9]" : "aspect-[16/10]"}`}
        />
      )}
      <div className={`flex flex-1 flex-col gap-4 ${isFeature ? "p-6 md:p-8" : "p-6"}`}>
        <Title
          post={post}
          as={Heading}
          className={isFeature ? "text-2xl md:text-3xl" : "line-clamp-3 text-xl leading-snug"}
        />
        {post.description && (
          <p className={`line-clamp-3 text-ink-soft ${isFeature ? "md:text-lg" : "text-[15px]"}`}>{post.description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2">
          <Byline post={post} />
          <CallLabel post={post} withReads={isFeature} />
        </div>
      </div>
      {flag}
    </article>
  );
};

export const PostCardSkeleton = ({ variant = "card" }) => {
  if (variant === "row") {
    return (
      <div className="flex gap-4 rounded-xl bg-card p-4 shadow-card" aria-hidden>
        <div className="skeleton aspect-[4/3] w-24 shrink-0 sm:w-32" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton h-5 w-full" />
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
    );
  }
  const filed = variant === "filed";
  return (
    <div className={`flex overflow-hidden rounded-xl bg-card shadow-card ${filed ? "flex-col sm:flex-row" : "flex-col"}`} aria-hidden>
      <div className={`skeleton rounded-none ${filed ? "aspect-[16/9] sm:aspect-auto sm:w-56 md:w-72" : "aspect-[16/10]"}`} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="skeleton h-6 w-5/6" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/3" />
      </div>
    </div>
  );
};

export default PostCard;
