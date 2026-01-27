'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SavedRoadmaps from '@/components/SavedRoadmaps';
import ProfileSection from '@/components/ProfileSection';
import AuthButton from '@/components/AuthButton';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
            } else {
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
            <header className="glass-panel border-b-0 rounded-none border-b-white/10 py-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Back to Home"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                                <Image
                                    src="/icon.png"
                                    alt="Xplore Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            Xplore
                        </h1>
                    </div>
                    <AuthButton />
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-white mb-8">User Dashboard</h1>

                <div className="space-y-8">
                    {/* Profile Section */}
                    <div className="glass-panel rounded-xl p-6">
                        <ProfileSection />
                    </div>

                    {/* Roadmaps */}
                    <div>
                        <SavedRoadmaps />
                    </div>
                </div>
            </main>
        </div>
    );
}
