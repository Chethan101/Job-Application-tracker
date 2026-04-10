import { useStats } from '@/hooks/useApplications';
import { Loader2, TrendingUp, Briefcase, XCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { STATUS_COLUMNS } from '@/utils/constants';

export default function DashboardPage() {
    const { data, isLoading, isError } = useStats();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950">
                <p className="text-red-400">Failed to load stats</p>
            </div>
        );
    }

    const { statusCounts, timeline } = data;

    const totalApplications = statusCounts.reduce((acc: number, curr: any) => acc + curr.count, 0);

    const getCount = (status: string) => {
        const item = statusCounts.find((s: any) => s._id === status);
        return item ? item.count : 0;
    };

    const offers = getCount('Offer');
    const rejects = getCount('Rejected');
    const interviews = getCount('Interview');

    const offerRate = totalApplications > 0 ? Math.round((offers / totalApplications) * 100) : 0;
    const interviewRate = totalApplications > 0 ? Math.round(((interviews + offers) / totalApplications) * 100) : 0;

    const maxTimelineCount = timeline.length > 0 ? Math.max(...timeline.map((t: any) => t.count)) : 0;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col pt-6 pb-20 px-6 max-w-5xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">Overview of your job search progress</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-400">Total Applications</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalApplications}</p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-400">Interview Rate</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{interviewRate}%</p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-400">Offers</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-white">{offers}</p>
                        <span className="text-sm text-emerald-400">{offerRate}% rate</span>
                    </div>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-400">Rejections</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{rejects}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pipeline / Funnel Chart */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-brand-400" />
                        <h3 className="text-lg font-semibold text-white">Application Pipeline</h3>
                    </div>
                    <div className="space-y-4">
                        {STATUS_COLUMNS.map((status) => {
                            const count = getCount(status);
                            const percentage = totalApplications > 0 ? (count / totalApplications) * 100 : 0;
                            return (
                                <div key={status}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-300">{status}</span>
                                        <span className="text-slate-400">{count}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${status === 'Offer' ? 'bg-emerald-500' :
                                                status === 'Rejected' ? 'bg-red-500' :
                                                    status === 'Interview' ? 'bg-purple-500' :
                                                        'bg-brand-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Timeline Chart */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-brand-400" />
                        <h3 className="text-lg font-semibold text-white">Application Velocity</h3>
                    </div>

                    {timeline.length > 0 ? (
                        <div className="h-48 flex items-end gap-2 mt-4 pt-4 border-b border-slate-800 pb-2">
                            {timeline.map((t: any) => {
                                const heightPercentage = maxTimelineCount > 0 ? (t.count / maxTimelineCount) * 100 : 0;
                                return (
                                    <div key={t._id} className="flex-1 flex flex-col items-center group">
                                        <div className="w-full relative flex justify-center h-full items-end pb-1">
                                            <div
                                                className="w-full max-w-[40px] bg-brand-500/80 hover:bg-brand-400 rounded-t-sm transition-all relative"
                                                style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                    {t.count} apps
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-500 mt-2 rotate-45 origin-left md:rotate-0 md:origin-center">{t._id}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center border border-dashed border-slate-800 rounded-lg">
                            <span className="text-slate-500 text-sm">Not enough data to display timeline</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
