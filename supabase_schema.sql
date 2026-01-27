-- Create the roadmaps table
create table if not exists roadmaps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  job_role text not null,
  skill_level text not null,
  company text,
  steps jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table roadmaps enable row level security;

-- Create policies
-- Policy to allow users to view their own roadmaps
create policy "Users can view their own roadmaps"
  on roadmaps for select
  using (auth.uid() = user_id);

-- Policy to allow users to insert their own roadmaps
create policy "Users can insert their own roadmaps"
  on roadmaps for insert
  with check (auth.uid() = user_id);

-- Policy to allow users to delete their own roadmaps
create policy "Users can delete their own roadmaps"
  on roadmaps for delete
  using (auth.uid() = user_id);

-- Policy to allow users to update their own roadmaps (optional, but good practice)
create policy "Users can update their own roadmaps"
  on roadmaps for update
  using (auth.uid() = user_id);
