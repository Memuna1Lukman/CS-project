import { Resource } from '@/types/resource';
import { Download, ExternalLink, FileText, Book, HelpCircle, FileCode } from 'lucide-react';

const typeBadgeStyles: Record<string, { bg: string; text: string; icon: any }> = {
  SLIDES: { bg: 'bg-amber-100', text: 'text-amber-700', icon: FileText },
  PAST_QUESTION: { bg: 'bg-rose-100', text: 'text-rose-700', icon: HelpCircle },
  LAB_MANUAL: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FileCode },
  BOOK: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Book },
  OTHER: { bg: 'bg-slate-100', text: 'text-slate-700', icon: FileText },
};

export default function ResourceCard({ resource }: { resource: Resource }) {
  const badge = typeBadgeStyles[resource.type] || typeBadgeStyles.OTHER;
  const Icon = badge.icon;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-3">
      {/* Top Metadata */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${badge.bg} ${badge.text}`}>
          <Icon className="w-3 h-3" />
          {resource.type.replace('_', ' ')}
        </span>
        <span className="text-[11px] text-slate-400 font-medium">{resource.academicYear}</span>
      </div>

      {/* Main Content */}
      <div>
        <div className="text-xs font-bold text-emerald-600">{resource.courseCode}</div>
        <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 mt-0.5">
          {resource.title}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">{resource.courseTitle}</p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
        <span>{resource.fileSize || 'External Link'}</span>
        
        <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition">
          {resource.externalUrl ? (
            <>Open <ExternalLink className="w-3 h-3" /></>
          ) : (
            <>Download <Download className="w-3 h-3" /></>
          )}
        </button>
      </div>
    </div>
  );
}