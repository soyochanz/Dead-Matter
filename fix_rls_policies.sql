
-- Drop the problematic recursive policy
drop policy if exists "Members can view other members" on marker_group_members;

-- Allow users to see their own membership rows
-- This is necessary for the "groups I am in" check to work
create policy "Members can view own membership"
  on marker_group_members for select
  using (user_id = auth.uid());

-- Allow group owners to see all members of their groups
-- This avoids recursion because looking up marker_groups by owner_id is a direct check
create policy "Group owners can view members"
  on marker_group_members for select
  using (
    exists (
      select 1 from marker_groups
      where id = marker_group_members.group_id
      and owner_id = auth.uid()
    )
  );
