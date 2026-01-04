
-- Debug RLS Fix: Permissive INSERT policies

-- Drop existing INSERT policies
drop policy if exists "Users can create groups" on marker_groups;
drop policy if exists "Users can insert own markers" on user_personal_markers;

-- Create permissive policies (Temporarily allow any auth user to insert)
-- We still enforce column constraints (owner_id, user_id not null)
create policy "Users can create groups (debug)"
  on marker_groups for insert
  with check (auth.role() = 'authenticated');

create policy "Users can insert markers (debug)"
  on user_personal_markers for insert
  with check (auth.role() = 'authenticated');
