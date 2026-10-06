const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatDate = (value) => dateFormat.format(new Date(value));

// Catalog filing date, e.g. "06 OCT 2026".
export const filingDate = (value) => formatDate(value).toUpperCase();

export const formatCount = (n) => compact.format(n ?? 0);

export const readingTime = (minutes) => `${minutes || 1} min read`;

// For full post bodies (single post page).
export const minutesFromHtml = (html = "") =>
  Math.max(1, Math.ceil(html.length / 1300));
