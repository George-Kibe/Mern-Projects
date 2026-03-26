import { useAuthStore } from "@/store/authStore";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="py-20 px-4 text-center">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-100 mb-6">
        Take Control of Your <span className="text-purple-400">Finances</span>
      </h1>

      <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
        Track your expenses, understand your spending habits, and make smarter
        financial decisions with PennyWise.
      </p>

      {isAuthenticated ? (
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-sm transition-colors"
        >
          Go to Dashboard
          <ArrowRight className="size-5" />
        </Link>
      ) : (
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-sm transition-colors"
        >
          Get Started
          <ArrowRight className="size-5" />
        </Link>
      )}
    </section>
  );
}
