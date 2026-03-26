import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");

  const isConfirmed = confirmText === "DELETE";

  function handleClose() {
    setConfirmText("");
    onClose();
  }

  function handleConfirm() {
    if (!isConfirmed) return;
    onConfirm();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 bg-slate-900 p-6 top-1/2 left-1/2 -translate-1/2">
      <div className="flex items-start justify-between mb-4 ">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-12 text-red-400 p-2 bg-red-900/20 rounded-sm" />

          <h2 className="text-xl font-bold text-gray-100">Delete Account?</h2>
        </div>
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="text-gray-400 hover:text-gray-100 transition-colors disabled:opacity-50"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 mb-4">
          This will permanently delete your account and all expenses. <br />{" "}
          This action cannot be undone.
        </p>

        <p className="text-sm text-gray-400 mb-2">
          Type <span className="font-bold text-red-400">DELETE</span> to
          confirm:
        </p>

        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={isDeleting}
          placeholder="Type DELETE"
          className="w-full px-3 py-2 bg-slate-800 border border-purple-900/30 rounded-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="px-4 py-2 border border-purple-700 text-purple-300 rounded-sm hover:bg-purple-900 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isConfirmed || isDeleting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800/50 disabled:cursor-not-allowed text-white rounded-sm transition-colors"
        >
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}
