'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, Search, UserCircle } from 'lucide-react';

export default function TopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 h-16 px-4 sm:px-6 bg-[var(--topbar-bg)] text-[var(--topbar-fg)]">
      {onToggleSidebar && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden -ml-1 w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--topbar-hover)]"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="w-8 h-8 rounded-lg bg-[var(--topbar-hover)] flex items-center justify-center font-mono text-xs">
          CS
        </span>
        <span className="hidden sm:inline">CS Resource Hub</span>
      </Link>

      <form role="search" onSubmit={handleSearch} className="flex-1 flex justify-center px-2">
        <div className="relative w-full max-w-md">
          <label htmlFor="global-search" className="sr-only">
            Search courses and resources
          </label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--topbar-fg-muted)]" />
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, resources..."
            className="w-full h-11 pl-9 pr-3 rounded-lg bg-[var(--topbar-hover)] text-[var(--topbar-fg)] placeholder-[var(--topbar-fg-muted)] text-sm outline-none"
          />
        </div>
      </form>

      <Link
        href="/profile"
        className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[var(--topbar-hover)]"
        aria-label="Account"
      >
        <UserCircle className="w-7 h-7" />
      </Link>
    </header>
  );
}
