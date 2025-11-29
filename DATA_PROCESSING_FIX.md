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

### 4. Incorrect Event Type Detection Logic
The hotspot engine was using field presence (`if distance_km exists`) to determine event type instead of checking the `event_type` field. This caused:
- Only logistics events to be processed (because they have `distance_km`)
- Factory and warehouse events to be ignored
- All predictions to be "logistics" type with 85% confidence

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

### 2. Fixed Event Type Detection Logic
**File:** `plugins/orchestration-engine/src/services/hotspot_engine.py`

Changed from field-based detection to `event_type` field-based routing:

```python
# Before: Field-based detection
if event.get("distance_km"):
    # Logistics
elif event.get("energy_kwh"):
    if event.get("furnace_usage"):
        # Factory
    else:
        # Warehouse

# After: Event type-based routing
prediction_type = event.get("event_type", "").lower()

if prediction_type == "logistics":
    # Process logistics
elif prediction_type == "factory":
    # Process factory
elif prediction_type == "warehouse":
    # Process warehouse
elif prediction_type == "delivery":
    # Process delivery
```

This ensures:
- All event types are properly recognized
- Factory and warehouse events get correct predictions
- Predictions table shows diverse event types (not just logistics)

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

Check if predictions are being generated for all event types:

```bash
# Check predictions table
curl http://localhost:8000/api/v1/predictions

# You should see predictions with different types:
# - prediction_type: "logistics"
# - prediction_type: "factory"
# - prediction_type: "warehouse"
```

Before the fix, you would only see "logistics" predictions. After the fix, you should see all three types.

## Expected Data Flow After Fix

```
CSV Upload (port 8001)
    ↓
events_normalized table (logistics, factory, warehouse events)
    ↓
Trigger Analysis (port 8000)
    ↓
Event Type Detection (checks event_type field)
    ├─ logistics → ML Engine /predict/logistics (port 8003)
    ├─ factory → ML Engine /predict/factory (port 8003)
    ├─ warehouse → ML Engine /predict/warehouse (port 8003)
    └─ delivery → ML Engine /predict/delivery (port 8003)
    ↓
predictions table (diverse event types with predictions)
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
