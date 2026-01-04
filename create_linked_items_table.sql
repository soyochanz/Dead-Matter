-- 1. Create Vehicles Category (if not exists)
INSERT INTO marker_categories (name, group_name, icon_url)
SELECT 'Vehicles', 'misc', '/Items/map/vehicle.png'
WHERE NOT EXISTS (SELECT 1 FROM marker_categories WHERE name = 'Vehicles');

-- 2. Create Junction Table for Polymorphic Links
create table if not exists marker_linked_items (
  id uuid default gen_random_uuid() primary key,
  marker_id uuid references map_markers(id) on delete cascade not null,
  item_uuid uuid not null, -- ID from the external table (keys, weapons, etc)
  item_table text not null check (item_table in ('keys', 'weapons', 'gear', 'medicines', 'accessories', 'npcs', 'vehicles', 'toolbelts')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(marker_id, item_uuid) -- Prevent duplicate links
);

-- 3. Enable RLS
alter table marker_linked_items enable row level security;

-- 4. Policies
-- Public read
create policy "Public can view linked items"
  on marker_linked_items for select
  using ( true );

-- Authenticated write (Admins)
create policy "Authenticated can manage linked items"
  on marker_linked_items for all
  using ( auth.role() = 'authenticated' );
