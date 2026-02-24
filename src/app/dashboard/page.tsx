import { ProgressHero } from "@/components/dashboard/ProgressHero";
import { ActivityGraph } from "@/components/dashboard/ActivityGraph";
import { DailyGoals } from "@/components/dashboard/DailyGoals";
import { StatsWidgets } from "@/components/dashboard/StatsWidgets";

export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back, Alex! 👋</h2>
                    <p className="text-[#92adc9] mt-2">Let's continue your journey to becoming a Full Stack Developer.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg bg-[#233648] text-white text-sm font-medium hover:bg-[#2d465e] transition">View Calendar</button>
                    <button className="px-4 py-2 rounded-lg bg-[#137fec] text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition">Resume Learning</button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column (Main Focus) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <ProgressHero />
                    <ActivityGraph />
                </div>

                {/* Right Column (Widgets) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <DailyGoals />
                    <StatsWidgets />
                </div>
            </div>
        </div>
    );
}
