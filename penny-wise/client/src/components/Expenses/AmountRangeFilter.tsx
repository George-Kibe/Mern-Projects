import { useExpenseStore } from "@/store/expenseStore";

export default function AmountRangeFilter() {
  const { filters, setAmountRange } = useExpenseStore();

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const newMin = value === "" ? null : parseFloat(value);
    setAmountRange(newMin, filters.maxAmount ?? null);
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const newMax = value === "" ? null : parseFloat(value);
    setAmountRange(filters.minAmount ?? null, newMax);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="min-amount"
          className="text-sm font-medium text-gray-400"
        >
          Min Amount ($)
        </label>

        <input
          id="min-amount"
          type="number"
          step="0.01"
          min="0"
          value={filters.minAmount ?? ""}
          onChange={handleMinChange}
          placeholder="0.00"
          className="px-4 py-2.5 bg-purple-950 rounded-sm text-gray-100 border-none outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="max-amount"
          className="text-sm font-medium text-gray-400"
        >
          Max Amount ($)
        </label>

        <input
          id="max-amount"
          type="number"
          step="0.01"
          min={filters.minAmount ?? "0"}
          value={filters.maxAmount ?? ""}
          onChange={handleMaxChange}
          placeholder="No limit"
          className="px-4 py-2.5 bg-purple-950 rounded-sm text-gray-100 border-none outline-none"
        />
      </div>
    </div>
  );
}
