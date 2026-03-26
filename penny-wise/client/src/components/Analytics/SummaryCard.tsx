import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext: string;
}

export default function SummaryCard({
  icon: Icon,
  label,
  value,
  subtext,
}: SummaryCardProps) {
  return (
    <div className="flex flex-col gap-4 p-6  border border-purple-950 rounded-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-950 rounded-sm">
          <Icon className="size-5 text-purple-400" />
        </div>
        <span className="text-sm font-medium text-gray-400">{label}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-100">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtext}</p>
      </div>
    </div>
  );
}
