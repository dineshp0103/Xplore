export type NodeStatus = 'completed' | 'active' | 'locked';

interface RoadmapNodeProps {
    title: string;
    status: NodeStatus;
    date?: string;
    description?: string;
    isFirst?: boolean;
    isLast?: boolean;
    stepNumber?: number;
    progress?: number;
}

export function RoadmapNode({ title, status, date, description, isFirst, isLast, stepNumber, progress }: RoadmapNodeProps) {
    return (
        <div className={`group relative pl-16 ${status === 'locked' ? 'opacity-70' : ''}`}>
            {/* Connector Lines */}
            {!isFirst && (
                <div className={`absolute left-[1.6rem] -top-12 bottom-1/2 w-1 z-[-1] ml-[2px] ${status === 'completed' || status === 'active' ? 'bg-emerald-500' : 'bg-[#334155]'}`}></div>
            )}
            {!isLast && (
                <div className={`absolute left-[1.6rem] top-1/2 bottom-[-4rem] w-1 z-[-1] ml-[2px] ${status === 'completed' ? 'bg-emerald-500' : (status === 'active' ? 'bg-gradient-to-b from-emerald-500 to-[#137fec]' : 'bg-[#334155]')}`}></div>
            )}

            {/* Node Icon */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                {status === 'active' ? (
                    <div className="relative flex size-16 items-center justify-center">
                        <div className="absolute inset-0 animate-ping rounded-full bg-[#137fec]/30"></div>
                        <div className="relative flex size-14 items-center justify-center rounded-full bg-[#137fec] text-white shadow-[0_0_15px_rgba(19,127,236,0.5)] ring-4 ring-[#f6f7f8] dark:ring-[#101922]">
                            <span className="material-symbols-outlined text-3xl">play_arrow</span>
                        </div>
                    </div>
                ) : status === 'completed' ? (
                    <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-4 ring-[#f6f7f8] dark:ring-[#101922]">
                        <span className="material-symbols-outlined text-2xl">check</span>
                    </div>
                ) : (
                    <div className="flex size-14 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 ring-4 ring-[#f6f7f8] dark:ring-[#101922]">
                        <span className="material-symbols-outlined text-2xl">lock</span>
                    </div>
                )}
            </div>

            {/* Card Content */}
            {status === 'active' ? (
                <div className="relative rounded-xl border-2 border-[#137fec] bg-white dark:bg-[#1e293b] p-6 shadow-[0_0_15px_rgba(19,127,236,0.5)] transition-all">
                    <div className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-[#137fec] text-xs font-bold text-white shadow-sm">{stepNumber}</div>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#137fec]">Current Module</span>
                            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                        </div>
                        <div className="radial-progress text-[#137fec] text-xs font-bold" style={{ '--value': progress, '--size': '3rem' } as any}>{progress}%</div>
                    </div>
                    <div className="mt-4 w-full rounded-full bg-slate-100 dark:bg-slate-700 h-2">
                        <div className="bg-[#137fec] h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            ) : (
                <div className={`flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] p-5 shadow-sm transition-all hover:shadow-md cursor-pointer ${status === 'completed' ? 'hover:border-emerald-500/50' : 'bg-slate-50 dark:bg-[#151e28]'}`}>
                    <div>
                        <h3 className={`text-lg font-bold ${status === 'locked' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{title}</h3>
                        <p className="text-sm text-slate-500">{status === 'completed' ? `Mastered on ${date}` : (status === 'locked' ? `Locked` : description)}</p>
                    </div>
                    {status === 'completed' && (
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">Completed</span>
                            <span className="material-symbols-outlined text-emerald-500">emoji_events</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
