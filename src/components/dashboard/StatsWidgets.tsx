'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function StatsWidgets() {
    const [xp, setXp] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        async function fetchStats() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Sum total XP from activity table
            const { data, error } = await supabase
                .from('user_activity')
                .select('xp_earned')
                .eq('user_id', user.id)

            if (data) {
                const totalXp = data.reduce((acc, curr) => acc + (curr.xp_earned || 0), 0)
                setXp(totalXp)
            }
        }
        fetchStats()
    }, [supabase])

    // Simple level calculation: 100 XP per level
    const level = Math.floor(xp / 100) + 1
    const nextLevelXp = level * 100
    const progressToNext = xp % 100
    const progressPercent = (progressToNext / 100) * 100

    return (
        <div className="bg-[#192633] rounded-xl border border-[#233648] p-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Achievements</h3>
                <a href="#" className="text-xs text-[#137fec] hover:text-blue-400">View All</a>
            </div>

            {/* Level Ring Area */}
            <div className="flex items-center gap-4 mb-6 bg-[#111a22] p-3 rounded-lg border border-[#233648]">
                <div className="relative size-12 flex items-center justify-center">
                    <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                        <path className="text-[#233648]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                        <path className="text-[#137fec]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${progressPercent}, 100`} strokeWidth="4"></path>
                    </svg>
                    <span className="absolute text-xs font-bold text-white">Lvl {level}</span>
                </div>
                <div>
                    <p className="text-sm font-bold text-white">Code Warrior</p>
                    <p className="text-xs text-[#92adc9]">{xp} / {nextLevelXp} XP to Level {level + 1}</p>
                </div>
            </div>

            {/* Recent Badges */}
            <div>
                <p className="text-xs text-[#92adc9] font-bold uppercase tracking-wider mb-3">Recent Badges</p>
                <div className="flex gap-3">
                    <Badge icon="emoji_events" color="text-yellow-500" bg="from-yellow-400/20 to-orange-500/20" border="border-yellow-500/30" label="7 Day Streak" />
                    <Badge icon="code" color="text-purple-400" bg="from-purple-400/20 to-pink-500/20" border="border-purple-500/30" label="First Commit" />
                    <Badge icon="school" color="text-blue-400" bg="from-blue-400/20 to-cyan-500/20" border="border-blue-500/30" label="Quiz Master" />

                    <div className="size-10 border border-dashed border-[#233648] rounded-full flex items-center justify-center text-[#92adc9]">
                        <span className="text-xs">+3</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ icon, color, bg, border, label }: { icon: string; color: string; bg: string; border: string; label: string }) {
    return (
        <div className="group relative flex flex-col items-center gap-1 cursor-help">
            <div className={`size-10 bg-gradient-to-br ${bg} border ${border} rounded-full flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${color} text-lg`}>{icon}</span>
            </div>
            <div className="absolute -top-8 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {label}
            </div>
        </div>
    );
}
