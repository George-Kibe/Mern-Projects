import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { CATEGORIES } from "../lib/categories";

/*
  Guide-card tabs over a catalog drawer. The active tab shares the drawer's
  tint and has no bottom edge, so it reads as the guide card of the open
  drawer; the accent rule runs along its top.
*/
const tabClass = (active) =>
  `relative flex shrink-0 snap-start items-baseline gap-2 rounded-t-xl px-4 text-[15px] transition-[padding,background-color,color] duration-200 ${
    active
      ? "bg-ground-deep pt-3 pb-3 font-semibold text-ink shadow-[inset_0_2px_0_var(--color-accent)]"
      : "mt-1 bg-ground-deep/45 pt-2 pb-2 text-ink-soft hover:bg-ground-deep/75 hover:text-ink"
  }`;

const Count = ({ value }) =>
  value == null ? null : (
    <span className="font-mono text-xs tabular-nums text-ink-soft">{value}</span>
  );

/**
 * Link mode: pass `hrefFor(value)`; Button mode: pass `onSelect(value)`.
 * `active` is the selected category value, "" for all, or null for none.
 * `leadTab` adds a tab before "All posts" (e.g. Featured on the homepage).
 * Children render inside the open drawer.
 */
const SubjectTabs = ({ active = "", counts, total, hrefFor, onSelect, leadTab, label = "Subjects", children }) => {
  const scroller = useRef(null);

  // Bring the active tab into view horizontally only; never scroll the page.
  useEffect(() => {
    const strip = scroller.current;
    const el = strip?.querySelector("[aria-current='true'], [aria-pressed='true']");
    if (!el) return;
    const left = el.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft || left + el.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: Math.max(0, left - 16), behavior: "smooth" });
    }
  }, [active]);

  const tabs = [{ value: "", label: "All posts" }, ...CATEGORIES];

  const renderTab = ({ key, label: text, count, isActive, to, onClick }) =>
    to ? (
      <Link key={key} to={to} aria-current={isActive ? "true" : undefined} className={tabClass(isActive)}>
        {text}
        <Count value={count} />
      </Link>
    ) : (
      <button key={key} type="button" aria-pressed={isActive} onClick={onClick} className={tabClass(isActive)}>
        {text}
        <Count value={count} />
      </button>
    );

  return (
    <div>
      <nav aria-label={label}>
        <div
          ref={scroller}
          className="flex snap-x items-end gap-1 overflow-x-auto [scrollbar-width:none] max-lg:[mask-image:linear-gradient(to_right,black_calc(100%-40px),transparent)] [&::-webkit-scrollbar]:hidden"
        >
          {leadTab &&
            renderTab({ key: "lead", label: leadTab.label, count: leadTab.count, isActive: true, to: leadTab.href })}
          {tabs.map((tab) => {
            const isActive = !leadTab && active === tab.value;
            const count = tab.value ? counts?.[tab.value] ?? 0 : total;
            // Empty subjects are hidden unless selected; the filter panel follows the same rule.
            if (tab.value && counts && !count && !isActive) return null;
            return renderTab({
              key: tab.value || "all",
              label: tab.label,
              count,
              isActive,
              to: hrefFor?.(tab.value),
              onClick: onSelect && (() => onSelect(tab.value)),
            });
          })}
        </div>
      </nav>
      <div className="rounded-b-xl rounded-tr-xl bg-ground-deep p-2 sm:p-4 md:p-6">{children}</div>
    </div>
  );
};

export default SubjectTabs;
