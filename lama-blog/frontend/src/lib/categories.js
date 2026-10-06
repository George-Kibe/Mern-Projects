export const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "web-design", label: "Web Design" },
  { value: "development", label: "Development" },
  { value: "databases", label: "Databases" },
  { value: "ai", label: "AI & ML" },
  { value: "seo", label: "Search Engines" },
  { value: "marketing", label: "Marketing" },
];

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value;
