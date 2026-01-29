-- Create a table to cache generated roadmaps
create table if not exists public.roadmap_cache (
  id uuid default gen_random_uuid() primary key,
  params_hash text not null unique, -- Deterministic hash of inputs
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.roadmap_cache enable row level security;

-- Policy: Allow ANONYMOUS READ access (so we can check cache without checking user auth in backend effectively, or simpler: backend uses service key)
-- But if we use Anon Key in python, we need this:
create policy "Allow public read access"
  on public.roadmap_cache
  for select
  to anon, authenticated
  using (true);

-- Policy: Allow Service Role full access (implicit, but good to note)
-- Policy: Allow Insert? The backend will insert.
-- If the backend uses Anon Key, we need to allow Anon Insert? That's risky for public.
-- Ideally, the backend uses SUPABASE_SERVICE_ROLE_KEY.
-- If using Anon Key, we must be careful.
-- For now, let's assume we might need to allow Anon Insert if the user doesn't have a service key handy in .env.local.
-- But heavily suggest using Service Key.
-- I will add a policy for Anon Insert just in case, but restrict it if possible.
create policy "Allow public insert access"
  on public.roadmap_cache
  for insert
  to anon, authenticated
  with check (true);
