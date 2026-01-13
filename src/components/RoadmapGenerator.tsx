'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Star, Loader2, Sparkles, Save, Check } from 'lucide-react';
import { model } from '@/lib/gemini';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

interface RoadmapStep {
    title: string;
    duration: string;
    description: string;
}

export default function RoadmapGenerator() {
    const [jobRole, setJobRole] = useState('');
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState<RoadmapStep[] | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobRole) return;

        setLoading(true);
        setRoadmap(null);
        setSaved(false);

        try {
            const prompt = `
        Create a detailed learning roadmap for becoming a "${jobRole}" starting from a "${skillLevel}" level.
        Return the response strictly as a JSON array of objects with the following keys:
        - "title": Title of the milestone (e.g., "Foundations").
        - "duration": Estimated duration (e.g., "1-2 Weeks").
        - "description": specific topics to learn.
        
        The roadmap should have 4-6 distinct steps leading to job readiness.
        Do not include markdown formatting or backticks in the response. Just the raw JSON.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            const data: RoadmapStep[] = JSON.parse(cleanText);
            setRoadmap(data);
        } catch (error) {
            console.error("Error generating roadmap:", error);
            alert("Failed to generate roadmap. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user || !roadmap) return;
        setSaving(true);
        try {
            await addDoc(collection(db, 'roadmaps'), {
                userId: user.uid,
                jobRole,
                skillLevel,
                steps: roadmap,
                createdAt: serverTimestamp()
            });
            setSaved(true);
        } catch (error) {
            console.error("Error saving roadmap:", error);
            alert("Failed to save roadmap.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                    Create Your Path
                </h2>

                <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium text-gray-700 block">
                                Target Job Role
                            </label>
                            <input
                                id="role"
                                type="text"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder="e.g. Frontend Developer"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="level" className="text-sm font-medium text-gray-700 block">
                                Current Skill Level
                            </label>
                            <div className="relative">
                                <select
                                    id="level"
                                    value={skillLevel}
                                    onChange={(e) => setSkillLevel(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none bg-white transition-all text-gray-900"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                                <Star className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating Plan...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Roadmap
                            </>
                        )}
                    </button>
                </form>
            </div>

            {roadmap && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Your Personalized Roadmap
                        </h3>
                        {user && (
                            <button
                                onClick={handleSave}
                                disabled={saving || saved}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${saved
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {saved ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Saved to Profile
                                    </>
                                ) : saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Roadmap
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="relative border-l-2 border-gray-100 ml-4 space-y-12 pb-4">
                        {roadmap.map((step, index) => (
                            <div key={index} className="relative pl-8">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-500" />

                                <div className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <h4 className="text-lg font-bold text-gray-900">{step.title}</h4>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {step.duration}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
