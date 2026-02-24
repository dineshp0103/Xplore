import React from 'react';
import { Rocket, Code2, Layers, Trophy } from 'lucide-react';
import { CapstoneProject } from '@/types/roadmap';

interface ProjectCardProps {
    project: CapstoneProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'beginner': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'advanced': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        }
    };

    return (
        <div className="w-full glass-panel rounded-xl border border-white/10 shadow-lg overflow-hidden mt-8 animate-in slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 p-6 text-white backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md shadow-inner border border-white/20">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Capstone Project</h2>
                            <p className="text-blue-100/80 text-sm">Build this to master your skills</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getDifficultyColor(project.difficulty)} bg-black/40 backdrop-blur-md`}>
                        {project.difficulty}
                    </span>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">
                    {project.title}
                </h3>
                <p className="text-white/60 leading-relaxed mb-6 text-sm">
                    {project.description}
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Features */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
                            <Trophy className="w-4 h-4 text-amber-500" /> Key Features
                        </h4>
                        <ul className="space-y-2.5">
                            {project.keyFeatures.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
                            <Layers className="w-4 h-4 text-purple-500" /> Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {project.techStack.map((tech, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors cursor-default"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
