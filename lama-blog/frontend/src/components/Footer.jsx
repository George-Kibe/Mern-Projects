import { Link } from "react-router";
import { CATEGORIES } from "../lib/categories";

const Footer = () => (
  <footer className="mt-24 border-t border-line">
    <div className="container-page grid gap-8 py-12 md:grid-cols-[1fr_2fr]">
      <div className="flex flex-col gap-4">
        <Link to="/" className="flex w-fit items-center gap-2 rounded-lg">
          <img src="/logo.png" alt="" width={28} height={28} className="size-7 rounded-md" />
          <span className="font-semibold tracking-tight">Realhive Blog</span>
        </Link>
        <p className="max-w-[40ch] text-sm text-ink-soft">
          Practical engineering writing from Realhive Consultants.
        </p>
      </div>
      <nav aria-label="Subjects" className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Subjects</h2>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <li key={c.value}>
              <Link to={`/posts?cat=${c.value}`} className="text-ink-soft hover:text-link hover:underline">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
    <div className="border-t border-line">
      <p className="container-page py-6 text-sm text-ink-faint">
        © {new Date().getFullYear()} Realhive Consultants
      </p>
    </div>
  </footer>
);

export default Footer;
