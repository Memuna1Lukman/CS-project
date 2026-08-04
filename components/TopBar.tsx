'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogOut, Menu, Search, UserCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useSession } from './MockSessionProvider';
import type { Role } from '@/types/resource';

const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Student',
  REP: 'Course Rep',
  SUPER_ADMIN: 'Super Admin',
};

export default function TopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter();
  const { session, signOut } = useSession();
  const [query, setQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    setMobileSearchOpen(false);
  };

  if (mobileSearchOpen) {
    return (
      <header className="sticky top-0 z-40 flex items-center gap-2 h-16 px-4 bg-[var(--topbar-bg)] text-[var(--topbar-fg)] border-b border-[var(--border)] sm:hidden">
        <button
          type="button"
          onClick={() => setMobileSearchOpen(false)}
          className="-ml-1 w-11 h-11 shrink-0 flex items-center justify-center rounded-lg hover:bg-[var(--surface-3)]"
          aria-label="Close search"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <form role="search" onSubmit={handleSearch} className="flex-1 min-w-0">
          <label htmlFor="global-search-mobile" className="sr-only">
            Search courses and resources
          </label>
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              id="global-search-mobile"
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, resources..."
              className="w-full h-11 pl-9 pr-3 rounded-lg bg-[var(--surface-2)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none"
            />
          </div>
        </form>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 flex items-center gap-2 sm:gap-3 h-16 px-4 sm:px-6 bg-[var(--topbar-bg)] text-[var(--topbar-fg)] border-b border-[var(--border)]">
      {onToggleSidebar && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden -ml-1 w-11 h-11 shrink-0 flex items-center justify-center rounded-lg hover:bg-[var(--surface-3)]"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight shrink-0">
        <span className="w-8 h-8 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center font-mono text-xs">
          CS
        </span>
        <span className="hidden sm:inline">CS Resource Hub</span>
      </Link>

      {/* Mobile: icon-only trigger that opens the full-row search overlay above */}
      <button
        type="button"
        onClick={() => setMobileSearchOpen(true)}
        className="sm:hidden ml-auto w-11 h-11 shrink-0 flex items-center justify-center rounded-lg hover:bg-[var(--surface-3)]"
        aria-label="Search courses and resources"
      >
        <Search className="w-5 h-5" />
      </button>

      <form role="search" onSubmit={handleSearch} className="hidden sm:flex flex-1 min-w-0 justify-center px-2">
        <div className="relative w-full max-w-md">
          <label htmlFor="global-search" className="sr-only">
            Search courses and resources
          </label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, resources..."
            className="w-full h-11 pl-9 pr-3 rounded-lg bg-[var(--surface-2)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none"
          />
        </div>
      </form>

      <ThemeToggle />

      {session ? (
        <>
          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-2 pl-2 pr-3 h-11 rounded-full hover:bg-[var(--surface-3)] max-w-[12rem]"
          >
            <span className="w-7 h-7 shrink-0 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center text-xs font-bold">
              {session.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex flex-col leading-tight text-left">
              <span className="text-xs font-semibold truncate">{session.email}</span>
              <span className="text-[10px] text-[var(--text-muted)] truncate">
                {ROLE_LABELS[session.role]} · Level {session.level}
              </span>
            </span>
          </Link>

          <Link
            href="/profile"
            className="sm:hidden w-11 h-11 shrink-0 flex items-center justify-center rounded-full hover:bg-[var(--surface-3)]"
            aria-label="Account"
          >
            <UserCircle className="w-7 h-7" />
          </Link>

          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out"
            className="hidden sm:flex w-11 h-11 shrink-0 items-center justify-center rounded-full hover:bg-[var(--surface-3)]"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </>
      ) : (
        <Link
          href="/sign-in"
          className="px-3.5 min-h-11 flex items-center rounded-lg text-sm font-semibold bg-[var(--accent)] text-[var(--accent-fg)]"
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
