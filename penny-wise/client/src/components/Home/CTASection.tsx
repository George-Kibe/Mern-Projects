import { useAuthStore } from "@/store/authStore";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="p-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Start Your Financial Journey Today
        </h2>

        <p className="text-lg text-white/90 mb-8">
          Join thousands of users who are already managing their expenses better
        </p>

        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4  border border-purple-950 text-white text-lg font-semibold rounded-sm"
          >
            Go to Dashboard
            <ArrowRight className="size-5" />
          </Link>
        ) : (
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4  border border-purple-950 text-white text-lg font-semibold rounded-sm"
          >
            Sign Up Free
            <ArrowRight className="size-5" />
          </Link>
        )}
      </div>
    </section>
  );
}
