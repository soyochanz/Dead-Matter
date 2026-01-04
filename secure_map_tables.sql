
-- 1. Enable RLS on core map tables
alter table map_markers enable row level security;
alter table marker_categories enable row level security;
alter table marker_loot_tags enable row level security;

-- 2. Create Public Read Policies
create policy "Public can view markers" on map_markers for select using (true);
create policy "Public can view categories" on marker_categories for select using (true);
create policy "Public can view loot tags" on marker_loot_tags for select using (true);

-- 3. Create Authenticated Write Policies (Admin/Editor access)
-- Assuming any logged-in user can edit map data for now, as no admin role exists.
create policy "Authenticated can manage markers" on map_markers for all using (auth.role() = 'authenticated');
create policy "Authenticated can manage categories" on marker_categories for all using (auth.role() = 'authenticated');
create policy "Authenticated can manage loot tags" on marker_loot_tags for all using (auth.role() = 'authenticated');

-- 4. Revert Debug Policies for User Groups/Markers (Make them strict again)
-- Drop the permissive debug policies
drop policy if exists "Users can create groups (debug)" on marker_groups;
drop policy if exists "Users can insert markers (debug)" on user_personal_markers;

-- Restore strict policies
-- Groups: Users can only create groups if they are the owner
create policy "Users can create groups"
  on marker_groups for insert
  with check (auth.uid() = owner_id);

-- Personal Markers: Users can only create their own markers
create policy "Users can insert own markers" 
  on user_personal_markers for insert 
  with check (auth.uid() = user_id);

-- Ensure we didn't break membership joins
-- (We already have "Users can join (insert self)" from create_marker_groups.sql)
-- But let's double check it exists or re-create it just in case debug mess touched it
drop policy if exists "Users can join (insert self)" on marker_group_members;
create policy "Users can join (insert self)"
  on marker_group_members for insert
  with check (auth.uid() = user_id);
