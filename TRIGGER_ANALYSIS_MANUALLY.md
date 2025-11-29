# Trigger ML Analysis Manually

## Why Predictions Table is Empty

The `predictions` table gets populated by the **ML Engine** after analyzing the uploaded data. The upload only stores raw data in `events_normalized` and `events_raw`.

## Check if Analysis Was Triggered

After uploading, check the data-core terminal logs for:
```
🚀 Triggering immediate hotspot detection...
✅ Immediate analysis triggered: X hotspots detected
```

If you see:
```
⚠️ Could not trigger immediate analysis: [error]
```

Then the orchestration engine might not be running.

## Manual Trigger Options

### Option 1: Trigger via API (Recommended)

```bash
# Trigger analysis
curl -X POST http://localhost:8000/trigger-analysis

# Expected response:
{
  "status": "success",
  "hotspots_detected": 5,
  "predictions_generated": 24,
  "message": "Analysis completed"
}
```

### Option 2: Trigger via Orchestration Engine Directly

```bash
# If orchestration engine is on different port
curl -X POST http://localhost:8002/api/v1/analyze/trigger
```

### Option 3: Check Orchestration Engine Status

```bash
# Check if orchestration engine is running
curl http://localhost:8000/health

# Or check the process
ps aux | grep orchestration
```

## What Gets Generated

After analysis runs, these tables get populated:

1. **predictions** - Future CO2 predictions for each supplier
2. **hotspots** - Detected emission hotspots (high emitters)
3. **recommendations** - AI-generated reduction recommendations
4. **baselines** - Historical baseline calculations

## Check if Analysis Completed

```sql
-- Check predictions
SELECT COUNT(*) FROM predictions;

-- Check hotspots
SELECT COUNT(*) FROM hotspots WHERE status = 'active';

-- Check recommendations
SELECT COUNT(*) FROM recommendations WHERE status = 'pending';
```

## Troubleshooting

### Issue: "Could not trigger immediate analysis"

**Cause:** Orchestration engine not running

**Solution:**
```bash
cd plugins/orchestration-engine
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### Issue: Analysis triggered but no predictions

**Cause:** ML engine might not be running or models not loaded

**Solution:**
```bash
cd plugins/ml-engine
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8003 --reload
```

### Issue: Predictions table exists but empty

**Cause:** Not enough data for predictions (need at least 10 events per supplier)

**Solution:** Upload more data files:
```bash
# Upload all three demo files
curl -X POST http://localhost:8001/ingest/upload \
  -F "file=@upload-data/demo_upload_1_baseline_v2.csv"

curl -X POST http://localhost:8001/ingest/upload \
  -F "file=@upload-data/demo_upload_2_increased_activity.csv"

curl -X POST http://localhost:8001/ingest/upload \
  -F "file=@upload-data/demo_upload_3_critical_hotspots.csv"

# Then trigger analysis
curl -X POST http://localhost:8000/trigger-analysis
```

## Expected Timeline

1. **Upload CSV** → Data in events_normalized (immediate)
2. **Trigger Analysis** → Takes 5-30 seconds depending on data size
3. **Predictions Generated** → Appears in predictions table
4. **Hotspots Detected** → Appears in hotspots table
5. **Dashboard Updates** → Shows predictions and hotspots

## Verify Everything is Working

```bash
# 1. Check data-core (port 8001)
curl http://localhost:8001/health

# 2. Check orchestration engine (port 8000)
curl http://localhost:8000/health

# 3. Check ML engine (port 8003)
curl http://localhost:8003/health

# 4. Trigger analysis
curl -X POST http://localhost:8000/trigger-analysis

# 5. Check predictions
curl http://localhost:8003/api/v1/predictions/GreenTech_Industries
```

## Quick Fix Script

```bash
#!/bin/bash
echo "Triggering ML analysis..."

# Trigger analysis
response=$(curl -s -X POST http://localhost:8000/trigger-analysis)

echo "Response: $response"

# Check predictions
echo ""
echo "Checking predictions table..."
# You'll need to check via Supabase dashboard or SQL query

echo "Done!"
```

## Summary

- ✅ Upload stores data in events tables
- ⏳ Analysis must be triggered (automatic or manual)
- 📊 Predictions appear after analysis completes
- 🔥 Hotspots detected during analysis
- 💡 Recommendations generated based on hotspots

**Next Step:** Run `curl -X POST http://localhost:8000/trigger-analysis` to generate predictions!
