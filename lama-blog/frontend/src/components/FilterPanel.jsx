import { Check, X } from "@phosphor-icons/react";
import { CATEGORIES, categoryLabel } from "../lib/categories";
import { PAGE_SIZES, TIME_OPTIONS } from "../lib/usePostFilters";

const Section = ({ title, children }) => (
  <fieldset className="flex flex-col gap-2">
    <legend className="mb-2 text-sm font-semibold">{title}</legend>
    {children}
  </fieldset>
);

const chipClass = (on) =>
  `inline-flex min-h-9 items-center gap-1 rounded-full px-4 py-1 text-sm transition-colors ${
    on
      ? "bg-accent text-white"
      : "bg-card text-ink-soft shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink hover:shadow-[inset_0_0_0_1px_var(--color-ink-faint)]"
  }`;

const Toggle = ({ checked, onChange, label, hint }) => (
  <label className="flex cursor-pointer items-start justify-between gap-4 py-1">
    <span className="flex flex-col">
      <span className="text-[15px]">{label}</span>
      {hint && <span className="text-sm text-ink-faint">{hint}</span>}
    </span>
    <input
      type="checkbox"
      className="peer sr-only"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span
      aria-hidden
      className="relative mt-1 h-6 w-10 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
    />
  </label>
);

// Every filter applies immediately; the URL is the single source of truth.
const FilterPanel = ({ filters, update, toggleCategory, meta, isSignedIn, idPrefix = "f" }) => (
  <div className="flex flex-col gap-8">
    <Section title="Subjects (pick one or more)">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const on = filters.cat.includes(c.value);
          const count = meta?.categories?.[c.value] ?? 0;
          // Same rule as the subject tabs: empty subjects hidden unless selected.
          if (!count && !on) return null;
          return (
            <button
              key={c.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggleCategory(c.value)}
              className={chipClass(on)}
            >
              {on && <Check size={14} weight="bold" aria-hidden />}
              {c.label}
              <span className={`font-mono text-xs ${on ? "text-white/80" : "text-ink-faint"}`}>{count}</span>
            </button>
          );
        })}
      </div>
    </Section>

    <Section title="Published">
      <div className="flex flex-wrap gap-2">
        {TIME_OPTIONS.map((o) => (
          <label key={o.value || "any"} className={`${chipClass(filters.time === o.value)} cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent`}>
            <input
              type="radio"
              name={`${idPrefix}-time`}
              className="sr-only"
              checked={filters.time === o.value}
              onChange={() => update({ time: o.value })}
              disabled={filters.sort === "trending"}
            />
            {o.label}
          </label>
        ))}
      </div>
      {filters.sort === "trending" && (
        <p className="text-sm text-ink-faint">Trending always covers the past week.</p>
      )}
    </Section>

    <div className="flex flex-col">
      <label htmlFor={`${idPrefix}-author`} className="field-label">
        Author
      </label>
      <select
        id={`${idPrefix}-author`}
        className="field field-select"
        value={filters.author}
        onChange={(e) => update({ author: e.target.value })}
      >
        <option value="">All authors</option>
        {meta?.authors?.map((a) => (
          <option key={a.username} value={a.username}>
            {a.username} ({a.count})
          </option>
        ))}
        {filters.author && !meta?.authors?.some((a) => a.username === filters.author) && (
          <option value={filters.author}>{filters.author}</option>
        )}
      </select>
    </div>

    <Section title="Show only">
      <Toggle
        label="Featured posts"
        checked={filters.featured}
        onChange={(on) => update({ featured: on })}
      />
      {isSignedIn && (
        <Toggle
          label="My saved posts"
          checked={filters.saved}
          onChange={(on) => update({ saved: on })}
        />
      )}
    </Section>

    <div className="flex flex-col">
      <label htmlFor={`${idPrefix}-limit`} className="field-label">
        Posts per page
      </label>
      <select
        id={`${idPrefix}-limit`}
        className="field field-select"
        value={filters.limit}
        onChange={(e) => update({ limit: Number(e.target.value) })}
      >
        {PAGE_SIZES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// Removable chips summarising every active filter.
export const ActiveFilters = ({ filters, update, toggleCategory, clearAll }) => {
  const chips = [
    ...filters.cat.map((c) => ({ key: `cat-${c}`, label: categoryLabel(c), remove: () => toggleCategory(c) })),
    filters.search && { key: "search", label: `"${filters.search}"`, remove: () => update({ search: "" }) },
    filters.author && { key: "author", label: `By ${filters.author}`, remove: () => update({ author: "" }) },
    filters.time && {
      key: "time",
      label: TIME_OPTIONS.find((o) => o.value === filters.time)?.label,
      remove: () => update({ time: "" }),
    },
    filters.featured && { key: "featured", label: "Featured", remove: () => update({ featured: false }) },
    filters.saved && { key: "saved", label: "Saved", remove: () => update({ saved: false }) },
  ].filter(Boolean);

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="inline-flex min-h-8 items-center gap-1 rounded-full bg-accent-soft py-1 pr-2 pl-4 text-sm text-accent hover:bg-accent hover:text-white"
        >
          {chip.label}
          <X size={14} weight="bold" aria-label="Remove filter" />
        </button>
      ))}
      <button type="button" onClick={clearAll} className="ml-2 text-sm font-medium text-ink-soft underline hover:text-accent">
        Clear all
      </button>
    </div>
  );
};

export default FilterPanel;
