
-- Function to lookup group details by invite code safely
-- This is needed because non-members cannot 'select' from marker_groups table directly due to RLS

create or replace function lookup_group_by_invite(code_text text)
returns table (id uuid, name text)
language sql
security definer
set search_path = public
as $$
  select id, name
  from marker_groups
  where invite_code = code_text
  limit 1;
$$;
