
-- Fix infinite recursion by using a SECURITY DEFINER function
-- This allows checking the owner of a group without triggering RLS on marker_groups again

create or replace function get_group_owner_id(group_uuid uuid)
returns uuid
language sql
security definer
set search_path = public
as $$
  select owner_id from marker_groups where id = group_uuid;
$$;

-- Drop the recursive policy on marker_group_members
drop policy if exists "Group owners can view members" on marker_group_members;
drop policy if exists "Owners can manage members" on marker_group_members;

-- Re-create the policy using the safe function
create policy "Group owners can view members"
  on marker_group_members for select
  using (
    -- This function call bypasses RLS on marker_groups
    auth.uid() = get_group_owner_id(group_id)
  );

create policy "Owners can manage members"
  on marker_group_members for all
  using (
    auth.uid() = get_group_owner_id(group_id)
  );
