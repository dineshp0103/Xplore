// Roadmap Types for Xplore

export type StepStatus = 'pending' | 'in-progress' | 'completed';

// Add this new type
export interface Resource {
    title: string;
    type: 'video' | 'article' | 'course' | 'documentation';
    url: string;
}

export interface RoadmapStep {
    id?: string; // Generated if not provided by Gemini
    title: string;
    duration: string;
    description: string;
    detailedExplanation?: string;
    resources?: Resource[]; // <--- NEW FIELD
    dependencies?: string[]; // IDs of prerequisite steps
}

export interface CapstoneProject {
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    keyFeatures: string[];
    techStack: string[];
}

export interface RoadmapData {
    isValidRole: boolean;
    validationError?: string;
    roadmap?: RoadmapStep[];
    suggestedProject?: CapstoneProject;
}

export interface Roadmap {
    id: string; // UUID from Supabase
    user_id?: string;
    job_role: string;
    skill_level: string;
    company?: string;
    steps: RoadmapStep[]; // The steps array from Gemini
    created_at: string;

    // New Tracking Fields
    node_positions?: Record<string, { x: number; y: number }>;
    step_status?: Record<string, StepStatus>;
}

// Position map for React Flow nodes
export interface NodePositions {
    [nodeId: string]: { x: number; y: number };
}

// Status map for step completion tracking
export interface StepStatusMap {
    [stepId: string]: StepStatus;
}
