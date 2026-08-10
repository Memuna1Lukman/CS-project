import { BookOpenCheck } from 'lucide-react';

interface AppLogoProps {
  showName?: boolean;
}

export default function AppLogo({ showName = true }: AppLogoProps) {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="w-9 h-9 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center shadow-[0_1px_2px_var(--shadow)]">
        <BookOpenCheck className="w-5 h-5" strokeWidth={2.25} aria-hidden="true" />
      </span>
      {showName && <span>CS Resource Hub</span>}
    </span>
  );
}