# Database Schema Update Required

## Problem

The `events_normalized` table in Supabase doesn't have columns for factory and warehouse event fields. When trying to upload CSV files with factory/warehouse events, you get this error:

```
Could not find the 'cooling_load' column of 'events_normalized' in the schema cache
```

## Solution

You need to add the missing columns to the `events_normalized` table in Supabase.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run the Migration SQL

Copy and paste this SQL into the editor and click "Run":

```sql
-- Add factory and warehouse columns to events_normalized table
ALTER TABLE events_normalized
ADD COLUMN IF NOT EXISTS stop_events INTEGER,
ADD COLUMN IF NOT EXISTS energy_kwh FLOAT,
ADD COLUMN IF NOT EXISTS furnace_usage FLOAT,
ADD COLUMN IF NOT EXISTS cooling_load FLOAT,
ADD COLUMN IF NOT EXISTS shift_hours FLOAT,
ADD COLUMN IF NOT EXISTS temperature FLOAT,
ADD COLUMN IF NOT EXISTS refrigeration_load FLOAT,
ADD COLUMN IF NOT EXISTS inventory_volume FLOAT;
```

### Step 3: Verify the Columns

Run this query to verify all columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events_normalized'
ORDER BY ordinal_position;
```

You should see all these columns:
- `id`
- `event_type`
- `supplier_id`
- `distance_km` (logistics)
- `load_kg` (logistics)
- `vehicle_type` (logistics)
- `fuel_type` (logistics)
- `speed` (logistics)
- `stop_events` (logistics) ✅ NEW
- `energy_kwh` (factory/warehouse) ✅ NEW
- `furnace_usage` (factory) ✅ NEW
- `cooling_load` (factory) ✅ NEW
- `shift_hours` (factory) ✅ NEW
- `temperature` (warehouse) ✅ NEW
- `refrigeration_load` (warehouse) ✅ NEW
- `inventory_volume` (warehouse) ✅ NEW
- `timestamp`
- `is_outlier`
- `created_at`

### Step 4: Upload CSV Again

After adding the columns, try uploading your CSV file again. It should work now!

## Why This Happened

The original `events_normalized` table was designed only for logistics events. When we added support for factory and warehouse events, we needed to add their specific fields to the table schema.

## Alternative: Use the SQL File

I've created a SQL file for you at `ADD_COLUMNS_TO_EVENTS_NORMALIZED.sql`. You can:
1. Open it
2. Copy the contents
3. Paste into Supabase SQL Editor
4. Run it

## After the Fix

Once the columns are added:
1. ✅ CSV uploads will work
2. ✅ Factory events will be stored with energy_kwh, furnace_usage, etc.
3. ✅ Warehouse events will be stored with temperature, refrigeration_load, etc.
4. ✅ Orchestration engine can read all fields for predictions
5. ✅ ML Engine can generate predictions for all event types
