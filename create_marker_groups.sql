-- Create marker_groups table
create table if not exists marker_groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references auth.users not null,
  invite_code text unique default encode(gen_random_bytes(6), 'hex'),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table marker_groups enable row level security;

-- Create marker_group_members table
create table if not exists marker_group_members (
  group_id uuid references marker_groups on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text check (role in ('owner', 'member')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (group_id, user_id)
);

alter table marker_group_members enable row level security;

-- Add columns to user_personal_markers
alter table user_personal_markers 
add column if not exists group_id uuid references marker_groups on delete cascade,
add column if not exists visibility text check (visibility in ('private', 'group')) default 'private';

-- RLS Policies for Groups
create policy "Groups valid members can view"
  on marker_groups for select
  using (
    auth.uid() = owner_id or 
    exists (
      select 1 from marker_group_members 
      where group_id = marker_groups.id and user_id = auth.uid()
    )
  );

create policy "Users can create groups"
  on marker_groups for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update groups"
  on marker_groups for update
  using (auth.uid() = owner_id);

create policy "Owners can delete groups"
  on marker_groups for delete
  using (auth.uid() = owner_id);

-- RLS Policies for Group Members
create policy "Members can view other members"
  on marker_group_members for select
  using (
    exists (
      select 1 from marker_group_members as mem 
      where mem.group_id = marker_group_members.group_id and mem.user_id = auth.uid()
    )
  );

create policy "Users can join (insert self)"
  on marker_group_members for insert
  with check (auth.uid() = user_id);

create policy "Owners can manage members"
  on marker_group_members for all
  using (
    exists (
      select 1 from marker_groups 
      where id = marker_group_members.group_id and owner_id = auth.uid()
    )
  );

-- RLS Policy for Shared Markers
create policy "Group members can view shared markers"
  on user_personal_markers for select
  using (
    visibility = 'group' and
    exists (
      select 1 from marker_group_members
      where group_id = user_personal_markers.group_id and user_id = auth.uid()
    )
  );
