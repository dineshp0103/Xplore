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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-[family-name:var(--font-geist-sans)] transition-colors duration-200">
            <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4 sticky top-0 z-50 transition-colors duration-200">
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">X</span>
                        Xplore
                    </h1>
                    <AuthButton />
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">User Dashboard</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile */}
                    <div className="lg:col-span-3 space-y-8">
                        <ProfileSection />
                    </div>

                    {/* Full Width: Roadmaps */}
                    <div className="lg:col-span-3">
                        <SavedRoadmaps />
                    </div>
                </div>
            </main>
        </div>
    );
}
