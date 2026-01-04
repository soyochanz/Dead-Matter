-- Simplified Wiki Item Linking
-- Add two columns to map_markers instead of using a junction table

-- 1. Add columns to map_markers
ALTER TABLE map_markers 
ADD COLUMN IF NOT EXISTS linked_item_id uuid,
ADD COLUMN IF NOT EXISTS linked_item_type text CHECK (linked_item_type IN ('keys', 'weapons', 'gear', 'medicines', 'accessories', 'npcs', 'vehicles', 'toolbelts'));

-- 2. Optional: Drop the old junction table if you want to clean up
-- (Only run this if you're sure you don't need the old data)
-- DROP TABLE IF EXISTS marker_linked_items;
