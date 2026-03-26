import { useAuthStore } from "@/store/authStore";
import { Download } from "lucide-react";

export default function ExportDataButton() {
  const { exportData, exportedData, isLoading } = useAuthStore();

  async function handleExport() {
    await exportData();

    if (!exportData) return;

    const jsonString = JSON.stringify(exportedData, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `PennyWise-${new Date().toISOString().replace("T", "_").split(".")[0].replace(/:/g, "-")}.json`;

    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="border border-purple-950 rounded-sm p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        Export Your Data
      </h3>

      <p className="text-sm text-gray-400 mb-4">
        Download all your expenses and profile data as a JSON file. The file
        will be saved to your Downloads folder.
      </p>

      <button
        onClick={handleExport}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-sm flex items-center gap-2 transition-colors"
      >
        <Download className="size-4" />
        {isLoading ? "Exporting..." : "Export My Data"}
      </button>
    </div>
  );
}
