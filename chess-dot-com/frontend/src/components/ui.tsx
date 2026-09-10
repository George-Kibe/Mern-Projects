import type { ReactNode } from 'react';

export function Panel({
  title,
  actions,
  children,
  className = '',
  bodyClassName = '',
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-lg border border-line bg-panel ${className}`}>
      {title ? (
        <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
          <h2 className="text-sm font-semibold tracking-wide text-ink">{title}</h2>
          {actions}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Button({
  children,
  onClick,
  variant = 'default',
  disabled,
  className = '',
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const styles = {
    primary: 'bg-accent text-black hover:bg-accent/85',
    danger: 'bg-tag-blunder text-white hover:opacity-85',
    ghost: 'border border-line text-ink-soft hover:border-accent hover:text-ink',
    default: 'bg-panel-soft text-ink hover:bg-line',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1" title={hint}>
      <span className="text-sm text-ink">{label}</span>
      <span
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-line'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4.5' : 'translate-x-0.5'
          }`}
        />
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

export function Select({
  value,
  onChange,
  children,
}: {
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-line bg-panel-soft px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
    >
      {children}
    </select>
  );
}
