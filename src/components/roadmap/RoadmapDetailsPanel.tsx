export function RoadmapDetailsPanel() {
    return (
        <aside className="hidden md:flex w-[400px] flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111a22] shadow-xl z-20 h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161f29]">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-[#137fec]/20 text-[#137fec]">MODULE 3</span>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-500">IN PROGRESS</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">React Ecosystem</h2>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span className="font-medium text-slate-900 dark:text-white">65%</span>
                </div>
                <div className="mt-2 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#137fec] w-[65%] rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] skew-x-12 translate-x-[-100%]"></div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Overview</h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                        Deep dive into component lifecycles, hooks, and virtual DOM diffing. You will learn how to build scalable interfaces and manage side effects efficiently using modern React patterns.
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Objectives</h4>
                    <ul className="space-y-3">
                        <ListItem label="Understand JSX and Virtual DOM" completed />
                        <ListItem label="Component Props & State" completed />
                        <ListItem label="useEffect vs useLayoutEffect" />
                        <ListItem label="Custom Hooks creation" />
                        <ListItem label="Performance optimization (useMemo)" />
                    </ul>
                </div>
            </div>

            {/* Sticky Bottom CTA */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111a22]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 uppercase font-bold">Potential Reward</span>
                        <span className="text-lg font-bold text-amber-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">bolt</span> 500 XP
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-500 uppercase font-bold">Est. Time</span>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">~45 Mins</p>
                    </div>
                </div>
                <button className="w-full py-3 px-4 bg-[#137fec] hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                    <span>Continue Learning</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>
        </aside>
    );
}

function ListItem({ label, completed }: { label: string; completed?: boolean }) {
    return (
        <li className="flex items-start gap-3 group">
            {completed ? (
                <div className="mt-0.5 flex-none rounded-full p-0.5 text-emerald-500 bg-emerald-500/10">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
            ) : (
                <div className="mt-0.5 flex-none rounded-full border border-slate-300 dark:border-slate-600 size-5"></div>
            )}
            <span className={`text-sm ${completed ? 'text-slate-700 dark:text-slate-300 line-through opacity-60' : 'text-slate-900 dark:text-white font-medium'}`}>
                {label}
            </span>
        </li>
    );
}
