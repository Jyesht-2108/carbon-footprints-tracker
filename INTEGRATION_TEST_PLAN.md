# Carbon Nexus - Integration Test Plan

## 📊 Current System Status

### ✅ Services Running
- **Data Core** (Port 8002) - ✅ RUNNING
- **ML Engine** (Port 8001) - ✅ RUNNING (health endpoint returns 404, but predictions work!)
- **RAG Chatbot** (Port 4000) - ✅ RUNNING
- **Orchestration** (Port 8003) - ❌ NOT STARTED YET

### ✅ Database Status (Supabase)
- `events_raw` - 22 rows
- `events_normalized` - 22 rows  
- `data_quality` - 2 rows
- `ingest_jobs` - 2 rows
- `uploads` - 1 rows
- `ingestion_jobs` - 1 rows
- `recommendations` - 1 rows (4 total)

### ✅ ML Engine Verified
- Logistics prediction working: 18.1 kg CO2 for test input
- All 5 models available:
  - `/api/v1/predict/logistics`
  - `/api/v1/predict/factory`
  - `/api/v1/predict/warehouse`
  - `/api/v1/predict/delivery`
  - `/api/v1/forecast/7d`

---

## 🎯 Before Starting Orchestration

### Step 1: Create Orchestration Database Tables

Run this SQL in Supabase SQL Editor:

```bash
# Copy contents of this file:
plugins/orchestration-engine/sql/schema.sql

# Paste and run in Supabase SQL Editor
```

This creates 5 new tables:
- `hotspots` - Detected emission hotspots
- `alerts` - Generated alerts
- `baselines` - Entity baseline emissions
- `predictions` - ML prediction cache
- `audit_logs` - Action audit trail

### Step 2: Start Orchestration Engine

```bash
cd plugins/orchestration-engine
python -m src.main
```

Expected output:
```
Starting Orchestration Engine...
ML Engine URL: http://localhost:8001
Data Core URL: http://localhost:8002
RAG Service URL: http://localhost:4000
Scheduler started
INFO:     Uvicorn running on http://0.0.0.0:8003
```

---

## 🧪 Integration Tests

### Test 1: Service Health Checks

```bash
# Check all services
curl http://localhost:8002/api/v1/health  # Data Core
curl http://localhost:8001/health         # ML Engine (might 404 but predictions work)
curl http://localhost:4000/health         # RAG Chatbot
curl http://localhost:8003/health         # Orchestration
```

### Test 2: Data Core → ML Engine Integration

```bash
# Upload CSV to Data Core
cd plugins/data-core
python scripts/test_upload.py

# Check if data was normalized
curl http://localhost:8002/api/v1/health

# Test ML prediction directly
curl -X POST http://localhost:8001/api/v1/predict/logistics \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 120,
    "load_kg": 450,
    "vehicle_type": "truck_diesel",
    "fuel_type": "diesel",
    "avg_speed": 50
  }'
```

Expected: ML Engine returns CO2 prediction

### Test 3: Orchestration → ML Engine Integration

```bash
# Get current emissions (orchestration calls ML)
curl http://localhost:8003/emissions/current

# Get forecast
curl http://localhost:8003/emissions/forecast

# Get summary
curl http://localhost:8003/emissions/summary
```

Expected: Orchestration fetches data and returns aggregated results

### Test 4: Hotspot Detection

```bash
# Trigger manual hotspot scan
curl -X POST http://localhost:8003/hotspots/scan

# Check detected hotspots
curl http://localhost:8003/hotspots

# Get top hotspots
curl http://localhost:8003/hotspots/top?limit=5

# Get hotspot statistics
curl http://localhost:8003/hotspots/stats
```

Expected: Orchestration detects anomalies and creates hotspots

### Test 5: Orchestration → RAG Integration

```bash
# After hotspot detection, check if recommendations were generated
curl http://localhost:8003/recommendations

# Get pending recommendations
curl http://localhost:8003/recommendations/pending

# Get recommendation stats
curl http://localhost:8003/recommendations/stats
```

Expected: RAG service generated recommendations for hotspots

### Test 6: Alert System

