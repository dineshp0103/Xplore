'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Star, Loader2, Sparkles, Save, Check, Building2, ChevronDown, ChevronUp, AlertCircle, X, Clock, Maximize2, RefreshCw, Layout, List } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import RoadmapModal from './RoadmapModal';
import RoadmapGraphView from './RoadmapGraphView';

import ProjectCard from './ProjectCard';
import { RoadmapStep, CapstoneProject } from '@/types/roadmap';

interface ValidationResponse {
    isValidRole: boolean;
    validationError?: string; // Reason for invalidity
    roadmap?: RoadmapStep[];
    suggestedProject?: CapstoneProject;
}

interface RoadmapGeneratorProps {
    onSaved?: () => void;
}

export default function RoadmapGenerator({ onSaved }: RoadmapGeneratorProps) {
    const [jobRole, setJobRole] = useState('');
    const [company, setCompany] = useState('');
    const [hoursPerDay, setHoursPerDay] = useState<number>(2);
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [loading, setLoading] = useState(false);
    const [roadmapData, setRoadmapData] = useState<ValidationResponse | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [savedRoadmapId, setSavedRoadmapId] = useState<string | null>(null);
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('graph'); // Default to graph since it is cooler


    const [error, setError] = useState<string | null>(null);
    const [quotaResetTime, setQuotaResetTime] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
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
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                },
            });
        } catch (error) {
            console.error("Error signing in", error);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobRole) return;

        // Security: Input Validation
        if (jobRole.length > 50 || company.length > 50) {
            setValidationError("Inputs are too long. Please keep them under 50 characters.");
            return;
        }
        // Basic sanitization
        const cleanRole = jobRole.replace(/[<>]/g, "").trim();
        const cleanCompany = company.replace(/[<>]/g, "").trim();

        if (cleanRole.length < 2) {
            setValidationError("Job role is too short.");
            return;
        }

        setLoading(true);
        setRoadmapData(null);
        setSaved(false);
        setSavedRoadmapId(null);
        setError(null);
        setValidationError(null);

        try {
            const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');
            const response = await fetch(`${backendUrl}/api/generate-roadmap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobRole: cleanRole,
                    company: cleanCompany,
                    hoursPerDay,
                    skillLevel
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate roadmap');
            }

            const data: ValidationResponse = await response.json();

            if (!data.isValidRole) {
                setValidationError(data.validationError || "Invalid job role or parameters. Please check your inputs.");
            } else if (data.roadmap) {
                setRoadmapData(data);
            } else {
                setError("Failed to parse roadmap data.");
            }

        } catch (error: any) {
            console.error("Error generating roadmap:", error);
            let msg = error.message || "Failed to generate roadmap. Please try again.";

            // Check for quota error
            if (msg.includes("429") || msg.includes("Quota Exceeded") || msg.includes("Server busy")) {
                msg = "Server busy (High Traffic). Please try again in 1 minute.";
                // Trigger cooldown timer if implemented
                setQuotaResetTime(Date.now() + 60000); // 1 minute
                setTimeLeft("1m 0s");
            }

            setError(msg);
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

        if (!roadmapData?.roadmap) return;
        setSaving(true);
        try {
            // Add IDs to steps if not present
            const stepsWithIds = roadmapData.roadmap.map((step, index) => ({
                ...step,
                id: `step-${index}`
            }));

            const { data, error: insertError } = await supabase
                .from('roadmaps')
                .insert({
                    user_id: user.id,
                    job_role: jobRole,
                    company: company || null,
                    skill_level: skillLevel,
                    steps: stepsWithIds,
                    // Initialize empty tracking data
                    node_positions: {},
                    step_status: {}
                })
                .select('id')
                .single();

            if (insertError) throw insertError;

            setSaved(true);
            setSavedRoadmapId(data?.id || null);
            // Update roadmap with IDs
            setRoadmapData({ ...roadmapData, roadmap: stepsWithIds });
            if (onSaved) onSaved();
        } catch (error: any) {
            console.error("Error saving roadmap:", error);
            alert(`Failed to save roadmap: ${error.message || error.details || "Unknown error"}`);
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
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedStep(null);
                }}
                title={selectedStep ? selectedStep.title : jobRole}
                company={selectedStep ? undefined : company}
                steps={selectedStep ? [selectedStep] : (roadmapData?.roadmap || [])}
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

            {roadmapData?.roadmap && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Your Personalized Roadmap
                            {company && <span className="text-blue-500 dark:text-blue-400 text-sm font-normal">for {company}</span>}
                        </h3>

                        <div className="flex items-center gap-2">
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 mr-2">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    title="List View"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('graph')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'graph' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    title="Graph View"
                                >
                                    <Layout className="w-4 h-4" />
                                </button>
                            </div>

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

                    {viewMode === 'graph' ? (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <RoadmapGraphView
                                steps={roadmapData.roadmap}
                                roadmapId={savedRoadmapId || undefined}
                            />
                            {roadmapData.suggestedProject && (
                                <ProjectCard project={roadmapData.suggestedProject} />
                            )}
                            <p className="text-center text-xs opacity-50 mt-2">
                                {savedRoadmapId
                                    ? 'Click status icons to track progress. Drag nodes to customize layout.'
                                    : 'Save the roadmap to enable progress tracking and layout persistence.'}
                            </p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-blue-500/30 ml-4 space-y-8 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {roadmapData.roadmap.map((step, index) => (
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
                    )}
                </div>
            )}
        </div>
    );
}
