import { Level } from '@/types/resource';

const LEVELS: Level[] = [100, 200, 300, 400];

interface SidebarProps {
  activeLevel: Level;
  onSelectLevel: (level: Level) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeLevel, onSelectLevel, open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed top-16 inset-x-0 bottom-0 z-20 bg-[var(--scrim)] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static top-16 bottom-0 md:top-auto md:bottom-auto left-0 z-30 w-64 shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border)] p-4 transform transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <p className="px-3 pt-2 pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--sidebar-fg-muted)]">
          Level
        </p>
        <nav aria-label="Level" className="space-y-1">
          {LEVELS.map((level) => {
            const isActive = level === activeLevel;
            return (
              <button
                key={level}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  onSelectLevel(level);
                  onClose();
                }}
                className={`w-full text-left px-3 min-h-11 flex items-center rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-[var(--canvas-bg)] text-[var(--sidebar-fg)]'
                    : 'text-[var(--sidebar-fg-muted)] hover:bg-[var(--canvas-bg)]'
                }`}
              >
                Level {level}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
