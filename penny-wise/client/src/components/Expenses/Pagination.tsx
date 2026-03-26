import { useExpenseStore } from "@/store/expenseStore";
import { Loader2 } from "lucide-react";

interface PaginationProps {
  displayedCount: number;
  totalCount: number;
  hasMore: boolean;
}

export default function Pagination({
  displayedCount,
  totalCount,
  hasMore,
}: PaginationProps) {
  const { loadMoreExpenses, isLoading } = useExpenseStore();
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-sm text-gray-400">
        {hasMore
          ? `Showing 1-${displayedCount} of ${totalCount} expenses`
          : `Showing all ${totalCount} expense${totalCount === 1 ? "" : "s"}`}
      </p>

      {hasMore && (
        <button
          onClick={loadMoreExpenses}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-purple-950 text-gray-100 rounded-sm hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 />
              <span>Loading ...</span>
            </>
          ) : (
            "Load More"
          )}
        </button>
      )}
    </div>
  );
}
