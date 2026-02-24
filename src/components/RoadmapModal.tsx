'use client';

import { X, Calendar, Building2, Clock, Map } from 'lucide-react';
import { useEffect } from 'react';
import RoadmapGraphView from './RoadmapGraphView';
import { RoadmapStep, NodePositions, StepStatusMap, StepStatus } from '@/types/roadmap';

interface RoadmapModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    company?: string | null;
    steps: RoadmapStep[];
    createdAt?: string;
    roadmapId?: string;
    initialPositions?: NodePositions;
    initialStatus?: StepStatusMap;
    onStatusChange?: (stepId: string, status: StepStatus) => void;
    onPositionsChange?: (positions: NodePositions) => void;
}

export default function RoadmapModal({
    isOpen,
    onClose,
    title,
    company,
    steps,
    createdAt,
    roadmapId,
    initialPositions,
    initialStatus,
    onStatusChange,
    onPositionsChange
}: RoadmapModalProps) {
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
                                Created {new Date(createdAt).toLocaleDateString()}
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
                {/* Content Body - Graph View */}
                <div className="flex-1 overflow-hidden p-6 bg-black/20">
                    <RoadmapGraphView
                        steps={steps}
                        roadmapId={roadmapId}
                        initialPositions={initialPositions}
                        initialStatus={initialStatus}
                        onStatusChange={onStatusChange}
                        onPositionsChange={onPositionsChange}
                        className="h-full bg-transparent border-0"
                    />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/5 dark:bg-white/5 text-center text-xs opacity-50 shrink-0 rounded-b-2xl">
                    Scroll to view full roadmap • Press ESC to close
                </div>
            </div>
        </div>
    );
}