```bash
# Check alerts
curl http://localhost:8003/alerts

# Get critical alerts only
curl http://localhost:8003/alerts/critical

# Get alert statistics
curl http://localhost:8003/alerts/stats
```

Expected: Alerts generated for detected hotspots

### Test 7: What-If Simulation

```bash
# Test scenario: Switch from diesel to EV
curl -X POST http://localhost:8003/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario_type": "logistics",
    "baseline_features": {
      "distance_km": 120,
      "load_kg": 450,
      "vehicle_type": "truck_diesel",
      "fuel_type": "diesel",
      "avg_speed": 50
    },
    "changes": {
      "vehicle_type": "truck_ev",
      "fuel_type": "electric"
    }
  }'
```

Expected: Shows CO2 reduction from switching to EV

### Test 8: Recommendation Approval

```bash
# Get a recommendation ID
curl http://localhost:8003/recommendations/pending

# Approve recommendation (use actual ID from above)
curl -X POST http://localhost:8003/recommendations/1/approve \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved for testing"}'

# Verify status changed
curl http://localhost:8003/recommendations
```

Expected: Recommendation status changes to "approved"

### Test 9: End-to-End Flow

```bash
# 1. Upload new data
cd plugins/data-core
python scripts/test_upload.py

# 2. Wait 5 minutes for scheduler OR trigger manual scan
curl -X POST http://localhost:8003/hotspots/scan

# 3. Check if hotspots were detected
curl http://localhost:8003/hotspots

# 4. Check if recommendations were generated
curl http://localhost:8003/recommendations/pending

# 5. Check if alerts were created
curl http://localhost:8003/alerts
```

Expected: Complete flow from data upload to recommendations

---

## 🔍 Verification Checklist

### Data Core ✅
- [x] Service running on port 8002
- [x] Can upload CSV files
- [x] Data normalized in database
- [x] 22 events in events_normalized table

### ML Engine ✅
- [x] Service running on port 8001
- [x] Logistics prediction working
- [x] All 5 prediction endpoints available
- [ ] Health endpoint (returns 404 but predictions work)

### RAG Chatbot ✅
- [x] Service running on port 4000
- [x] Can generate recommendations
- [x] 1 recommendation in database
- [x] Supabase integration working

### Orchestration Engine ⏳
- [ ] Service started on port 8003
- [ ] Database tables created
- [ ] Can fetch from Data Core
- [ ] Can call ML Engine
- [ ] Can call RAG service
- [ ] Hotspot detection working
- [ ] Alert generation working
- [ ] Recommendation integration working
- [ ] Scheduler running

---

## 🐛 Known Issues

### ML Engine Health Endpoint
- Health endpoint returns 404
- But predictions work fine
- This is OK - predictions are what matter

### Fix (Optional):
The ML Engine health endpoint should be at `/health` not `/api/v1/health`. Check the routes.

---

## 📝 Next Steps

### 1. Create Orchestration Tables
```bash
# Run sql/schema.sql in Supabase
```

### 2. Start Orchestration
```bash
cd plugins/orchestration-engine
python -m src.main
```

### 3. Run Integration Tests
```bash
# Use the tests above
# Or run: python check_system_status.py
```

### 4. Monitor Logs
```bash
# Orchestration logs
tail -f plugins/orchestration-engine/logs/orchestration_*.log

# Check for:
# - Hotspot detection runs
# - ML Engine calls
# - RAG service calls
# - Alert generation
```

### 5. Verify Database
Check Supabase for new data in:
- `hotspots` table
- `alerts` table
- `baselines` table
- `predictions` table
- `audit_logs` table

---

## 🎯 Success Criteria

### All services running ✅
- Data Core: ✅
- ML Engine: ✅
- RAG Chatbot: ✅
- Orchestration: ⏳ (to start)

### Data flow working
- Upload → Normalize → Predict → Detect → Alert → Recommend

### Scheduler working
- Hotspot scan every 5 minutes
- Baseline recalc every hour

### All integrations working
- Orchestration ↔ Data Core
- Orchestration ↔ ML Engine
- Orchestration ↔ RAG Chatbot

---

## 🚀 Ready to Start!

Your system is 75% ready. Just need to:
1. Create orchestration database tables
2. Start orchestration service
3. Run integration tests

All other services are running and working! 🎉
