import { BarChart3, DollarSign, Shield, TrendingUp } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 text-center mb-12">
        Everything you need to manage expenses
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <FeatureCard
          icon={<DollarSign className="size-8 text-purple-400" />}
          title="Track Expenses"
          description="Easily record and categorize all your expenses in one place"
        />

        <FeatureCard
          icon={<BarChart3 className="size-8 text-purple-400" />}
          title="Visual Analytics"
          description="Understand your spending patterns with beautiful charts"
        />

        <FeatureCard
          icon={<TrendingUp className="size-8 text-purple-400" />}
          title="Spending Trends"
          description="Monitor your financial habits over time"
        />

        <FeatureCard
          icon={<Shield className="size-8 text-purple-400" />}
          title="Secure & Private"
          description="Your financial data is encrypted and secure"
        />
      </div>
    </section>
  );
}
