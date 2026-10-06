import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Show, UserButton } from "@clerk/react";
import { List, PencilSimpleLine, X } from "@phosphor-icons/react";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { to: "/posts", label: "Browse" },
  { to: "/posts?sort=trending", label: "Trending" },
  { to: "/posts?sort=popular", label: "Most read" },
];

const navClass = (active) =>
  `rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
    active
      ? "bg-card text-link shadow-[inset_0_0_0_1px_var(--color-line)]"
      : "text-ink-soft hover:bg-ground-deep hover:text-ink"
  }`;

// NavLink ignores the query string, so match it explicitly.
const useIsActive = () => {
  const { pathname, search } = useLocation();
  const sort = new URLSearchParams(search).get("sort");
  return (to) => {
    const [path, query] = to.split("?");
    if (path !== pathname) return false;
    const wanted = new URLSearchParams(query || "").get("sort");
    return wanted ? sort === wanted : sort !== "trending" && sort !== "popular";
  };
};

const Masthead = () => {
  const location = useLocation();
  const isActive = useIsActive();
  // The menu belongs to the location it was opened on, so any navigation closes it.
  const [openOn, setOpenOn] = useState(null);
  const open = openOn === location.key;
  const setOpen = (next) => setOpenOn(next ? location.key : null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-line bg-ground/95 supports-[backdrop-filter]:bg-ground/85 supports-[backdrop-filter]:backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Link to="/" className="flex items-center gap-2 rounded-lg" aria-label="Realhive Blog home">
          <img src="/logo.png" alt="" width={32} height={32} className="size-8 rounded-lg" />
          <span className="text-lg font-semibold tracking-tight">Realhive Blog</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className={navClass(isActive(item.to))}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <NavLink to="/write" className="btn btn-primary">
            <PencilSimpleLine size={18} weight="bold" aria-hidden />
            Write
          </NavLink>
          <Show when="signed-out">
            <Link to="/login" className="btn btn-secondary">
              Sign in
            </Link>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <ThemeToggle />
          <button
            type="button"
            className="btn btn-ghost size-10 min-h-0 p-0"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>
    </header>

      {/* Rendered outside <header>: its backdrop-filter would make it the
          containing block for this fixed panel and collapse it to 0px. */}
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-ground md:hidden"
          style={{ animation: "fade-in 200ms ease-out" }}
        >
          <nav aria-label="Mobile" className="container-page flex flex-col gap-2 py-6">
            <Link to="/" className={navClass(location.pathname === "/")}>
              Home
            </Link>
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className={navClass(isActive(item.to))}>
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-line pt-6">
              <Link to="/write" className="btn btn-primary">
                <PencilSimpleLine size={18} weight="bold" aria-hidden />
                Write a post
              </Link>
              <Show when="signed-out">
                <Link to="/login" className="btn btn-secondary">
                  Sign in
                </Link>
              </Show>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Masthead;
