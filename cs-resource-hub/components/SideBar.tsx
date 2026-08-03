import { BookOpen, FolderCheck, Users, PlusCircle, Settings, Layers } from 'lucide-react';

export default function Sidebar({ onOpenUpload }: { onOpenUpload: () => void }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-4 min-h-screen">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20">
            CS
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm leading-tight">Resource Hub</h2>
            <p className="text-[11px] text-slate-400">KNUST Level 100-400</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium">
            <BookOpen className="w-4 h-4" /> Library
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-medium transition">
            <FolderCheck className="w-4 h-4" /> Material Requests
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-medium transition">
            <Users className="w-4 h-4" /> Course Rep Scope
          </a>
        </nav>
      </div>

      {/* Action & User Info */}
      <div className="space-y-3">
        <button
          onClick={onOpenUpload}
          className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" /> Upload Material
        </button>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">
            MS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">Memuna S.</p>
            <p className="text-[10px] text-slate-400 truncate">Course Rep (L100)</p>
          </div>
        </div>
      </div>
    </aside>
  );
}