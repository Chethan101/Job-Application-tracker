import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Application, ApplicationStatus } from '@/types';
import { STATUS_COLUMN_COLORS, STATUS_HEADER_COLORS } from '@/utils/constants';
import ApplicationCard from './ApplicationCard';

interface Props {
    status: ApplicationStatus;
    applications: Application[];
    onCardClick: (app: Application) => void;
}

const STATUS_ICONS: Record<ApplicationStatus, string> = {
    Applied: '📤',
    'Phone Screen': '📞',
    Interview: '🎯',
    Offer: '🎉',
    Rejected: '❌',
};

export default function KanbanColumn({ status, applications, onCardClick }: Props) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div className="flex flex-col w-72 flex-shrink-0">
            {/* Column Header */}
            <div
                className={`flex items-center justify-between mb-3 px-1`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-base">{STATUS_ICONS[status]}</span>
                    <h2 className={`font-semibold text-sm ${STATUS_HEADER_COLORS[status]}`}>
                        {status}
                    </h2>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {applications.length}
                </span>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 min-h-[200px] rounded-xl border-2 border-dashed p-2 transition-all duration-200
          ${isOver
                        ? `${STATUS_COLUMN_COLORS[status]} bg-slate-800/30`
                        : 'border-slate-800/60 bg-slate-900/30'
                    }`}
            >
                <SortableContext
                    items={applications.map((a) => a._id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2">
                        {applications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <p className="text-slate-600 text-xs">Drop cards here</p>
                            </div>
                        ) : (
                            applications.map((app) => (
                                <ApplicationCard
                                    key={app._id}
                                    application={app}
                                    onClick={() => onCardClick(app)}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
