export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen font-[family-name:var(--font-geist-sans)] animate-pulse">
            <header className="glass-panel border-b-0 rounded-none border-b-white/10 py-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                    <div className="w-32 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                    <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="w-48 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8"></div>

                <div className="space-y-8">
                    {/* Profile Skeleton */}
                    <div className="glass-panel rounded-xl p-6 h-64 bg-gray-100/50 dark:bg-gray-800/20"></div>

                    {/* Roadmaps Skeleton */}
                    <div className="space-y-6">
                        <div className="w-40 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-panel rounded-xl p-6 h-48 bg-gray-100/50 dark:bg-gray-800/20"></div>
                            <div className="glass-panel rounded-xl p-6 h-48 bg-gray-100/50 dark:bg-gray-800/20"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
