import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  onClick?: () => void;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  onClick,
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-4 p-6 border border-purple-950 rounded-sm  ${
        onClick
          ? "cursor-pointer hover:bg-purple-900 transition-colors bg-purple-950/80 group"
          : ""
      }`}
    >
      <div className="flex items-center gap-3 ">
        <div className="p-2 bg-purple-900/30 rounded-sm">
          <Icon className="size-5 text-purple-400" />
        </div>
        <p className="text-sm font-medium text-gray-400 group-hover:text-white group-hover:transition-colors">
          {label}
        </p>
      </div>

      <p className="text-3xl font-bold text-gray-100">{value}</p>
    </div>
  );
}
