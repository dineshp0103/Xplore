-- Create the users table to store profile data
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  display_name text,
  country text,
  phone text,
  education jsonb,
  workplace jsonb,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policies

-- Allow users to view their own profile
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

-- Allow users to insert their own profile
create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Grant access to authenticated users
grant all on table public.users to authenticated;
