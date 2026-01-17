'use client';

import { X, Calendar, Building2, Clock, Map } from 'lucide-react';
import { useEffect } from 'react';

interface RoadmapStep {
    title: string;
    duration: string;
    description: string;
    detailedExplanation?: string;
}

interface RoadmapModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    company?: string | null;
    steps: RoadmapStep[];
    createdAt?: any;
}

export default function RoadmapModal({ isOpen, onClose, title, company, steps, createdAt }: RoadmapModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">

                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-white/10 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Map className="w-6 h-6 text-blue-500" />
                            {title}
                        </h2>
                        {company && (
                            <div className="flex items-center gap-2 mt-2 text-blue-400">
                                <Building2 className="w-4 h-4" />
                                <span className="font-medium">{company}</span>
                            </div>
                        )}
                        {createdAt && (
                            <div className="flex items-center gap-2 mt-1 text-xs opacity-60">
                                <Calendar className="w-3 h-3" />
                                Created {new Date(createdAt.seconds * 1000).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 opacity-60 hover:opacity-100" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    <div className="relative border-l-2 border-blue-500/30 ml-4 space-y-12 pb-4">
                        {steps.map((step, index) => (
                            <div key={index} className="relative pl-8 group">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] ring-4 ring-black/5 dark:ring-white/5" />

                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <h3 className="text-xl font-bold group-hover:text-blue-500 transition-colors">
                                            {step.title}
                                        </h3>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 self-start sm:self-auto">
                                            <Clock className="w-3.5 h-3.5" />
                                            {step.duration}
                                        </span>
                                    </div>

                                    <p className="opacity-80 leading-relaxed text-lg">
                                        {step.description}
                                    </p>

                                    {step.detailedExplanation && (
                                        <div className="bg-black/5 dark:bg-white/5 rounded-xl p-5 border border-black/5 dark:border-white/5 text-sm opacity-90 mt-4">
                                            <h4 className="font-semibold text-blue-500 mb-2 flex items-center gap-2">
                                                In-Depth Guide
                                            </h4>
                                            <p className="leading-relaxed">
                                                {step.detailedExplanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/5 dark:bg-white/5 text-center text-xs opacity-50 shrink-0 rounded-b-2xl">
                    Scroll to view full roadmap • Press ESC to close
                </div>
            </div>
        </div>
    );
}
