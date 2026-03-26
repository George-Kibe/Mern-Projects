interface YearSelectorProps {
  selectedYear: number;
  availableYears: number[];
  onChange: (year: number) => void;
}

export default function YearSelector({
  selectedYear,
  availableYears,
  onChange,
}: YearSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="year-select"
        className="text-sm font-medium text-gray-400"
      >
        Select year:
      </label>
      <select
        name="year-select"
        id="year-select"
        onChange={(e) => onChange(parseFloat(e.target.value))}
        value={selectedYear}
        className="px-4 py-2 bg-purple-950 rounded-sm text-gray-100 border-none outline-none cursor-pointer"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
