// `code` is the short catalog label printed on each card.
export const CATEGORIES = [
  { value: "general", label: "General", code: "GEN" },
  { value: "web-design", label: "Web Design", code: "WEB" },
  { value: "development", label: "Development", code: "DEV" },
  { value: "databases", label: "Databases", code: "DB" },
  { value: "ai", label: "AI & ML", code: "AI" },
  { value: "seo", label: "Search Engines", code: "SEO" },
  { value: "marketing", label: "Marketing", code: "MKT" },
];

const byValue = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

export const categoryLabel = (value) => byValue[value]?.label ?? value;
export const categoryCode = (value) => byValue[value]?.code ?? "GEN";
