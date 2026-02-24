-- Create the table
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT CHECK (activity_type IN ('login', 'roadmap_created', 'lesson_completed', 'project_verified')),
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity
CREATE POLICY "Users can view own activity" 
ON public.user_activity FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own activity
CREATE POLICY "Users can insert own activity" 
ON public.user_activity FOR INSERT 
WITH CHECK (auth.uid() = user_id);
