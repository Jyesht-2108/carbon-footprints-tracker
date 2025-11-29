# Data Processing Pipeline Fix

## Problem

After uploading CSV files, data was only stored in `events_normalized` table and not being processed further. The orchestration engine was getting 422 errors when trying to get ML predictions.

## Root Causes

### 1. Incorrect Service URL Configuration
The orchestration engine's `.env` file had incorrect service URLs:
- `ML_ENGINE_URL` was pointing to port 8001 (data-core) instead of port 8003 (ml-engine)
- `DATA_CORE_URL` was pointing to port 8002 instead of port 8001
- `API_PORT` was set to 8003 instead of 8000

### 2. Missing Field in ML Prediction Request
The hotspot engine was not including the `stop_events` field when calling the ML Engine's logistics prediction endpoint, which may have been causing validation errors.

### 3. Default Vehicle Type
The default vehicle type was set to `"truck_diesel"` but should be just `"truck"` to match the ML Engine's expected format.

## Fixes Applied

### 1. Fixed Service URLs in `.env`
**File:** `plugins/orchestration-engine/.env`

```env
# Before:
ML_ENGINE_URL=http://localhost:8001
DATA_CORE_URL=http://localhost:8002
API_PORT=8003

# After:
ML_ENGINE_URL=http://localhost:8003
DATA_CORE_URL=http://localhost:8001
API_PORT=8000
```

### 2. Added Missing Field and Fixed Vehicle Type
**File:** `plugins/orchestration-engine/src/services/hotspot_engine.py`

```python
# Before:
features = {
    "distance_km": event.get("distance_km", 0),
    "load_kg": event.get("load_kg", 0),
    "vehicle_type": event.get("vehicle_type", "truck_diesel"),
    "fuel_type": event.get("fuel_type", "diesel"),
    "avg_speed": event.get("speed", 50)
}

# After:
features = {
    "distance_km": event.get("distance_km", 0),
    "load_kg": event.get("load_kg", 0),
    "vehicle_type": event.get("vehicle_type", "truck"),
    "fuel_type": event.get("fuel_type", "diesel"),
    "avg_speed": event.get("speed", 50),
    "stop_events": event.get("stop_events", 0)
}
```

## How to Apply the Fix

### Option 1: Restart Orchestration Engine (Recommended)

The orchestration engine needs to be restarted to pick up the new `.env` configuration:

```bash
# Stop the orchestration engine (Ctrl+C in its terminal)

# Restart it
cd plugins/orchestration-engine
source myvenv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### Option 2: Restart All Services

If you want to ensure everything is in sync:

```bash
# Stop all services (Ctrl+C in each terminal)

# Restart in order:
# Terminal 1: Data Core
cd plugins/data-core
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Orchestration Engine
cd plugins/orchestration-engine
source myvenv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 3: ML Engine
cd plugins/ml-engine
source myvenv/bin/activate
uvicorn src.app:app --host 0.0.0.0 --port 8003 --reload
```

## Verification

After restarting, verify the fix is working:

### 1. Check Service Health

```bash
# Check all services are running on correct ports
curl http://localhost:8001/health  # Data Core
curl http://localhost:8000/health  # Orchestration Engine
curl http://localhost:8003/api/v1/health  # ML Engine
```

### 2. Upload Test Data

```bash
# Upload a CSV file
curl -X POST http://localhost:8001/ingest/upload \
  -F "file=@upload-data/demo_upload_1_baseline_v2.csv"
```

### 3. Check Logs

Watch the orchestration engine logs. You should see:
```
✅ Immediate analysis triggered: X hotspots detected
```

Instead of:
```
⚠️ Could not trigger immediate analysis: [error]
```

### 4. Verify Predictions

Check if predictions are being generated:

```bash
# Check predictions table
curl http://localhost:8000/api/v1/predictions
```

## Expected Data Flow After Fix

```
CSV Upload (port 8001)
    ↓
events_normalized table
    ↓
Trigger Analysis (port 8000)
    ↓
ML Engine Predictions (port 8003)
    ↓
predictions table
    ↓
Hotspot Detection (port 8000)
    ↓
hotspots table
```

## Still Missing: Emission Calculation

**Note:** This fix resolves the immediate 422 errors, but there's still a missing piece in the architecture:

The system currently:
1. ✅ Stores events in `events_normalized`
2. ❌ **Does NOT calculate CO2 emissions** from the event data
3. ✅ Tries to get ML predictions (now fixed)
4. ✅ Detects hotspots based on predictions

**What's still needed:**
- An emission calculation step that processes `events_normalized` and calculates actual CO2 emissions
- Store emissions in an `emissions` table
- Use these emissions for baseline calculations and analytics

This is what the spec I created (`emission-calculation-pipeline`) will implement. You can start executing those tasks once you're ready to add the emission calculation feature.

## Summary

- **Immediate fix:** Service URL configuration corrected
- **Result:** ML predictions should now work, hotspot detection should succeed
- **Next step:** Implement emission calculation pipeline (see spec tasks)
