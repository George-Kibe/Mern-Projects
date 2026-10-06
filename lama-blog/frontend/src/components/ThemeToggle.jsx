import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "../lib/theme";

// Icon button in the masthead; `withLabel` renders the wider menu row.
const ThemeToggle = ({ withLabel = false }) => {
  const { isDark, toggle } = useTheme();
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";
  const Icon = isDark ? Sun : Moon;

  if (withLabel) {
    return (
      <button type="button" onClick={toggle} className="btn btn-secondary justify-start" aria-label={label}>
        <Icon size={18} aria-hidden />
        {isDark ? "Light theme" : "Dark theme"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-ghost size-10 min-h-0 p-0"
      aria-label={label}
      title={label}
    >
      <Icon size={20} aria-hidden />
    </button>
  );
};

export default ThemeToggle;
