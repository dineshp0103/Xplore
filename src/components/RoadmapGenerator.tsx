'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Star, Loader2, Sparkles, Save, Check, Building2, ChevronDown, ChevronUp, AlertCircle, X, Clock, Maximize2, RefreshCw } from 'lucide-react';
import { model, genAI } from '@/lib/gemini';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import RoadmapModal from './RoadmapModal';

interface RoadmapStep {
    title: string;
    duration: string;
    description: string;
    detailedExplanation?: string;
}

interface ValidationResponse {
    isValidRole: boolean;
    validationError?: string; // Reason for invalidity
    roadmap?: RoadmapStep[];
}

export default function RoadmapGenerator() {
    const [jobRole, setJobRole] = useState('');
    const [company, setCompany] = useState('');
    const [hoursPerDay, setHoursPerDay] = useState<number>(2);
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState<RoadmapStep[] | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [quotaResetTime, setQuotaResetTime] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (quotaResetTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = quotaResetTime - now;
                if (diff <= 0) {
                    setQuotaResetTime(null);
                    setTimeLeft(null);
                    setError(null);
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    if (hours > 0) {
                        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
                    } else if (minutes > 0) {
                        setTimeLeft(`${minutes}m ${seconds}s`);
                    } else {
                        setTimeLeft(`${seconds}s`);
                    }
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [quotaResetTime]);

    const handleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in", error);
        }
    };

    const extractRetryDelay = (error: any): number => {
        // Log the error for debugging
        console.log("Extracting retry delay from:", error);

        // 1. Check for standard Google Error structure with retryDelay
        // Example: error.response?.data?.error?.details?.[0]?.retryDelay (depends on library version)

        // 2. Parse from message string "Please retry in X s."
        // Example: "Please retry in 4.258956589s." or "Please retry in 4s."
        const match = error.message?.match(/Please retry in ([\d\.]+)s/);
        if (match && match[1]) {
            return Math.ceil(parseFloat(match[1]) * 1000);
        }

        // 3. Fallback default (60s)
        return 60000;
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobRole) return;
        if (quotaResetTime) return; // Prevent requests if waiting

        setLoading(true);
        setRoadmap(null);
        setSaved(false);
        setError(null);
        setValidationError(null);

        try {
            const basePrompt = `
                Role: "${jobRole}"
                Level: "${skillLevel}"
                ${company ? `Target Company/Workplace: "${company}"` : ''}
                Availability: ${hoursPerDay} hours/day

                Task:
                1. VALIDATION: Check if the parameters are relevant and consistent. 
                   - STRICTLY Check if "${jobRole}" is a real/valid job role.
                   - If a Company is provided ("${company}"), check if it is a valid target for this role. 
                   - CRITICAL: If the user enters a College/University name as the Company (e.g., "IIT Bombay" as company for "Software Engineer"), mark it as INVALID. Students often mistake "Company" for "College".
                   
                2. If INVALID, return "isValidRole": false and a "validationError" message explaining why (e.g., "It looks like you entered a college name in the Company field. Please enter a target company or leave it blank.").

                3. If VALID, create a detailed learning roadmap.
                   - Calculate realistic node durations based on ${hoursPerDay} hours/day.

                Output Format (JSON ONLY):
                {
                    "isValidRole": boolean,
                    "validationError": "string (optional, only if invalid)",
                    "roadmap": [
                        {
                            "title": "Milestone Title",
                            "duration": "Estimated Duration (e.g., '2 weeks' considering ${hoursPerDay}h/day)",
                            "description": "Brief summary",
                            "detailedExplanation": "Detailed explanation including tools and concepts."
                        }
                    ]
                }
                
                Requirements:
                - 4-6 steps.
                - If Company is known, tailor content to their stack.
            `;

            let result;
            try {
                // Only using Primary Model as others returned 404 for this key
                result = await model.generateContent(basePrompt);
            } catch (error: any) {
                // Check for Quota Exceeded (429) source or message
                const isQuota = error.message?.includes("429") || error.message?.includes("Quota exceeded");

                if (isQuota) {
                    console.warn("Primary model quota exceeded.", error.message);

                    // Logic Difference: Daily Quota vs Short-Term Rate Limit
                    const isDaily = error.message?.toLowerCase().includes("daily") || error.message?.toLowerCase().includes("per day");

                    if (isDaily) {
                        // Custom Logic: Reset at 3:30 PM on the next day
                        const now = new Date();
                        const target = new Date(now);
                        target.setDate(now.getDate() + 1); // Next day
                        target.setHours(15, 30, 0, 0); // 3:30 PM

                        setQuotaResetTime(target.getTime());
                        throw new Error(`Daily quota exceeded. Reset at ${target.toLocaleString()}`);
                    } else {
                        // Short-term rate limit (e.g. 15 RPM)
                        const delay = extractRetryDelay(error);
                        setQuotaResetTime(Date.now() + delay);
                        throw new Error(`Rate limit hit. Cooling down for ${Math.ceil(delay / 1000)}s`);
                    }
                }
                // If it's not a quota error (e.g. 500, network), strictly re-throw
                throw error;
            }

            const response = await result.response;
            const text = response.text();
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const data: ValidationResponse = JSON.parse(cleanText);

                if (!data.isValidRole) {
                    setValidationError(data.validationError || "Invalid job role or parameters. Please check your inputs.");
                } else if (data.roadmap) {
                    setRoadmap(data.roadmap);
                } else {
                    setError("Failed to parse roadmap data.");
                }
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                setError("Failed to parse the AI response.");
            }

        } catch (error: any) {
            console.error("Error generating roadmap:", error);
            if (error.message.includes("Quota exceeded") || error.message.includes("Rate limit")) {
                // Error handled by popup logic
            } else {
                setError("Failed to generate roadmap. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            const shouldSignIn = window.confirm("You need to sign in to save your roadmap. Sign in now?");
            if (shouldSignIn) {
                handleSignIn();
            }
            return;
        }

        if (!roadmap) return;
        setSaving(true);
        try {
            await addDoc(collection(db, 'roadmaps'), {
                userId: user.uid,
                jobRole,
                company: company || null,
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
        <div className="max-w-4xl mx-auto p-6 relative">
            {/* Quota Popup */}
            {quotaResetTime && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="glass-panel text-center p-8 rounded-2xl max-w-sm w-full space-y-4 border-red-500/30">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Clock className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-red-400">AI Cooling Down</h3>
                        <p className="text-sm opacity-80">
                            {timeLeft?.includes("h") ? "Daily quota hit. Resets tomorrow." : "High traffic. Taking a short break."}
                        </p>
                        <div className="text-3xl font-mono font-bold text-white py-4">
                            {timeLeft}
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setQuotaResetTime(null)}
                                className="text-sm text-gray-400 hover:text-white underline"
                            >
                                Dismiss (Wait in background)
                            </button>
                            <button
                                onClick={() => {
                                    setQuotaResetTime(null);
                                    // Optional: Trigger re-generate if needed, but manual is safer
                                }}
                                className="flex items-center justify-center gap-2 text-xs font-bold bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors text-blue-300"
                            >
                                <RefreshCw className="w-3 h-3" />
                                False Alarm? Reset Timer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <RoadmapModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={jobRole}
                company={company}
                steps={roadmap || []}
            />

            <div className="glass-panel rounded-xl p-8 mb-8 text-current">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                    Create Your Path
                </h2>

                <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium opacity-80 block">
                                Target Job Role
                            </label>
                            <input
                                id="role"
                                type="text"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder="e.g. Frontend Developer"
                                className="w-full glass-input px-4 py-3 rounded-lg transition-all"
                                required
                            />
                            {validationError && (
                                <div className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-in slide-in-from-top-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationError}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="company" className="text-sm font-medium opacity-80 block">
                                Company / Workplace <span className="opacity-60 text-xs">(Optional)</span>
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3.5 w-5 h-5 opacity-50" />
                                <input
                                    id="company"
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="e.g. Google, Microsoft"
                                    className="w-full glass-input pl-10 px-4 py-3 rounded-lg transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="hours" className="text-sm font-medium opacity-80 block">
                                Availability (Hours/Day)
                            </label>
                            <div className="relative">
                                <input
                                    id="hours"
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={hoursPerDay}
                                    onChange={(e) => setHoursPerDay(parseInt(e.target.value) || 1)}
                                    className="w-full glass-input px-4 py-3 rounded-lg transition-all"
                                />
                                <Clock className="absolute right-4 top-3.5 w-5 h-5 opacity-50 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="level" className="text-sm font-medium opacity-80 block">
                                Current Skill Level
                            </label>
                            <div className="relative">
                                <select
                                    id="level"
                                    value={skillLevel}
                                    onChange={(e) => setSkillLevel(e.target.value)}
                                    className="w-full glass-input px-4 py-3 rounded-lg appearance-none bg-transparent"
                                >
                                    <option value="Beginner" className="text-black dark:text-white bg-white dark:bg-black">Beginner</option>
                                    <option value="Intermediate" className="text-black dark:text-white bg-white dark:bg-black">Intermediate</option>
                                    <option value="Advanced" className="text-black dark:text-white bg-white dark:bg-black">Advanced</option>
                                </select>
                                <Star className="absolute right-4 top-3.5 w-5 h-5 opacity-50 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading || !!quotaResetTime}
                            className="w-full glass-button px-8 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing & Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Personalized Roadmap
                                </>
                            )}
                        </button>

                        {error && !quotaResetTime && (
                            <div className="p-4 bg-red-500/20 text-red-200 border border-red-500/30 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {roadmap && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Your Personalized Roadmap
                            {company && <span className="text-blue-500 dark:text-blue-400 text-sm font-normal">for {company}</span>}
                        </h3>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="glass-button p-2 rounded-lg"
                                title="Enlarge Roadmap"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || saved}
                                className={`glass-button flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-lg transition-all ${saved ? 'border-green-500/50 text-green-600 dark:text-green-400' : ''
                                    }`}
                            >
                                {saved ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Saved
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
                        </div>
                    </div>

                    <div className="relative border-l-2 border-blue-500/30 ml-4 space-y-8 pb-4">
                        {roadmap.map((step, index) => (
                            <div key={index} className="relative pl-8">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

                                <div
                                    className="glass-panel rounded-xl p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group"
                                    onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                        <h4 className="text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {step.title}
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-blue-500/30 text-blue-600 dark:text-blue-300">
                                                {step.duration}
                                            </span>
                                            {expandedStep === index ?
                                                <ChevronUp className="w-5 h-5 opacity-60" /> :
                                                <ChevronDown className="w-5 h-5 opacity-60" />
                                            }
                                        </div>
                                    </div>

                                    <p className="opacity-80 leading-relaxed mb-2">
                                        {step.description}
                                    </p>

                                    {expandedStep === index && step.detailedExplanation && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 text-sm opacity-80 animate-in fade-in slide-in-from-top-2">
                                            <h5 className="text-blue-600 dark:text-blue-400 font-semibold mb-2">In-depth Guide:</h5>
                                            <p>{step.detailedExplanation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
