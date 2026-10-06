import { Link } from "react-router";
import Search from "./Search";
import { CATEGORIES } from "../lib/categories";

const MainCategories = () => {
  return (
    <div className="hidden md:flex bg-white rounded-3xl xl:rounded-full p-4 shadow-lg items-center justify-center gap-4 xl:gap-8">
      {/* links */}
      <div className="flex-1 flex items-center justify-between flex-wrap gap-y-2">
        <Link
          to="/posts"
          className="bg-blue-800 text-white rounded-full px-4 py-2 whitespace-nowrap"
        >
          All Posts
        </Link>
        {CATEGORIES.filter((c) => c.value !== "general").map((c) => (
          <Link
            key={c.value}
            to={`/posts?cat=${c.value}`}
            className="hover:bg-blue-50 rounded-full px-3 py-2 whitespace-nowrap"
          >
            {c.label}
          </Link>
        ))}
      </div>
      <span className="text-xl font-medium">|</span>
      {/* search */}
      <Search/>
    </div>
  );
};

export default MainCategories;