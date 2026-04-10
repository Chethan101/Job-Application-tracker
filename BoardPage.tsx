import { useState, useCallback } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { Plus, Sparkles, Loader2, Search, Filter, Download } from 'lucide-react';
import {
    useApplications,
    useCreateApplication,
    useUpdateApplication,
    useDeleteApplication,
} from '@/hooks/useApplications';
import { Application, ApplicationStatus, CreateApplicationPayload } from '@/types';
import { STATUS_COLUMNS } from '@/utils/constants';
import KanbanColumn from '@/components/KanbanColumn';
import ApplicationModal from '@/components/ApplicationModal';
import ApplicationCard from '@/components/ApplicationCard';
import { exportToCSV } from '@/utils/csv';

export default function BoardPage() {
    const { data: applications = [], isLoading, isError } = useApplications();
    const createMutation = useCreateApplication();
    const updateMutation = useUpdateApplication();
    const deleteMutation = useDeleteApplication();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application | undefined>();
    const [activeApp, setActiveApp] = useState<Application | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All');

    // DnD sensors — require 8px movement to start drag (prevents accidental drags on click)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const getColumnApps = useCallback(
        (status: ApplicationStatus) =>
            applications.filter((a) => {
                if (a.status !== status) return false;

                // Search filter
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    const matchesSearch =
                        a.company.toLowerCase().includes(q) ||
                        a.role.toLowerCase().includes(q) ||
                        (a.location?.toLowerCase() || '').includes(q);
                    if (!matchesSearch) return false;
                }

                return true;
            }),
        [applications, searchQuery]
    );

    const handleDragStart = (event: DragStartEvent) => {
        const app = applications.find((a) => a._id === event.active.id);
        setActiveApp(app ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveApp(null);
        const { active, over } = event;
        if (!over) return;

        const draggedApp = applications.find((a) => a._id === active.id);
        if (!draggedApp) return;

        // Determine target status: either a column ID or another card's column
        let targetStatus: ApplicationStatus | undefined;
        if (STATUS_COLUMNS.includes(over.id as ApplicationStatus)) {
            targetStatus = over.id as ApplicationStatus;
        } else {
            const targetApp = applications.find((a) => a._id === over.id);
            if (targetApp) targetStatus = targetApp.status;
        }

        if (targetStatus && targetStatus !== draggedApp.status) {
            updateMutation.mutate({
                id: draggedApp._id,
                data: { status: targetStatus },
            });
        }
    };

    const openCreateModal = () => {
        setSelectedApp(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (app: Application) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedApp(undefined);
    };

    const handleSave = (data: CreateApplicationPayload) => {
        if (selectedApp) {
            updateMutation.mutate(
                { id: selectedApp._id, data },
                { onSuccess: closeModal }
            );
        } else {
            createMutation.mutate(data, { onSuccess: closeModal });
        }
    };

    const handleDelete = () => {
        if (!selectedApp) return;
        deleteMutation.mutate(selectedApp._id, { onSuccess: closeModal });
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-950">
            {/* Board Controls */}
            <div className="border-b border-slate-800/60 bg-slate-900/50">
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-4">
                    <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-4">

                        {/* Search Input */}
                        <div className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="input-field pl-9 h-9 min-w-[200px] text-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        </div>

                        {/* Status Filter */}
                        <div className="relative hidden md:block">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as ApplicationStatus | 'All')}
                                className="input-field pl-8 h-9 text-sm appearance-none bg-slate-800"
                            >
                                <option value="All">All Statuses</option>
                                {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        </div>
                    </div>

                    <div className="flex w-full sm:w-auto items-center gap-4 justify-end">
                        <button
                            onClick={() => exportToCSV(applications)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-700/50 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none transition-colors"
                            title="Export to CSV"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                        </button>

                        <button
                            id="add-application-btn"
                            onClick={openCreateModal}
                            className="btn-primary"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Application</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Search/Filter (visible on small screens) */}
                <div className="md:hidden px-6 pb-4 flex gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="input-field pl-8 h-8 text-xs"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as ApplicationStatus | 'All')}
                        className="input-field h-8 text-xs bg-slate-800"
                    >
                        <option value="All">All Filter</option>
                        {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Stats bar */}
                <div className="px-6 pb-3 flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        <span>
                            <span className="text-slate-300 font-medium">{applications.length}</span> total applications
                        </span>
                    </div>
                    {STATUS_COLUMNS.map((status) => {
                        const count = getColumnApps(status).length;
                        if (count === 0) return null;
                        return (
                            <span key={status} className="text-xs text-slate-600">
                                {status}: <span className="text-slate-400">{count}</span>
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Board */}
            <main className="flex-1 p-6 overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                            <p className="text-slate-500 text-sm">Loading your applications...</p>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-red-400 font-medium">Failed to load applications</p>
                            <p className="text-slate-500 text-sm mt-1">Check your connection and try again</p>
                        </div>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-5 pb-4" style={{ minWidth: 'max-content' }}>
                            {STATUS_COLUMNS
                                .filter(status => statusFilter === 'All' || status === statusFilter)
                                .map((status) => (
                                    <KanbanColumn
                                        key={status}
                                        status={status}
                                        applications={getColumnApps(status)}
                                        onCardClick={openEditModal}
                                    />
                                ))}
                        </div>

                        {/* Drag overlay — shows a ghost card while dragging */}
                        <DragOverlay>
                            {activeApp ? (
                                <div className="rotate-2 opacity-90 shadow-2xl">
                                    <ApplicationCard application={activeApp} onClick={() => { }} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}

                {/* Empty state */}
                {!isLoading && !isError && applications.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-20 text-center animate-fade-in">
                        <div className="w-20 h-20 rounded-3xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mb-5">
                            <Sparkles className="w-10 h-10 text-brand-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Start tracking your applications</h2>
                        <p className="text-slate-400 text-sm max-w-sm mb-6">
                            Paste a job description and let AI automatically fill in the details and generate tailored resume tips.
                        </p>
                        <button onClick={openCreateModal} className="btn-primary text-base px-6 py-3">
                            <Plus className="w-5 h-5" /> Add Your First Application
                        </button>
                    </div>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && (
                <ApplicationModal
                    application={selectedApp}
                    onClose={closeModal}
                    onSave={handleSave}
                    onDelete={selectedApp ? handleDelete : undefined}
                    isSaving={createMutation.isPending || updateMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                />
            )}
        </div>
    );
}
