'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, getDocsFromCache, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Map, Calendar, Loader2, ChevronDown, Building2, Maximize2, Trash2 } from 'lucide-react';
import RoadmapModal from './RoadmapModal';

interface RoadmapStep {
    title: string;
    duration: string;
    description: string;
    detailedExplanation?: string;
}

interface SavedRoadmap {
    id: string;
    jobRole: string;
    skillLevel: string;
    company?: string;
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
    const [selectedRoadmap, setSelectedRoadmap] = useState<SavedRoadmap | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        let unsubscribeSnapshot: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (!u) {
                setRoadmaps([]);
                setLoading(false);
                if (unsubscribeSnapshot) unsubscribeSnapshot();
            } else {
                const q = query(
                    collection(db, 'roadmaps'),
                    where("userId", "==", u.uid),
                    orderBy("createdAt", "desc"),
                    limit(20)
                );

                unsubscribeSnapshot = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as SavedRoadmap[];

                    setRoadmaps(data);
                    setLoading(false);

                    if (snapshot.docs.length > 0) {
                        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
                        setLastDoc(lastVisible);
                        setHasMore(snapshot.docs.length === 20);
                    } else {
                        setHasMore(false);
                    }
                });
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const handleLoadMore = async () => {
        if (!user || loadingMore || !hasMore || !lastDoc) return;

        setLoadingMore(true);
        try {
            const q = query(
                collection(db, 'roadmaps'),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc"),
                startAfter(lastDoc),
                limit(10)
            );

            const snapshot = await getDocs(q);
            const newDocs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SavedRoadmap[];

            if (newDocs.length > 0) {
                setRoadmaps(prev => [...prev, ...newDocs]);
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }
            setHasMore(snapshot.docs.length === 10);

        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleDelete = async (roadmapId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this roadmap? This action cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, "roadmaps", roadmapId));
        } catch (error) {
            console.error("Error deleting roadmap:", error);
            alert("Failed to delete roadmap.");
        }
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;

        setExpanded(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) {
        return <div className="text-center py-8 opacity-60">Loading saved roadmaps...</div>;
    }

    if (!user) {
        return null;
    }

    if (roadmaps.length === 0) {
        return (
            <div className="text-center py-12 glass-panel rounded-xl">
                <Map className="w-12 h-12 opacity-50 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No saved roadmaps yet</h3>
                <p className="opacity-60">Generate your first career path to see it here!</p>
            </div>
        );
    }

    return (
        <div id="saved-roadmaps" className="space-y-6 scroll-mt-24">
            <RoadmapModal
                isOpen={!!selectedRoadmap}
                onClose={() => setSelectedRoadmap(null)}
                title={selectedRoadmap?.jobRole || ''}
                company={selectedRoadmap?.company}
                steps={selectedRoadmap?.steps || []}
                createdAt={selectedRoadmap?.createdAt}
            />

            <h2 className="text-2xl font-bold flex items-center gap-2">
                Your Saved Paths
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roadmaps.map((roadmap) => {
                    const isExpanded = expanded[roadmap.id];

                    return (
                        <div
                            key={roadmap.id}
                            onClick={(e) => toggleExpand(roadmap.id, e)}
                            className={`glass-panel rounded-xl p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer relative group ${isExpanded ? 'border-blue-400/50 shadow-blue-500/20' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                        {roadmap.jobRole}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 opacity-80 border border-black/5 dark:border-white/10">
                                            {roadmap.skillLevel}
                                        </span>
                                        {roadmap.company && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30">
                                                <Building2 className="w-3 h-3" />
                                                {roadmap.company}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRoadmap(roadmap);
                                        }}
                                        className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                                        title="Maximize"
                                    >
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(roadmap.id, e)}
                                        className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5 opacity-70 hover:opacity-100" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                {roadmap.steps.slice(0, isExpanded ? undefined : 2).map((step, idx) => (
                                    <div key={idx} className="text-sm opacity-80 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <div className="w-full">
                                            <span className={`font-bold ${isExpanded ? 'block mb-1' : 'inline'}`}>
                                                {step.title}
                                            </span>
                                            {isExpanded && (
                                                <p className="opacity-70 text-xs mt-1 leading-relaxed border-l border-gray-300 dark:border-white/10 pl-2 ml-0.5">
                                                    {step.description} <br />
                                                    <span className="text-blue-500 dark:text-blue-400 font-medium">Duration: {step.duration}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isExpanded && roadmap.steps.length > 2 && (
                                    <div className="text-xs opacity-60 pl-3.5 pt-1 font-medium">
                                        +{roadmap.steps.length - 2} more steps...
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-xs opacity-50 border-t border-gray-200 dark:border-white/10 pt-4 mt-auto">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Created {roadmap.createdAt?.toDate ? roadmap.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                </div>
                                <span className="text-blue-500 dark:text-blue-400 font-bold group-hover:underline">
                                    {isExpanded ? 'Show Less' : 'Click to Toggle'}
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
                            className="glass-button flex items-center gap-2 px-6 py-2.5 font-bold rounded-lg transition-all disabled:opacity-50"
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
