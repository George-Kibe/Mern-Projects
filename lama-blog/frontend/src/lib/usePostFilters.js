import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "popular", label: "Most read" },
  { value: "trending", label: "Trending this week" },
  { value: "title-asc", label: "Title A to Z" },
  { value: "title-desc", label: "Title Z to A" },
];

export const TIME_OPTIONS = [
  { value: "", label: "Any time" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
  { value: "year", label: "Past year" },
];

export const PAGE_SIZES = [6, 12, 24];
const DEFAULT_LIMIT = 12;

// All browse state lives in the URL so results are shareable and
// back/forward safe. Any filter change resets to page 1.
export const usePostFilters = () => {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const limit = Number(params.get("limit"));
    return {
      page: Math.max(Number(params.get("page")) || 1, 1),
      limit: PAGE_SIZES.includes(limit) ? limit : DEFAULT_LIMIT,
      sort: SORT_OPTIONS.some((o) => o.value === params.get("sort"))
        ? params.get("sort")
        : "newest",
      cat: (params.get("cat") || "").split(",").filter(Boolean),
      search: params.get("search") || "",
      author: params.get("author") || "",
      time: params.get("time") || "",
      featured: params.get("featured") === "true",
      saved: params.get("saved") === "true",
    };
  }, [params]);

  const update = useCallback(
    (changes, { resetPage = true } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(changes)) {
            const empty =
              value === "" || value === false || value == null ||
              (Array.isArray(value) && value.length === 0);
            if (empty) next.delete(key);
            else next.set(key, Array.isArray(value) ? value.join(",") : String(value));
          }
          if (resetPage && !("page" in changes)) next.delete("page");
          if (next.get("page") === "1") next.delete("page");
          if (next.get("sort") === "newest") next.delete("sort");
          if (next.get("limit") === String(DEFAULT_LIMIT)) next.delete("limit");
          return next;
        },
        { replace: false }
      );
    },
    [setParams]
  );

  const toggleCategory = useCallback(
    (value) => {
      const current = filters.cat;
      update({
        cat: current.includes(value)
          ? current.filter((c) => c !== value)
          : [...current, value],
      });
    },
    [filters.cat, update]
  );

  const clearAll = useCallback(() => {
    setParams(new URLSearchParams());
  }, [setParams]);

  const activeCount =
    filters.cat.length +
    Number(!!filters.search) +
    Number(!!filters.author) +
    Number(!!filters.time) +
    Number(filters.featured) +
    Number(filters.saved);

  // Query params for the API (only non-defaults).
  const apiParams = useMemo(() => {
    const p = { page: filters.page, limit: filters.limit, sort: filters.sort };
    if (filters.cat.length) p.cat = filters.cat.join(",");
    if (filters.search) p.search = filters.search;
    if (filters.author) p.author = filters.author;
    if (filters.time) p.time = filters.time;
    if (filters.featured) p.featured = "true";
    if (filters.saved) p.saved = "true";
    return p;
  }, [filters]);

  return { filters, apiParams, update, toggleCategory, clearAll, activeCount };
};
