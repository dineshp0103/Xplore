'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function ActivityGraph() {
    const [activityData, setActivityData] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        // Fetch activity counts for last 7 days from user_activity table
        // For now, we simulate this aggregation as the table is simple
        // In a real app, you might want a SQL function or dedicated stats table
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        const today = new Date().getDay() // 0-6

        // Mocking real data visualization for now since we just created the table
        // and it starts empty. 
        // Logic: Map DB rows found in last 7 days to these bars.
    }, [])

    return (
        <div className="bg-[#192633] rounded-xl p-6 border border-[#233648]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Performance Analytics</h3>
                    <p className="text-xs text-[#92adc9]">Recent activity levels</p>
                </div>
                <select className="bg-[#111a22] border border-[#233648] text-[#92adc9] text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-[#137fec]">
                    <option>This Week</option>
                </select>
            </div>
            {/* CSS Bar Chart - Static for demo purposes but ready for data mapping */}
            <div className="flex items-end justify-between h-48 gap-2 sm:gap-4 w-full">
                <Bar day="M" height="20%" label="Low" />
                <Bar day="T" height="40%" label="Medium" />
                <Bar day="W" height="10%" label="Low" />
                <Bar day="T" height="85%" label="High" active />
                <Bar day="F" height="60%" label="Good" />
                <Bar day="S" height="30%" label="Medium" />
                <Bar day="S" height="10%" label="Rest" />
            </div>
        </div>
    );
}

function Bar({ day, height, label, active }: { day: string; height: string; label: string; active?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
            <div
                className={`w-full max-w-[40px] transition-all rounded-t-sm relative ${active ? 'bg-[#137fec] shadow-[0_0_10px_rgba(19,127,236,0.3)]' : 'bg-[#233648] group-hover:bg-[#137fec]/50'}`}
                style={{ height }}
            >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {label}
                </div>
            </div>
            <span className={`text-xs ${active ? 'text-white font-bold' : 'text-[#92adc9]'}`}>{day}</span>
        </div>
    );
}
