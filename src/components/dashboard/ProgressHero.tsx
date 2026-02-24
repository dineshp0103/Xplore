'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface Roadmap {
    id: string
    job_role: string
    steps: any[]
}

export function ProgressHero() {
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchActiveRoadmap() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return setLoading(false)

            // Fetch the most recent roadmap
            const { data, error } = await supabase
                .from('roadmaps')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (data) {
                setRoadmap(data)
            }
            setLoading(false)
        }

        fetchActiveRoadmap()
    }, [supabase])

    if (loading) {
        return (
            <div className="bg-[#192633] rounded-xl p-5 border border-[#233648] h-[200px] animate-pulse"></div>
        )
    }

    if (!roadmap) {
        return (
            <div className="bg-[#192633] rounded-xl p-8 border border-[#233648] text-center flex flex-col items-center justify-center min-h-[200px]">
                <div className="bg-[#137fec]/10 p-4 rounded-full mb-4">
                    <span className="material-symbols-outlined text-[#137fec] text-3xl">map</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Active Roadmap</h3>
                <p className="text-[#92adc9] text-sm mb-6 max-w-md">
                    Start your journey by creating a personalized AI learning roadmap tailored to your career goals.
                </p>
                <Link href="/" className="bg-[#137fec] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                    Create Roadmap
                </Link>
            </div>
        )
    }

    // Calculate progress (mock for now, or based on steps if we add status to steps JSON)
    // For now, let's assume valid steps have some progress tracking or default to 0
    const totalSteps = roadmap.steps?.length || 0
    const completedSteps = 0 // Future: calculate from steps status
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    // Find active step (first non-completed)
    const activeStep = roadmap.steps?.[0]

    return (
        <div className="bg-[#192633] rounded-xl p-5 border border-[#233648] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#137fec]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                <div
                    className="w-full md:w-1/3 aspect-video md:aspect-auto bg-cover bg-center rounded-lg shadow-inner flex items-center justify-center bg-[#111a22]"
                    style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop")' }}
                >
                    <div className="bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20">
                        <Link href={`/roadmap/${roadmap.id}`}>
                            <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                        </Link>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-wide">Active Track</span>
                        <Link href={`/roadmap/${roadmap.id}`} className="text-xs text-[#137fec] hover:text-blue-400 flex items-center gap-1">
                            View Roadmap <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                        </Link>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{roadmap.job_role}</h3>
                    <p className="text-[#92adc9] text-sm mb-5 line-clamp-1">
                        {activeStep?.title || "Start your first lesson"}
                    </p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-white font-medium">Course Progress</span>
                            <span className="text-[#137fec] font-bold">{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#324d67] rounded-full overflow-hidden">
                            <div className="h-full bg-[#137fec] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs text-[#92adc9] mt-1">
                            {activeStep ? `Next: ${activeStep.title} (${activeStep.duration})` : 'Ready to start?'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
