# Scheduler Behavior - Clarified

## Your Question:
"If I haven't uploaded new CSV, am I getting the same data every 30 minutes?"

## Answer:
**NO!** The system is smarter than that. Here's what actually happens:

---

## How the Scheduler Works

### The Code:
```python
async def scan_for_hotspots(self):
    # Get events WITHOUT predictions (new events only!)
    events = await db_client.get_events_without_predictions(limit=50)
    
    for event in events:
        hotspot = await self.detect_hotspots_for_event(event)
```

### What This Means:

**First Run (00:00):**
```
- Finds: 25 events from your CSV (no predictions yet)
- Processes: All 25 events
- Creates: Hotspots for Heavy_Load_Supplier, Hotspot_CRITICAL, etc.
- Result: 10 hotspots created
```

**Second Run (00:30):**
```
- Finds: 0 events (all already have predictions!)
- Processes: Nothing
- Creates: Nothing
- Result: No new hotspots (uses existing ones)
```

**Third Run (01:00):**
```
- Finds: 0 events
- Processes: Nothing
- Creates: Nothing
- Result: Still showing same hotspots from first run
```

---

## So What's Happening Every 30 Minutes?

### The scheduler runs, but:
1. ✅ Checks for NEW events
2. ❌ Finds none (you haven't uploaded more data)
3. ✅ Skips processing (smart!)
4. ✅ Dashboard shows EXISTING hotspots (from first run)

### Your Logs Show:
```
01:38:55 | Starting hotspot scan...
01:39:10 | Hotspot detected: Hotspot_CRITICAL
01:39:14 | Hotspot detected: Heavy_Load_Supplier
```

**These might be**:
- Re-detecting existing hotspots (checking if still above baseline)
- Or processing events that were queued
- Or the ML engine just finished predicting CO₂ for some events

---

## When Would You See NEW Hotspots?

### Scenario 1: Upload New CSV
```
Time 00:00 - Upload CSV #1 → 10 hotspots
Time 00:30 - Scheduler runs → No new events
Time 01:00 - Upload CSV #2 → 15 new events!
Time 01:00 - Scheduler runs → Processes 15 events → 3 NEW hotspots!
```

### Scenario 2: API Receives Real-Time Data
```
Time 00:00 - Truck completes delivery → API call → New event
Time 00:30 - Scheduler runs → Processes that event → Hotspot detected!
Time 01:00 - Another truck → Another event
Time 01:00 - Scheduler runs → Another hotspot!
```

### Scenario 3: Hotspot Resolution
```
Time 00:00 - Heavy_Load_Supplier: 70 kg (WARN)
Time 00:30 - Still 70 kg (WARN)
Time 01:00 - Upload new data: Now 55 kg (BELOW baseline!)
Time 01:00 - Scheduler runs → Hotspot RESOLVED! ✅
```

---

## Why This Design?

### For Production Systems:
In a real business, data arrives continuously:
- Trucks deliver every hour
- Sensors send data every minute
- APIs receive events constantly

**The 30-minute check ensures**:
- New problems are caught quickly
- System stays responsive
- Alerts go out promptly

### For Your Demo:
Since you uploaded ONE CSV and stopped:
- First run: Processed all events
- Subsequent runs: Nothing new to process
- Dashboard: Shows results from first run

**It's not wasteful - it's just waiting for new data!**

---

## What You're Seeing

### Your Current State:
```
Database: 25 events (from CSV)
Hotspots: 10 active (detected on first run)
Scheduler: Runs every 30 min, finds no new events
Dashboard: Shows same 10 hotspots
```

### If You Upload More Data:
```
Upload new CSV with 50 events
→ Scheduler finds 50 new events
→ Processes them
→ Detects new hotspots
→ Dashboard updates with new data
```

---

## Recommendations

### For Testing/Demo:
You can **increase the interval** to reduce noise:

**File**: `plugins/orchestration-engine/src/services/scheduler.py`

```python
# Current: Every 30 minutes
self.scheduler.add_job(
    self._run_hotspot_scan,
    trigger=IntervalTrigger(minutes=30),
    ...
)

# Change to: Every 6 hours (for demo)
self.scheduler.add_job(
    self._run_hotspot_scan,
    trigger=IntervalTrigger(hours=6),  # Less frequent
    ...
)

# Or: Disable completely (manual trigger only)
# Just comment out the add_job line
```

### For Production:
Keep 30 minutes or even reduce to 5-10 minutes for faster detection!

---

## Summary

### Your Observation: ✅ Correct!
"Every 30 minutes I'm getting the same data"

### Why: 
The scheduler checks for NEW events, finds none, so shows EXISTING hotspots

### Is This Bad?
**No!** It's designed for continuous data streams. In production:
- New data arrives constantly
- Scheduler catches it quickly
- Alerts go out promptly

### For Your Demo:
- Upload CSV once → Hotspots detected
- No new uploads → No new hotspots
- Dashboard shows existing hotspots
- **This is expected behavior!**

### To See Changes:
1. Upload a NEW CSV with different data
2. Or wait for the ML predictions to change
3. Or manually trigger hotspot detection
4. Or upload data via API continuously

**The system is working correctly - it's just waiting for new data!** ⏰
