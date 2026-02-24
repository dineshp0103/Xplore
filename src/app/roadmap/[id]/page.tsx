import { RoadmapNode } from "@/components/roadmap/RoadmapNode";
import { RoadmapDetailsPanel } from "@/components/roadmap/RoadmapDetailsPanel";

// Required for static export
export function generateStaticParams() {
    return [
        { id: '1' },
        { id: '2' },
        { id: '3' },
    ];
}

export default function RoadmapPage() {
    return (
        <div className="flex h-full relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(19,127,236,0.05)_0%,transparent_50%)] pointer-events-none z-0"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none z-0"></div>

            {/* Left Area: Roadmap Canvas */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden h-full">
                {/* Breadcrumbs & Heading */}
                <div className="flex-none px-8 pt-6 pb-2">
                    <div className="flex flex-wrap gap-2 mb-4 items-center text-sm">
                        <a href="#" className="text-slate-400 hover:text-[#137fec] transition-colors">Home</a>
                        <span className="text-slate-600 dark:text-slate-500">/</span>
                        <a href="#" className="text-slate-400 hover:text-[#137fec] transition-colors">Career Paths</a>
                        <span className="text-slate-600 dark:text-slate-500">/</span>
                        <span className="text-slate-900 dark:text-white font-medium">Senior Frontend Engineer</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">My Career Path</h1>
                            <p className="text-slate-500 dark:text-slate-400">Track your progress and verify skills to unlock new opportunities.</p>
                        </div>
                        <div className="flex gap-4">
                            {/* Stats */}
                            <div className="flex items-center gap-3 bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 shadow-sm">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Level</span>
                                    <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">12</span>
                                </div>
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">XP</span>
                                    <span className="text-xl font-bold text-[#137fec] leading-none">4,500</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Roadmap Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 relative scroll-smooth">
                    {/* Connectors Layer (Main Vertical Line) */}
                    <div className="absolute left-16 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 z-0 ml-[1.6rem]"></div>

                    {/* Nodes Container */}
                    <div className="relative z-10 space-y-12 pb-24 max-w-3xl mx-auto md:mx-0 md:ml-8">
                        <RoadmapNode
                            title="HTML & CSS Fundamentals"
                            status="completed"
                            date="Oct 12, 2023"
                            isFirst
                        />
                        <RoadmapNode
                            title="JavaScript ES6+"
                            status="completed"
                            date="Nov 05, 2023"
                        />
                        <RoadmapNode
                            title="React Ecosystem"
                            status="active"
                            stepNumber={3}
                            progress={65}
                            description="Deep dive into hooks, state, and lifecycle."
                        />
                        <RoadmapNode
                            title="State Management"
                            status="locked"
                            description="Locked • Prerequisite: React Ecosystem"
                        />
                        <RoadmapNode
                            title="API Integration & Data Fetching"
                            status="locked"
                            description="Locked"
                            isLast
                        />
                    </div>
                </div>

                {/* Floating Controls */}
                <div className="fixed bottom-8 right-8 md:right-[420px] flex flex-col gap-2 z-20">
                    <button className="size-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1e293b] text-slate-700 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                    <button className="size-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1e293b] text-slate-700 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">remove</span>
                    </button>
                </div>
            </div>

            {/* Right Sidebar Details Panel */}
            <RoadmapDetailsPanel />
        </div>
    );
}
