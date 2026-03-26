interface DateRangeSelectorProps {
  selected: string;
  onChange: (range: string) => void;
}

export default function DateRangeSelector({
  selected,
  onChange,
}: DateRangeSelectorProps) {
  const options = [
    { value: "30", label: "Last 30 Days" },
    { value: "60", label: "Last 60 Days" },
    { value: "90", label: "Last 90 Days" },
    { value: "180", label: "Last 180 Days" },
    { value: "365", label: "Last 365 Days" },
    { value: "all", label: "All Time" },
  ];

  return (
    <div className="flex items-center gap-3 mb-6">
      <label htmlFor="date-range" className="text-sm font-medium text-gray-400">
        Time Period:
      </label>

      <select
        id="date-range"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 bg-purple-950 rounded-sm text-gray-100 border-none outline-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
