'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, getDocsFromCache } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Map, Calendar, Loader2, ChevronDown } from 'lucide-react';

interface RoadmapStep {
    title: string;
    duration: string;
    description: string;
}

interface SavedRoadmap {
    id: string;
    jobRole: string;
    skillLevel: string;
    steps: RoadmapStep[];
    createdAt: any;
}

export default function SavedRoadmaps() {
    const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (!u) {
                setRoadmaps([]);
                setLoading(false);
                setLastDoc(null);
            } else {
                fetchRoadmaps(u.uid, true);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchRoadmaps = async (userId: string, isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            let q = query(
                collection(db, 'roadmaps'),
                where("userId", "==", userId),
                orderBy("createdAt", "desc"),
                limit(10)
            );

            if (!isInitial && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            // Optimization: For initial load, try cache first for instant feedback.
            // Note: getDocs({ source: 'cache' }) throws if offline/unavailable or empty in some SDK versions,
            // so we wrap in try/catch.
            if (isInitial) {
                try {
                    const cacheSnapshot = await getDocsFromCache(q);
                    if (!cacheSnapshot.empty) {
                        const cacheData = cacheSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as SavedRoadmap[];
                        setRoadmaps(cacheData);
                    }
                } catch (e) {
                    // Ignore cache errors
                }
            }

            const querySnapshot = await getDocs(q);

            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SavedRoadmap[];

            if (isInitial) {
                setRoadmaps(data);
            } else {
                setRoadmaps(prev => [...prev, ...data]);
            }

            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
            setHasMore(querySnapshot.docs.length === 10);

        } catch (error) {
            console.error("Error fetching roadmaps:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (user && !loadingMore && hasMore) {
            fetchRoadmaps(user.uid);
        }
    };

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading saved roadmaps...</div>;
    }

    if (!user) {
        return null;
    }

    if (roadmaps.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <Map className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No saved roadmaps yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Generate your first career path to see it here!</p>
            </div>
        );
    }

    return (
        <div id="saved-roadmaps" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Saved Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roadmaps.map((roadmap) => {
                    const isExpanded = expanded[roadmap.id];

                    return (
                        <div
                            key={roadmap.id}
                            onClick={() => toggleExpand(roadmap.id)}
                            className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md dark:hover:shadow-gray-800 transition-all cursor-pointer relative ${isExpanded ? 'ring-2 ring-blue-50 dark:ring-blue-900/30' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{roadmap.jobRole}</h3>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mt-1">
                                        {roadmap.skillLevel}
                                    </span>
                                </div>
                                <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-blue-50 dark:bg-gray-800'}`}>
                                    <Map className={`w-5 h-5 ${isExpanded ? 'text-blue-700 dark:text-blue-400' : 'text-blue-600 dark:text-blue-500'}`} />
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                {roadmap.steps.slice(0, isExpanded ? undefined : 2).map((step, idx) => (
                                    <div key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                        <div>
                                            <span className={`font-medium ${isExpanded ? 'block mb-1 text-gray-800 dark:text-gray-100' : 'inline'}`}>
                                                {step.title}
                                            </span>
                                            {isExpanded && (
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                                                    {step.description} (Duration: {step.duration})
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isExpanded && roadmap.steps.length > 2 && (
                                    <div className="text-xs text-gray-400 pl-3.5 pt-1">
                                        +{roadmap.steps.length - 2} more steps...
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Created {roadmap.createdAt?.toDate().toLocaleDateString()}
                                </div>
                                <span className="text-blue-500 font-medium">
                                    {isExpanded ? 'Show Less' : 'View Details'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>


            {
                hasMore && roadmaps.length > 0 && (
                    <div className="flex justify-center pt-6">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 disabled:opacity-70 transition-all shadow-sm"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    Load More
                                </>
                            )}
                        </button>
                    </div>
                )
            }
        </div >
    );
}
