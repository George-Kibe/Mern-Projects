import { ArrowClockwise, Clock, MagnifyingGlass, WarningCircle } from "@phosphor-icons/react";
import { errorMessage } from "../lib/api";

const icons = {
  empty: MagnifyingGlass,
  error: WarningCircle,
  limited: Clock,
};

// Shared empty / error / rate-limited panel.
const StateMessage = ({ kind = "empty", title, body, action }) => {
  const Icon = icons[kind];
  return (
    <div
      role={kind === "empty" ? "status" : "alert"}
      className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-line px-6 py-16 text-center"
    >
      <Icon size={32} className={kind === "empty" ? "text-ink-faint" : "text-accent"} aria-hidden />
      <div className="flex max-w-[48ch] flex-col gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {body && <p className="text-ink-soft">{body}</p>}
      </div>
      {action}
    </div>
  );
};

export const QueryError = ({ error, onRetry }) => (
  <StateMessage
    kind={error?.isRateLimited ? "limited" : "error"}
    title={error?.isRateLimited ? "Slow down a little" : "Couldn't load this"}
    body={errorMessage(error)}
    action={
      onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          <ArrowClockwise size={16} aria-hidden />
          Try again
        </button>
      )
    }
  />
);

export default StateMessage;
