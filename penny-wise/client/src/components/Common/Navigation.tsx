import { useAuthStore } from "@/store/authStore";
import { Link, useNavigate } from "@tanstack/react-router";
import { DollarSign } from "lucide-react";
import Avatar from "./Avatar";

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuthStore();

  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <header className="bg-slate-900 border-b border-slate-700 p-4 sm:px-8 sm:py-4 2xl:border-none 2xl:bg-transparent">
      <nav className="flex flex-col items-start gap-8 flex-wrap sm:flex-row sm:items-center sm:justify-between 2xl:py-8 2xl:border-b 2xl:border-purple-950">
        <Link
          to="/"
          className="flex items-center gap-2 self-start md:self-auto md:grow"
        >
          <DollarSign className="h-8 w-8 text-purple-400" />
          <span className="text-xl font-bold text-gray-100">PennyWise</span>
        </Link>

        {isAuthenticated ? (
          <div className="flex flex-col gap-8 w-full sm:w-auto md:flex-row md:justify-between md:grow">
            <ul className="flex items-center gap-6 flex-wrap">
              <li>
                <Link
                  to="/dashboard"
                  activeProps={{ className: "text-purple-300" }}
                  inactiveProps={{
                    className:
                      "text-gray-400 hover:text-gray-100 transition-colors",
                  }}
                  className="text-lg font-medium"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/expenses"
                  activeProps={{ className: "text-purple-300" }}
                  inactiveProps={{
                    className:
                      "text-gray-400 hover:text-gray-100 transition-colors",
                  }}
                  className="text-lg font-medium"
                >
                  Expenses
                </Link>
              </li>
              <li>
                <Link
                  to="/analytics"
                  activeProps={{ className: "text-purple-300" }}
                  inactiveProps={{
                    className:
                      "text-gray-400 hover:text-gray-100 transition-colors",
                  }}
                  className="text-lg font-medium"
                >
                  {" "}
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  activeProps={{ className: "text-purple-300" }}
                  inactiveProps={{
                    className:
                      "text-gray-400 hover:text-gray-100 transition-colors",
                  }}
                  className="text-lg font-medium"
                >
                  Profile
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-4 self-end">
              {user && (
                <Avatar userName={user.name} avatarFileName={user.avatar} />
              )}

              <span className="text-md text-white capitalize font-mono font-bold">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-purple-700 text-purple-300 rounded-sm hover:bg-purple-900 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 border border-purple-700 text-purple-300 rounded-sm hover:bg-purple-900 transition-colors cursor-pointer"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 border border-purple-700 bg-purple-800 text-gray-100 rounded-sm hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
