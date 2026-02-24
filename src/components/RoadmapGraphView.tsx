'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Position,
    Node,
    Edge,
    MarkerType,
    NodeDragHandler,
    ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { supabase } from '@/lib/supabase';
import CheckableNode, { CheckableNodeData } from './CheckableNode';
import { StepStatus, NodePositions, StepStatusMap, RoadmapStep } from '@/types/roadmap';
import { Maximize2 } from 'lucide-react';
import StepDetailsPanel from './StepDetailsPanel';

// Removed local RoadmapStep interface to use the one from '@/types/roadmap'

interface RoadmapGraphViewProps {
    steps: RoadmapStep[];
    roadmapId?: string; // Supabase roadmap ID for persistence
    initialPositions?: NodePositions;
    initialStatus?: StepStatusMap;
    onNodeClick?: (step: RoadmapStep) => void;
    onStatusChange?: (stepId: string, status: StepStatus) => void;
    onPositionsChange?: (positions: NodePositions) => void;
    className?: string;
}

const nodeWidth = 250;
const nodeHeight = 100;

// Define custom node types
const nodeTypes = {
    checkable: CheckableNode,
};

// ... existing helper functions ...

const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    savedPositions?: NodePositions
) => {
    // If we have saved positions, use them instead of auto-layout
    if (savedPositions && Object.keys(savedPositions).length > 0) {
        nodes.forEach((node) => {
            if (savedPositions[node.id]) {
                node.position = savedPositions[node.id];
            }
            node.targetPosition = Position.Top;
            node.sourcePosition = Position.Bottom;
        });
        return { nodes, edges };
    }

    // Otherwise, use Dagre for auto-layout
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 50 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = Position.Top;
        node.sourcePosition = Position.Bottom;
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
};

