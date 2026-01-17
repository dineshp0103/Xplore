'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import SavedRoadmaps from '@/components/SavedRoadmaps';
import ProfileSection from '@/components/ProfileSection';
import AuthButton from '@/components/AuthButton';

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/');
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
            <header className="glass-panel border-b-0 rounded-none border-b-white/10 py-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <img
                            src="https://lh3.googleusercontent.com/gg/AIJ2gl9NK_8NlyVV_eSphpkgBZlHMxB-UMmbvlsWIocqUcb3zOfBysuRobYtedfcxgCwolVoT_U7VJeHvU2pbTuDIuerlMoZGyhzbWTvcoD82HQVf96I9iG8B7oaoeC6Fr04ziSG923m15xPHVGVnQTWs4fRbgb7UPfhYSohhsApZBBhbK61kKTd=s1024-rj-mp2"
                            alt="Xplore Logo"
                            className="w-8 h-8 rounded-lg object-cover"
                        />
                        Xplore
                    </h1>
                    <AuthButton />
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-white mb-8">User Dashboard</h1>

                <div className="space-y-8">
                    {/* Profile Section */}
                    {/* Note: ProfileSection needs to be updated to Glass UI separately if it hasn't been already. */}
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
