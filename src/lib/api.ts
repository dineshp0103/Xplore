import { supabase } from '@/lib/supabase';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Helper to make authenticated requests to the Python backend
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
        throw new Error('No active session');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail || `API request failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * User API
 */
export const api = {
    generateRoadmap: (data: any) => fetchWithAuth('/generate-roadmap', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    verifyProject: (data: { github_url: string; project_description: string }) => fetchWithAuth('/verify-project', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    // Chat is separate as it might stream or have different needs, but using same helper for now
    chat: (message: string, history: any[]) => fetchWithAuth('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
    })
};
