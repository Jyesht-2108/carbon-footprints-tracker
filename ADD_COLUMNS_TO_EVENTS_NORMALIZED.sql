-- Add factory and warehouse columns to events_normalized table
-- Run this in your Supabase SQL Editor

ALTER TABLE events_normalized
ADD COLUMN IF NOT EXISTS stop_events INTEGER,
ADD COLUMN IF NOT EXISTS energy_kwh FLOAT,
ADD COLUMN IF NOT EXISTS furnace_usage FLOAT,
ADD COLUMN IF NOT EXISTS cooling_load FLOAT,
ADD COLUMN IF NOT EXISTS shift_hours FLOAT,
ADD COLUMN IF NOT EXISTS temperature FLOAT,
ADD COLUMN IF NOT EXISTS refrigeration_load FLOAT,
ADD COLUMN IF NOT EXISTS inventory_volume FLOAT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events_normalized'
ORDER BY ordinal_position;