export default function RoadmapGraphView({
    steps,
    roadmapId,
    initialPositions,
    initialStatus,
    onNodeClick,
    onStatusChange,
    onPositionsChange,
    className
}: RoadmapGraphViewProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [stepStatus, setStepStatus] = useState<StepStatusMap>(initialStatus || {});
    // Ref to hold current status for callbacks to avoid stale closures
    const stepStatusRef = React.useRef(stepStatus);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);

    // Keep ref in sync with state
    useEffect(() => {
        stepStatusRef.current = stepStatus;
    }, [stepStatus]);

    // Calculate progress percentage
    const progressPercentage = useMemo(() => {
        if (steps.length === 0) return 0;
        const completedCount = Object.values(stepStatus).filter(s => s === 'completed').length;
        return Math.round((completedCount / steps.length) * 100);
    }, [stepStatus, steps.length]);

    // Handle status change from custom node
    // Handle status change from custom node
    const handleStatusChange = useCallback(async (stepId: string, newStatus: StepStatus) => {
        // Use ref to avoid stale closures
        const currentStatusMap = stepStatusRef.current;
        const newStepStatus = { ...currentStatusMap, [stepId]: newStatus };

        setStepStatus(newStepStatus);

        // Update nodes with new status
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === stepId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            status: newStatus,
                        },
                    };
                }
                return node;
            })
        );

        // Callback for parent component
        onStatusChange?.(stepId, newStatus);

        // Persist to Supabase
        if (roadmapId) {
            try {
                setIsSaving(true);
                await supabase
                    .from('roadmaps')
                    .update({ step_status: newStepStatus })
                    .eq('id', roadmapId);
            } catch (error) {
                console.error('Failed to save step status:', error);
            } finally {
                setIsSaving(false);
            }
        }
    }, [roadmapId, onStatusChange, setNodes]);

    // Handle node drag end - persist positions
    const onNodeDragStop: NodeDragHandler = useCallback(async (event, node) => {
        if (!roadmapId) return;

        // Get all current node positions
        const currentPositions: NodePositions = {};
        nodes.forEach((n) => {
            currentPositions[n.id] = n.position;
        });
        // Update with dragged node's new position
        currentPositions[node.id] = node.position;

        onPositionsChange?.(currentPositions);

        // Persist to Supabase
        try {
            setIsSaving(true);
            await supabase
                .from('roadmaps')
                .update({ node_positions: currentPositions })
                .eq('id', roadmapId);
        } catch (error) {
            console.error('Failed to save node positions:', error);
        } finally {
            setIsSaving(false);
        }
    }, [nodes, roadmapId, onPositionsChange]);

    // Fit view button handler
    const handleFitView = useCallback(() => {
        if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2 });
        }
    }, [reactFlowInstance]);

    // Initialize nodes and edges
    useEffect(() => {
        if (!steps || steps.length === 0) return;

        // Generate step IDs if not present
        const stepsWithIds = steps.map((step, index) => ({
            ...step,
            id: step.id || index.toString(),
        }));

        // Initialize status for steps that don't have one
        const currentDataStatus = stepStatusRef.current; // Use ref to avoid dependency
        const initializedStatus = { ...currentDataStatus };

        stepsWithIds.forEach((step) => {
            if (!initializedStatus[step.id!]) {
                initializedStatus[step.id!] = 'pending';
            }
        });

        // Only update state if we added new keys
        if (Object.keys(initializedStatus).length !== Object.keys(currentDataStatus).length) {
            setStepStatus(initializedStatus);
            // Updating state will update ref in next render, and we don't need to re-run this effect immediately
        }

        // Create nodes with custom type
        const newNodes: Node<CheckableNodeData>[] = stepsWithIds.map((step) => ({
            id: step.id!,
            type: 'checkable',
            data: {
                label: step.title,
                duration: step.duration,
                description: step.description,
                stepId: step.id!,
                status: initializedStatus[step.id!] || 'pending',
                onStatusChange: handleStatusChange,
                originalStep: step,
            },
            position: { x: 0, y: 0 },
        }));

        // Create edges
        // Create edges based on dependencies or linear fallback
        let newEdges: Edge[] = [];
        const hasDependencies = stepsWithIds.some(s => s.dependencies && s.dependencies.length > 0);

        if (hasDependencies) {
            // DAG Mode: Create edges from dependencies
            stepsWithIds.forEach((step) => {
                if (step.dependencies) {
                    step.dependencies.forEach((depId) => {
                        // Find if dependency exists (sanity check)
                        if (stepsWithIds.some(s => s.id === depId)) {
                            const currentStatus = initializedStatus[depId]; // Source status determines edge color
                            const isCompleted = currentStatus === 'completed';

                            newEdges.push({
                                id: `e${depId}-${step.id}`,
                                source: depId,
                                target: step.id!,
                                type: 'smoothstep',
                                animated: !isCompleted,
                                style: {
                                    stroke: isCompleted ? '#10b981' : '#60a5fa',
                                    strokeWidth: 2,
                                },
                                markerEnd: {
                                    type: MarkerType.ArrowClosed,
                                    color: isCompleted ? '#10b981' : '#60a5fa',
                                },
                            });
                        }
                    });
                }
            });
        } else {
            // Linear Fallback Mode (Legacy)
            newEdges = stepsWithIds.slice(0, -1).map((step, index) => {
                const nextStep = stepsWithIds[index + 1];
                const currentStatus = initializedStatus[step.id!];
                const isCompleted = currentStatus === 'completed';

                return {
                    id: `e${step.id}-${nextStep.id}`,
                    source: step.id!,
                    target: nextStep.id!,
                    type: 'smoothstep',
                    animated: !isCompleted,
                    style: {
                        stroke: isCompleted ? '#10b981' : '#60a5fa',
                        strokeWidth: 2,
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: isCompleted ? '#10b981' : '#60a5fa',
                    },
                };
            });
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            newNodes,
            newEdges,
            initialPositions
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [steps, initialPositions, handleStatusChange, setNodes, setEdges]); // Removed stepStatus from deps

    // Update edges when status changes
    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => {
                const sourceStatus = stepStatus[edge.source];
                const isCompleted = sourceStatus === 'completed';
                return {
                    ...edge,
                    animated: !isCompleted,
                    style: {
                        stroke: isCompleted ? '#10b981' : '#60a5fa',
                        strokeWidth: 2,
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: isCompleted ? '#10b981' : '#60a5fa',
                    },
                };
            })
        );
    }, [stepStatus, setEdges]);

    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (node.data.originalStep) {
            setSelectedStep(node.data.originalStep);
        }
        if (onNodeClick && node.data.originalStep) {
            onNodeClick(node.data.originalStep);
        }
    }, [onNodeClick]);

    return (
        <div className="w-full h-[500px] glass-panel rounded-xl overflow-hidden border border-white/10 relative">
            <StepDetailsPanel
                step={selectedStep}
                isOpen={!!selectedStep}
                onClose={() => setSelectedStep(null)}
            />
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-black/30 backdrop-blur-sm">
                <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs text-white/70">
                        Progress: {progressPercentage}%
                    </span>
                    <div className="flex items-center gap-2">
                        {isSaving && (
                            <span className="text-xs text-blue-400 animate-pulse">Saving...</span>
                        )}
                        <button
                            onClick={handleFitView}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title="Fit to view"
                        >
                            <Maximize2 className="w-3.5 h-3.5 text-white/70" />
                        </button>
                    </div>
                </div>
                <div className="h-1 bg-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onNodeDragStop={onNodeDragStop}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
                className="bg-slate-900/50"
                style={{ paddingTop: '48px' }}
            >
                <Background color="#aaa" gap={16} size={1} className="opacity-20" />
                <Controls className="bg-white/10 border-white/10 text-white fill-white" />
                <MiniMap
                    nodeStrokeColor={() => '#60a5fa'}
                    nodeColor={(node) => {
                        const status = stepStatus[node.id];
                        if (status === 'completed') return '#10b981';
                        if (status === 'in-progress') return '#f59e0b';
                        return '#1e293b';
                    }}
                    maskColor="rgba(0, 0, 0, 0.6)"
                    className="bg-black/40 border border-white/10 rounded-lg"
                />
            </ReactFlow>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-2 rounded-lg text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                        <span className="text-white/60">Pending</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-white/60">In Progress</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-white/60">Completed</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
