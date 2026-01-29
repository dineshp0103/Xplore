'use client';

import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Position,
    Node,
    Edge,
    ConnectionLineType,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { motion } from 'framer-motion';

interface RoadmapStep {
    title: string;
    duration: string;
    description: string;
    detailedExplanation?: string;
}

interface RoadmapGraphViewProps {
    steps: RoadmapStep[];
    onNodeClick?: (step: RoadmapStep) => void;
}

const nodeWidth = 250;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: 'TB' }); // Top to Bottom

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

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

export default function RoadmapGraphView({ steps, onNodeClick }: RoadmapGraphViewProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (!steps || steps.length === 0) return;

        // Transform steps into Nodes and Edges
        const newNodes: Node[] = steps.map((step, index) => ({
            id: index.toString(),
            type: index === 0 ? 'input' : index === steps.length - 1 ? 'output' : 'default',
            data: {
                label: (
                    <div className="p-2">
                        <div className="font-bold text-sm truncate" title={step.title}>{step.title}</div>
                        <div className="text-xs opacity-70 mt-1">{step.duration}</div>
                    </div>
                ),
                originalStep: step // Store full data
            },
            position: { x: 0, y: 0 }, // Calculated by dagre later
            style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '12px',
                width: nodeWidth,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }
        }));

        const newEdges: Edge[] = steps.map((_, index) => {
            if (index === steps.length - 1) return null;
            return {
                id: `e${index}-${index + 1}`,
                source: index.toString(),
                target: (index + 1).toString(),
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#60a5fa', strokeWidth: 2 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#60a5fa',
                },
            };
        }).filter(Boolean) as Edge[];

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            newNodes,
            newEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [steps, setNodes, setEdges]);

    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (onNodeClick && node.data.originalStep) {
            onNodeClick(node.data.originalStep);
        }
    }, [onNodeClick]);

    return (
        <div className="w-full h-[500px] glass-panel rounded-xl overflow-hidden border border-white/10 relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                fitView
                attributionPosition="bottom-right"
                className="bg-slate-900/50"
            >
                <Background color="#aaa" gap={16} size={1} className="opacity-20" />
                <Controls className="bg-white/10 border-white/10 text-white fill-white" />
                <MiniMap
                    nodeStrokeColor={(n) => '#60a5fa'}
                    nodeColor={(n) => '#1e293b'}
                    maskColor="rgba(0, 0, 0, 0.6)"
                    className="bg-black/40 border border-white/10 rounded-lg"
                />
            </ReactFlow>
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-xs text-white/50 pointer-events-none">
                Interactive Graph
            </div>
        </div>
    );
}
