import { useAuthStore } from "@/store/authStore";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { signup, isLoading, error } = useAuthStore();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const success = await signup(name, email, password);
    if (success) {
      navigate({ to: "/login" });
    }
  }

  function togglePasswordVisibility() {
    setShowPassword((prev) => !prev);
  }

  return (
    <section className="flex flex-col gap-8 w-full max-w-md mx-auto px-4 py-8 sm:px-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-100">Create Account</h1>
        <p className="text-gray-400">Sign up to start tracking your expenses</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="px-4 py-3 bg-red-900/20 border border-red-700 rounded-sm text-red-400">
            {" "}
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            disabled={isLoading}
            placeholder="John Doe"
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-sm text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            required
            disabled={isLoading}
            placeholder="john@example.com"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-sm text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-gray-300"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              required
              disabled={isLoading}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-sm text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-purple-800 text-gray-100 rounded-sm hover:bg-purple-700 transition-colors cursor-pointer border border-purple-700 font-medium"
        >
          {isLoading ? "Signing up ..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          Login
        </Link>
      </p>
    </section>
  );
}
