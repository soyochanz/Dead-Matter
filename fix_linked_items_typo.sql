-- Fix typo in CHECK constraint ('accesories' -> 'accessories')
DO $$ 
BEGIN
  -- Drop the old constraint if it exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marker_linked_items_item_table_check') THEN
      ALTER TABLE marker_linked_items DROP CONSTRAINT marker_linked_items_item_table_check;
  END IF;

  -- Add the correct constraint
  ALTER TABLE marker_linked_items 
  ADD CONSTRAINT marker_linked_items_item_table_check 
  CHECK (item_table IN ('keys', 'weapons', 'gear', 'medicines', 'accessories', 'npcs', 'vehicles', 'toolbelts'));

END $$;
