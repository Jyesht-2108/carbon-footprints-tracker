# Factory and Warehouse Prediction Fix

## Problem

After fixing the event type routing, factory and warehouse events were still not generating predictions. Only logistics predictions were being created.

## Root Causes

### 1. **CRITICAL: Factory/Warehouse Fields Not Stored in events_normalized**
**Problem:** The data-core service was only storing logistics fields in `events_normalized`, completely ignoring factory and warehouse fields.

**Code Issue:**
```python
# Only these fields were being stored:
normalized_event = {
    "event_type": row.get("event_type"),
    "distance_km": row.get("distance_km"),  # Logistics only
    "load_kg": row.get("load_kg"),          # Logistics only
    "vehicle_type": row.get("vehicle_type"), # Logistics only
    # ❌ Missing: energy_kwh, furnace_usage, temperature, etc.
}
```

**Result:** Even though factory/warehouse data was in `events_raw`, it wasn't in `events_normalized`, so the orchestration engine couldn't access it for predictions.

### 2. Missing energy_kwh for Warehouse Events
**Problem:** The warehouse preprocessing function required `energy_kwh` as a mandatory field, but warehouse events in the CSV don't have this field.

**CSV Data:**
```csv
# Warehouse events have:
temperature,refrigeration_load,inventory_volume
# But NOT energy_kwh
```

**Preprocessing Expected:**
```python
required = ["temperature", "energy_kwh"]  # ❌ energy_kwh not in CSV
```

### 2. Vehicle Type Encoding Mismatch
**Problem:** CSV contains `truck_diesel` and `van_diesel` but the encoding map only had base types.

**CSV Data:**
```csv
vehicle_type: truck_diesel, van_diesel
```

**Encoding Map:**
```python
VEHICLE_TYPE_ENCODING = {
    "truck_diesel": 2,  # ✅ Had this
    "van": 5,           # ❌ But not "van_diesel"
}
```

## Fixes Applied

### 1. **CRITICAL: Store All Event Fields in events_normalized**
**File:** `plugins/data-core/src/api/routes.py`

```python
# Before: Only logistics fields
normalized_event = {
    "event_type": row.get("event_type"),
    "distance_km": row.get("distance_km"),
    "load_kg": row.get("load_kg"),
    # ❌ Missing factory/warehouse fields
}

# After: All event type fields
normalized_event = {
    "event_type": row.get("event_type"),
    # Logistics fields
    "distance_km": row.get("distance_km"),
    "load_kg": row.get("load_kg"),
    "vehicle_type": row.get("vehicle_type"),
    "fuel_type": row.get("fuel_type"),
    "speed": row.get("speed"),
    "stop_events": row.get("stop_events"),
    # Factory fields ✅
    "energy_kwh": row.get("energy_kwh"),
    "furnace_usage": row.get("furnace_usage"),
    "cooling_load": row.get("cooling_load"),
    "shift_hours": row.get("shift_hours"),
    # Warehouse fields ✅
    "temperature": row.get("temperature"),
    "refrigeration_load": row.get("refrigeration_load"),
    "inventory_volume": row.get("inventory_volume"),
    # ...
}
```

### 2. Fixed Warehouse Preprocessing
**File:** `plugins/ml-engine/src/utils/preprocessing.py`

```python
# Before:
required = ["temperature", "energy_kwh"]  # ❌ Fails if energy_kwh missing

# After:
required = ["temperature"]  # ✅ Only temperature required
defaults = {
    "energy_kwh": 0,
    "refrigeration_load": 0,
    "inventory_volume": 0,
    "temperature": 20
}

# Estimate energy_kwh if not provided
if "energy_kwh" not in processed or processed["energy_kwh"] == 0:
    refrigeration = processed.get("refrigeration_load", 0)
    inventory = processed.get("inventory_volume", 0)
    processed["energy_kwh"] = 100 + refrigeration * 2 + inventory * 0.01
```

### 3. Extended Vehicle Type Encoding
**File:** `plugins/ml-engine/src/utils/preprocessing.py`

```python
VEHICLE_TYPE_ENCODING = {
    "two_wheeler": 0,
    "mini_truck": 1,
    "truck": 2,
    "truck_diesel": 2,      # ✅ Added
    "truck_cng": 3,
    "truck_petrol": 2,      # ✅ Added
    "ev": 4,
    "electric_vehicle": 4,  # ✅ Added
    "van": 5,
    "van_diesel": 5,        # ✅ Added
    "van_petrol": 5,        # ✅ Added
    "van_cng": 5            # ✅ Added
}
```

### 4. Updated Data Normalizer Mappings
**File:** `plugins/data-core/src/utils/constants.py`

```python
VEHICLE_TYPE_MAPPING = {
    "truck_diesel": "truck",  # ✅ Added
    "van_diesel": "van",      # ✅ Added
    # ... other mappings
}
```

## How to Apply

**You need to restart BOTH services:**

### 1. Restart Data-Core (CRITICAL - stores the fields)
```bash
# Stop the data-core service (Ctrl+C)

# Restart it
cd plugins/data-core
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Restart ML Engine (for preprocessing fixes)
```bash
# Stop the ML engine (Ctrl+C)

# Restart it
cd plugins/ml-engine
source myvenv/bin/activate
uvicorn src.app:app --host 0.0.0.0 --port 8003 --reload
```

### 3. Restart Orchestration Engine (from previous fix)
```bash
# Stop the orchestration engine (Ctrl+C)

# Restart it
cd plugins/orchestration-engine
source myvenv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

**IMPORTANT:** After restarting data-core, you need to **re-upload your CSV** because the existing data in `events_normalized` doesn't have the factory/warehouse fields.

## Verification

After restarting, upload the CSV and check predictions:

```bash
# Upload test data
curl -X POST http://localhost:8001/ingest/upload \
  -F "file=@upload-data/demo_upload_1_baseline_v2.csv"

# Wait a few seconds for analysis to complete

# Check predictions in database
# You should now see:
# - 10 logistics predictions
# - 8 factory predictions
# - 6 warehouse predictions
```

## Expected Results

### Before Fix:
```json
{
  "predictions": [
    {"prediction_type": "logistics", "predicted_co2": 85.5},
    {"prediction_type": "logistics", "predicted_co2": 92.3},
    {"prediction_type": "logistics", "predicted_co2": 78.1}
  ]
}
```

### After Fix:
```json
{
  "predictions": [
    {"prediction_type": "logistics", "predicted_co2": 85.5},
    {"prediction_type": "factory", "predicted_co2": 312.5},
    {"prediction_type": "warehouse", "predicted_co2": 154.2}
  ]
}
```

## Summary of All Fixes

To get the complete system working, you need to restart **both** services:

### 1. Orchestration Engine (for event type routing)
```bash
cd plugins/orchestration-engine
source myvenv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. ML Engine (for factory/warehouse preprocessing)
```bash
cd plugins/ml-engine
source myvenv/bin/activate
uvicorn src.app:app --host 0.0.0.0 --port 8003 --reload
```

After both restarts, upload your CSV and all three event types should generate predictions!
