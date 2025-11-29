# CSV Upload Fix ✅

## Problem
Users were getting "Error tokenizing data. C error: Expected 15 fields in line 12, saw 16" when uploading CSV files.

## Root Cause
The CSV file had inconsistent number of columns across rows. Line 12 had 16 fields when the header defined 15 fields.

## Solution Implemented

### 1. Better Error Handling
- Added try-catch for CSV parsing errors
- Automatically skips malformed lines when possible
- Provides clear error messages with line numbers
- Shows which columns are expected vs. what was found

### 2. Improved Error Messages
**Before:**
```
Error tokenizing data. C error: Expected 15 fields in line 12, saw 16
```

**After:**
```
CSV file is malformed at line 12. Please check that all rows have the same number of columns.

Required columns: timestamp, supplier_id, event_type
Optional columns: distance_km, load_kg, vehicle_type, fuel_type, speed
Your columns: [list of actual columns]
```

### 3. Flexible Parsing
- Tries to skip bad lines and continue with valid data
- Logs warnings for skipped lines
- Updates job status with warnings

## Files Modified

**File:** `plugins/data-core/src/api/routes.py`

### Changes:
1. Added CSV parsing error handling
2. Added line number extraction from error messages
3. Added `on_bad_lines='skip'` parameter
4. Added detailed error messages with column information
5. Added job status updates with warnings

## CSV Format Requirements

### Required Columns (Minimum)
```csv
timestamp,supplier_id,event_type
2025-11-28 08:00:00,Supplier_A,logistics
2025-11-28 09:00:00,Supplier_B,logistics
```

### Recommended Columns (Full)
```csv
supplier_id,timestamp,distance_km,load_kg,vehicle_type,fuel_type,speed,event_type
Supplier_A,2025-11-28 08:00:00,100,400,truck_diesel,diesel,60,logistics
Supplier_B,2025-11-28 09:00:00,150,500,truck_ev,electric,70,logistics
```

### Optional Columns
- `distance_km` - Distance traveled in kilometers
- `load_kg` - Load weight in kilograms
- `vehicle_type` - Type of vehicle (truck_diesel, truck_ev, van_diesel, etc.)
- `fuel_type` - Fuel type (diesel, electric, petrol, cng, lpg)
- `energy_kwh` - Energy consumed in kWh
- `temperature` - Temperature reading
- `route_id` - Route identifier
- `warehouse_id` - Warehouse identifier
- `factory_id` - Factory identifier
- `speed` - Speed in km/h
- `stop_events` - Number of stops

## Common CSV Issues & Fixes

### Issue 1: Inconsistent Column Count
**Problem:**
```csv
col1,col2,col3
val1,val2,val3
val1,val2,val3,val4  ← Extra column!
```

**Fix:**
- Ensure all rows have the same number of columns
- Remove extra commas
- Check for commas inside quoted values

### Issue 2: Missing Required Columns
**Problem:**
```csv
date,supplier,distance
2025-11-28,Supplier_A,100
```

**Fix:**
```csv
timestamp,supplier_id,event_type,distance_km
2025-11-28 08:00:00,Supplier_A,logistics,100
```

### Issue 3: Invalid Timestamp Format
**Problem:**
```csv
timestamp,supplier_id,event_type
11/28/2025,Supplier_A,logistics  ← Wrong format
```

**Fix:**
```csv
timestamp,supplier_id,event_type
2025-11-28 08:00:00,Supplier_A,logistics  ← ISO format
```

### Issue 4: Commas in Values
**Problem:**
```csv
supplier_id,notes
Supplier_A,This has, a comma  ← Breaks parsing
```

**Fix:**
```csv
supplier_id,notes
Supplier_A,"This has, a comma"  ← Quote the value
```

## Testing

### Test 1: Valid CSV
```bash
# Create test file
cat > test_valid.csv << EOF
supplier_id,timestamp,distance_km,load_kg,vehicle_type,fuel_type,speed,event_type
Supplier_A,2025-11-28 08:00:00,100,400,truck_diesel,diesel,60,logistics
Supplier_B,2025-11-28 09:00:00,150,500,truck_ev,electric,70,logistics
EOF

# Upload
curl -X POST http://localhost:8001/ingest/upload \
  -F "file=@test_valid.csv"
```

### Test 2: Malformed CSV (will skip bad line)
```bash
# Create test file with bad line
cat > test_malformed.csv << EOF
supplier_id,timestamp,event_type
Supplier_A,2025-11-28 08:00:00,logistics
Supplier_B,2025-11-28 09:00:00,logistics,extra,columns  ← Bad line
Supplier_C,2025-11-28 10:00:00,logistics
EOF

# Upload - will skip line 3 and process lines 2 and 4
curl -X POST http://localhost:8001/ingest/upload \
  -F "file=@test_malformed.csv"
```

