import { Resource } from '@/types/resource';
import ResourceCard from './ResourceCard';

interface KanbanBoardProps {
  resources: Resource[];
  groupBy: 'type' | 'level' | 'status';
}

export default function KanbanBoard({ resources, groupBy }: KanbanBoardProps) {
  // Define columns dynamically based on selected grouping
  const getColumns = () => {
    if (groupBy === 'type') {
      return [
        { key: 'SLIDES', label: 'Lecture Slides' },
        { key: 'PAST_QUESTION', label: 'Past Questions' },
        { key: 'LAB_MANUAL', label: 'Lab Manuals' },
        { key: 'BOOK', label: 'Textbooks' },
      ];
    }
    if (groupBy === 'level') {
      return [
        { key: '100', label: 'Level 100' },
        { key: '200', label: 'Level 200' },
        { key: '300', label: 'Level 300' },
        { key: '400', label: 'Level 400' },
      ];
    }
    return [
      { key: 'ACTIVE', label: 'Active Materials' },
      { key: 'REMOVED', label: 'Archived / Soft Deleted' },
    ];
  };

  const columns = getColumns();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {columns.map((col) => {
        const colResources = resources.filter((res) => {
          if (groupBy === 'type') return res.type === col.key;
          if (groupBy === 'level') return res.level.toString() === col.key;
          return res.status === col.key;
        });

        return (
          <div key={col.key} className="bg-slate-100/60 rounded-2xl p-3 border border-slate-200/50 space-y-3">
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{col.label}</h2>
              <span className="text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                {colResources.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3">
              {colResources.length > 0 ? (
                colResources.map((res) => <ResourceCard key={res.id} resource={res} />)
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  No materials found
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}