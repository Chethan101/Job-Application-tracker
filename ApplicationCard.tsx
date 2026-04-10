import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building2, MapPin, Calendar, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { Application } from '@/types';
import { formatDate } from '@/utils/constants';

interface Props {
    application: Application;
    onClick: () => void;
}

export default function ApplicationCard({ application, onClick }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: application._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : undefined,
    };

    let ringClass = '';
    let reminderText = null;
    let reminderColorClass = '';

    if (application.followUpDate) {
        const followUp = new Date(application.followUpDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const followUpDay = new Date(followUp.getFullYear(), followUp.getMonth(), followUp.getDate());

        if (followUpDay < today) {
            ringClass = 'ring-1 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
            reminderText = 'Overdue Follow-up';
            reminderColorClass = 'text-red-400 bg-red-400/10 border border-red-500/20';
        } else if (followUpDay.getTime() === today.getTime()) {
            ringClass = 'ring-1 ring-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]';
            reminderText = 'Follow up Today';
            reminderColorClass = 'text-yellow-400 bg-yellow-400/10 border border-yellow-500/20';
        } else if (followUpDay.getTime() === today.getTime() + 86400000) {
            // ringClass = 'ring-1 ring-yellow-500/20';
            reminderText = 'Follow up Tomorrow';
            reminderColorClass = 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/10';
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`glass-card p-4 cursor-pointer hover:border-slate-700 hover:bg-slate-800/60
        transition-all duration-200 hover:shadow-lg hover:shadow-black/20 group
        active:scale-[0.98] select-none ${ringClass}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-100 text-sm truncate group-hover:text-white transition-colors">
                        {application.role}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-xs text-slate-400 truncate">{application.company}</span>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0 group-hover:text-slate-400 transition-colors mt-0.5" />
            </div>

            {/* Skills */}
            {application.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {application.skills.slice(0, 3).map((skill) => (
                        <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs border border-slate-700/50"
                        >
                            {skill}
                        </span>
                    ))}
                    {application.skills.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 text-xs border border-slate-700/50">
                            +{application.skills.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Reminder Pill */}
            {reminderText && (
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-semibold mb-3 ${reminderColorClass}`}>
                    <AlertCircle className="w-3 h-3" />
                    {reminderText}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {application.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-600" />
                            <span className="text-xs text-slate-500 truncate max-w-[80px]">
                                {application.location}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        <span className="text-xs text-slate-500">
                            {formatDate(application.dateApplied)}
                        </span>
                    </div>
                </div>

                {application.resumeSuggestions.length > 0 && (
                    <div title="Has AI suggestions">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                )}
            </div>
        </div>
    );
}
