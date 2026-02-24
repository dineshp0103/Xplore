import React from 'react';
import { X, ExternalLink, PlayCircle, BookOpen, FileText } from 'lucide-react';
import { RoadmapStep, Resource } from '@/types/roadmap';
import ReactMarkdown from 'react-markdown';

interface StepDetailsPanelProps {
    step: RoadmapStep | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function StepDetailsPanel({ step, isOpen, onClose }: StepDetailsPanelProps) {
    if (!step) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-4 h-4 text-red-500" />;
            case 'documentation': return <BookOpen className="w-4 h-4 text-blue-500" />;
            default: return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Slide-over Panel */}
            <div className={`fixed right-0 top-0 h-full w-full md:w-[450px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="p-6 h-full overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{step.title}</h2>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                {step.duration}
                            </span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Detailed Explanation */}
                    <div className="prose dark:prose-invert max-w-none mb-8">
                        <h3 className="text-lg font-semibold mb-3">Overview</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {step.description}
                        </p>

                        {step.detailedExplanation && (
                            <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                                <ReactMarkdown>{step.detailedExplanation}</ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Resources Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" /> Recommended Resources
                        </h3>

                        <div className="space-y-3">
                            {step.resources && step.resources.length > 0 ? (
                                step.resources.map((res, idx) => (
                                    <a
                                        key={idx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group bg-white dark:bg-gray-800"
                                    >
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                            {getIcon(res.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {res.title}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize">{res.type}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                    </a>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No specific resources generated for this step.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
