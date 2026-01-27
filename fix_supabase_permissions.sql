-- Grant permissions to the table
GRANT ALL ON TABLE roadmaps TO anon, authenticated, service_role;

-- Ensure RLS is enabled
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Users can insert their own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Users can delete their own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Users can update their own roadmaps" ON roadmaps;

-- Recreate policies
CREATE POLICY "Users can view their own roadmaps"
ON roadmaps FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmaps"
ON roadmaps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps"
ON roadmaps FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
ON roadmaps FOR UPDATE
USING (auth.uid() = user_id);
