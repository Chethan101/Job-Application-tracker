import { Outlet, Link, useLocation } from 'react-router-dom';
import { Kanban, LayoutDashboard, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/authSlice';

export default function Layout() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);
    const location = useLocation();
    const isBoard = location.pathname === '/board';

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
                <div className="flex items-center justify-between px-6 py-4">

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30">
                                <Kanban className="w-5 h-5 text-brand-400" />
                            </div>
                            <div className="hidden md:block mr-2">
                                <h1 className="text-base font-bold text-white leading-none">JobTrackr</h1>
                            </div>
                        </div>

                        <nav className="flex items-center gap-2">
                            <Link
                                to="/board"
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isBoard ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                            >
                                <Kanban className="w-4 h-4" /> Board
                            </Link>
                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!isBoard ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                            >
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-slate-400">{user?.email}</span>
                        </div>

                        <button
                            id="global-logout-btn"
                            onClick={() => dispatch(logout())}
                            title="Logout"
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}
