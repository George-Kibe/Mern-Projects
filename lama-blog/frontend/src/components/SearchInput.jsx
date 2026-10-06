import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

// Debounced search: typing waits 400ms before hitting the URL/API,
// Enter applies immediately.
const SearchInput = ({ value, onChange, id = "search", className = "" }) => {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  const timer = useRef();

  // Follow external changes (chip removed, clear all, back button).
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }
  useEffect(() => () => clearTimeout(timer.current), []);

  const commit = (next) => {
    clearTimeout(timer.current);
    if (next.trim() !== value) onChange(next.trim());
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search posts
      </label>
      <MagnifyingGlass
        size={18}
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-faint"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={draft}
        maxLength={100}
        placeholder="Search posts"
        className="field rounded-full pr-10 pl-11 [&::-webkit-search-cancel-button]:hidden"
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => commit(next), 400);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(draft);
          if (e.key === "Escape" && draft) {
            setDraft("");
            commit("");
          }
        }}
      />
      {draft && (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint hover:bg-tint hover:text-ink"
          onClick={() => {
            setDraft("");
            commit("");
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
