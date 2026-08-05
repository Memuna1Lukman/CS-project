interface FilterPillsProps {
  label: string;
  options: string[];
  active: string | null;
  onChange: (value: string | null) => void;
}

export default function FilterPills({ label, options, active, onChange }: FilterPillsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mr-1">
        {label}
      </span>

      <button
        type="button"
        aria-pressed={active === null}
        onClick={() => onChange(null)}
        className={`px-3 min-h-11 flex items-center rounded-full text-xs font-medium border transition ${
          active === null
            ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-transparent'
            : 'bg-[var(--surface)] border-transparent shadow-[0_1px_2px_var(--shadow)] text-[var(--text-muted)] hover:bg-[var(--surface-3)]'
        }`}
      >
        All
      </button>

      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={active === option}
          onClick={() => onChange(option)}
          className={`px-3 min-h-11 flex items-center rounded-full text-xs font-medium border transition ${
            active === option
              ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-transparent'
              : 'bg-[var(--surface)] border-transparent shadow-[0_1px_2px_var(--shadow)] text-[var(--text-muted)] hover:bg-[var(--surface-3)]'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
