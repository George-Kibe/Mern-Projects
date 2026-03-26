import { useExpenseStore } from "@/store/expenseStore";

export default function DateRangeFilter() {
  const { filters, setDateRange } = useExpenseStore();

  function handleStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newStart = e.target.value || null;

    // console.log("Start-START - DRF", newStart);
    // console.log("End-START - DRF", filters.endDate);

    setDateRange(newStart, filters.endDate ?? null);
  }

  function handleEndDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newEnd = e.target.value || null;

    // console.log("Start-END - DRF", filters.startDate);
    // console.log("End-END - DRF", newEnd);

    setDateRange(filters.startDate ?? null, newEnd);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="start-date"
          className="text-sm font-medium text-gray-400"
        >
          Start Date
        </label>

        <input
          id="start-date"
          type="date"
          value={filters.startDate || ""}
          onChange={handleStartDateChange}
          max={new Date().toISOString().split("T")[0]}
          className="px-4 py-2.5 bg-purple-950 rounded-sm text-gray-100 border-none outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="end-date" className="text-sm font-medium text-gray-400">
          End Date
        </label>

        <input
          id="end-date"
          type="date"
          value={filters.endDate || ""}
          onChange={handleEndDateChange}
          min={filters.startDate || undefined}
          max={new Date().toISOString().split("T")[0]}
          className="px-4 py-2.5 bg-purple-950 rounded-sm text-gray-100 border-none outline-none"
        />
      </div>
    </div>
  );
}
