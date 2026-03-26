import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="p-6 border border-purple-950 rounded-sm hover:border-purple-700 transition-colors flex flex-col gap-6">
      <p className="p-3 bg-purple-900/30 rounded-sm self-center">{icon}</p>

      <h3 className="text-xl font-semibold text-gray-100 text-center">
        {title}
      </h3>

      <p className="text-gray-400 text-center">{description}</p>
    </div>
  );
}