### Test 3: Missing Required Columns
```bash
# Create test file missing required columns
cat > test_missing.csv << EOF
date,supplier,distance
2025-11-28,Supplier_A,100
EOF

# Upload - will fail with helpful error
curl -X POST http://localhost:8001/ingest/upload \
  -F "file=@test_missing.csv"

# Expected error:
# {
#   "errors": ["Missing required columns: timestamp, supplier_id, event_type"],
#   "required_columns": ["timestamp", "supplier_id", "event_type"],
#   "your_columns": ["date", "supplier", "distance"],
#   "help": "Ensure your CSV has at minimum: timestamp, supplier_id, and event_type columns"
# }
```

## Frontend Error Display

The frontend will now show more helpful error messages:

**Before:**
```
Upload failed
Request failed with status code 500
```

**After:**
```
Upload failed
CSV file is malformed at line 12. Please check that all rows have the same number of columns.

Required columns: timestamp, supplier_id, event_type
Your columns: date, supplier, distance, load, vehicle

Missing: timestamp, supplier_id, event_type
```

## Validation Flow

```
┌─────────────────────────────────────┐
│  User uploads CSV                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Try to parse CSV                   │
│  - Read with pandas                 │
│  - Check for parsing errors         │
└──────────────┬──────────────────────┘
               ↓
        ┌──────┴──────┐
        │  Success?   │
        └──────┬──────┘
         Yes ↓     ↓ No
             ↓     └──────────────────┐
             ↓                        ↓
┌────────────────────┐   ┌────────────────────────┐
│  Validate Schema   │   │  Try skip bad lines    │
│  - Check required  │   │  - Extract line number │
│  - Check types     │   │  - Skip malformed rows │
└────────┬───────────┘   └────────┬───────────────┘
         ↓                        ↓
    ┌────┴────┐              ┌────┴────┐
    │ Valid?  │              │ Success?│
    └────┬────┘              └────┬────┘
     Yes │ No                 Yes │ No
         ↓  ↓                    ↓  ↓
         ↓  └─────┐              ↓  └─────────┐
         ↓        ↓              ↓            ↓
┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Process   │ │  Return  │ │  Process │ │  Return  │
│  Data      │ │  Error   │ │  with    │ │  Detailed│
│            │ │  with    │ │  Warning │ │  Error   │
│            │ │  Details │ │          │ │          │
└────────────┘ └──────────┘ └──────────┘ └──────────┘
```

## Benefits

1. **Better User Experience**
   - Clear error messages
   - Specific line numbers
   - Column mismatch details
   - Helpful suggestions

2. **Fault Tolerance**
   - Skips bad lines when possible
   - Processes valid data
   - Logs warnings for review

3. **Debugging**
   - Exact line numbers
   - Column comparison
   - Detailed error logs

4. **Data Quality**
   - Validates required columns
   - Checks data types
   - Ensures consistency

## Troubleshooting

### Error: "Expected X fields, saw Y"
**Cause:** Inconsistent number of columns

**Solutions:**
1. Open CSV in text editor
2. Go to the line number mentioned
3. Count the commas - should match header
4. Check for unquoted commas in values
5. Remove extra columns or add missing ones

### Error: "Missing required columns"
**Cause:** CSV doesn't have required columns

**Solutions:**
1. Add `timestamp` column (format: YYYY-MM-DD HH:MM:SS)
2. Add `supplier_id` column
3. Add `event_type` column (usually "logistics")
4. Or rename existing columns to match

### Error: "Invalid timestamp format"
**Cause:** Timestamp not in ISO format

**Solutions:**
1. Use format: `2025-11-28 08:00:00`
2. Or: `2025-11-28T08:00:00`
3. Or: `2025-11-28T08:00:00Z`
4. Avoid: `11/28/2025` or `28-11-2025`

## Sample CSV Templates

### Minimal Template
```csv
timestamp,supplier_id,event_type
2025-11-28 08:00:00,Supplier_A,logistics
2025-11-28 09:00:00,Supplier_B,logistics
2025-11-28 10:00:00,Supplier_C,logistics
```

### Full Template
```csv
supplier_id,timestamp,distance_km,load_kg,vehicle_type,fuel_type,speed,event_type
Supplier_A,2025-11-28 08:00:00,100,400,truck_diesel,diesel,60,logistics
Supplier_B,2025-11-28 09:00:00,150,500,truck_ev,electric,70,logistics
Supplier_C,2025-11-28 10:00:00,200,600,van_diesel,diesel,65,logistics
```

### With Optional Fields
```csv
supplier_id,timestamp,distance_km,load_kg,vehicle_type,fuel_type,speed,event_type,route_id,warehouse_id
Supplier_A,2025-11-28 08:00:00,100,400,truck_diesel,diesel,60,logistics,R001,W001
Supplier_B,2025-11-28 09:00:00,150,500,truck_ev,electric,70,logistics,R002,W002
```

---

**Status:** ✅ Fixed and tested
**Version:** 1.0.0
**Date:** November 29, 2025
