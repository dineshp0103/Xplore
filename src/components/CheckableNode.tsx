'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Check, Circle, Loader2 } from 'lucide-react';
import { StepStatus } from '@/types/roadmap';

export interface CheckableNodeData {
    label: string;
    duration: string;
    description: string;
    stepId: string;
    status: StepStatus;
    onStatusChange: (stepId: string, newStatus: StepStatus) => void;
    originalStep: {
        title: string;
        duration: string;
        description: string;
        detailedExplanation?: string;
    };
}

const statusColors: Record<StepStatus, { bg: string; border: string; icon: string }> = {
    pending: {
        bg: 'bg-slate-800',
        border: 'border-white/20',
        icon: 'text-gray-400',
    },
    'in-progress': {
        bg: 'bg-amber-900/50',
        border: 'border-amber-500/50',
        icon: 'text-amber-400',
    },
    completed: {
        bg: 'bg-emerald-900/50',
        border: 'border-emerald-500/50',
        icon: 'text-emerald-400',
    },
};

const CheckableNode = memo(({ data, isConnectable }: NodeProps<CheckableNodeData>) => {
    const { label, duration, stepId, status, onStatusChange } = data;
    const colors = statusColors[status];

    const cycleStatus = () => {
        const statusOrder: StepStatus[] = ['pending', 'in-progress', 'completed'];
        const currentIndex = statusOrder.indexOf(status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        onStatusChange(stepId, nextStatus);
    };

    const StatusIcon = () => {
        switch (status) {
            case 'completed':
                return <Check className={`w-4 h-4 ${colors.icon}`} />;
            case 'in-progress':
                return <Loader2 className={`w-4 h-4 ${colors.icon} animate-spin`} />;
            default:
                return <Circle className={`w-4 h-4 ${colors.icon}`} />;
        }
    };

    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl cursor-pointer
        ${colors.bg} ${colors.border}
        border shadow-lg transition-all duration-300
        hover:shadow-xl hover:scale-[1.02]
        min-w-[220px] max-w-[280px]
      `}
        >
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="!bg-blue-500 !border-blue-600 !w-3 !h-3"
            />

            <div className="flex items-start gap-3">
                {/* Status Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        cycleStatus();
                    }}
                    className={`
            flex-shrink-0 mt-0.5 p-1.5 rounded-lg
            border ${colors.border} ${colors.bg}
            hover:bg-white/10 transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-400/50
          `}
                    title={`Status: ${status}. Click to change.`}
                >
                    <StatusIcon />
                </button>

                {/* Node Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate" title={label}>
                        {label}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{duration}</p>
                </div>
            </div>

            {/* Progress indicator bar */}
            {status === 'in-progress' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/30 rounded-b-xl overflow-hidden">
                    <div className="h-full bg-amber-500 animate-pulse" style={{ width: '50%' }} />
                </div>
            )}
            {status === 'completed' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-b-xl" />
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="!bg-blue-500 !border-blue-600 !w-3 !h-3"
            />
        </div>
    );
});

CheckableNode.displayName = 'CheckableNode';

export default CheckableNode;
