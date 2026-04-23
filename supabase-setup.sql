-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('admin', 'field_agent')) default 'field_agent',
  created_at timestamp with time zone default now()
);

-- Fields table
create table if not exists fields (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  crop_type text not null,
  planting_date date not null,
  current_stage text check (current_stage in ('Planted', 'Growing', 'Ready', 'Harvested')) default 'Planted',
  assigned_agent_id uuid references profiles(id),
  last_update_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Field updates (audit log for observations)
create table if not exists field_updates (
  id uuid default uuid_generate_v4() primary key,
  field_id uuid references fields(id) on delete cascade not null,
  agent_id uuid references profiles(id) not null,
  previous_stage text,
  new_stage text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Disable RLS for assessment (enable in production)
alter table profiles disable row level security;
alter table fields disable row level security;
alter table field_updates disable row level security;

-- Indexes for performance
create index if not exists idx_fields_agent on fields(assigned_agent_id);
create index if not exists idx_fields_stage on fields(current_stage);
create index if not exists idx_updates_field on field_updates(field_id);