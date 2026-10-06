import { Link } from "react-router";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

// 1 … 4 5 6 … 12: first, last, current and its neighbours.
const pageItems = (page, totalPages) => {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) {
      // A single skipped page is shown as a number, not an ellipsis.
      if (p - sorted[i - 1] === 2) items.push(p - 1);
      else items.push(`gap-${p}`);
    }
    items.push(p);
  });
  return items;
};

const pageClass = (active) =>
  `inline-flex size-10 items-center justify-center rounded-full text-[15px] tabular-nums transition-colors ${
    active
      ? "bg-accent font-semibold text-white"
      : "text-ink-soft hover:bg-card hover:text-ink hover:shadow-[inset_0_0_0_1px_var(--color-line)]"
  }`;

const StepLink = ({ to, disabled, children, label }) =>
  disabled ? (
    <span className="btn btn-secondary pointer-events-none opacity-45" aria-disabled="true">
      {children}
    </span>
  ) : (
    <Link to={to} className="btn btn-secondary" aria-label={label}>
      {children}
    </Link>
  );

const Pagination = ({ page, totalPages, total, limit, hrefFor, noun = "posts" }) => {
  if (!total) return null;

  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center gap-4 border-t border-line px-2 pt-6 pb-2 sm:flex-row sm:justify-between sm:px-0 sm:pb-0"
    >
      <p className="call-label text-[13px]" aria-live="polite">
        <span className="text-ink">{first}-{last}</span> of{" "}
        <span className="text-ink">{total}</span> {noun}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <StepLink to={hrefFor(page - 1)} disabled={page <= 1} label="Previous page">
            <CaretLeft size={16} weight="bold" aria-hidden />
            <span className="hidden sm:inline">Previous</span>
          </StepLink>

          <ul className="hidden items-center gap-1 sm:flex">
            {pageItems(page, totalPages).map((item) =>
              typeof item === "string" ? (
                <li key={item} className="w-8 text-center text-ink-faint" aria-hidden>
                  …
                </li>
              ) : (
                <li key={item}>
                  <Link
                    to={hrefFor(item)}
                    className={pageClass(item === page)}
                    aria-current={item === page ? "page" : undefined}
                    aria-label={`Page ${item}`}
                  >
                    {item}
                  </Link>
                </li>
              )
            )}
          </ul>
          <span className="px-2 text-sm text-ink-soft tabular-nums sm:hidden">
            Page {page} of {totalPages}
          </span>

          <StepLink to={hrefFor(page + 1)} disabled={page >= totalPages} label="Next page">
            <span className="hidden sm:inline">Next</span>
            <CaretRight size={16} weight="bold" aria-hidden />
          </StepLink>
        </div>
      )}
    </nav>
  );
};

export default Pagination;
