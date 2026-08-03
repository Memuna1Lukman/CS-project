import { Search, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  groupBy: 'type' | 'level' | 'status';
  setGroupBy: (val: 'type' | 'level' | 'status') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({ groupBy, setGroupBy, searchQuery, setSearchQuery }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Academic Library</h1>
        <p className="text-xs text-slate-400">Search and access course slides, lab manuals, and past questions</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search code, title, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        {/* Group By Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="bg-transparent text-xs text-slate-600 font-medium focus:outline-none pr-2 cursor-pointer"
          >
            <option value="type">Group by Type</option>
            <option value="level">Group by Level</option>
            <option value="status">Group by Status</option>
          </select>
        </div>
      </div>
    </header>
  );
}