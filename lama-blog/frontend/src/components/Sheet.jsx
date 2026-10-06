import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";

// Bottom sheet built on <dialog>: focus trap, Escape and backdrop close for free.
const Sheet = ({ open, onClose, title, children, footer }) => {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-hidden rounded-t-2xl bg-ground p-0 text-ink backdrop:bg-ink/40 open:flex open:flex-col sm:mx-auto sm:mb-auto sm:max-w-lg sm:rounded-2xl"
      style={{ animation: open ? "sheet-in 320ms var(--ease-out-expo)" : undefined }}
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost size-10 min-h-0 p-0"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      {footer && <div className="border-t border-line px-6 py-4">{footer}</div>}
    </dialog>
  );
};

export default Sheet;
