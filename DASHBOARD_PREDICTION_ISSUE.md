# Dashboard Prediction Display Issue

## Problem
After uploading the extreme spike CSV (demo_upload_5_extreme_spike.csv), the dashboard is not showing the high predicted emissions.

## What's Happening

### Actual Data:
- **Hotspots detected**: 73 active
- **Predictions from ML**: 750-760 kg CO₂ per event
- **Baseline**: 579 kg CO₂
- **Percent above baseline**: ~30%

### Dashboard Showing:
- **Current Emissions**: 40.47 kg CO₂ (GreenTech_Industries)
- **Total**: 47.21 kg CO₂
- **Heatmap**: Shows "Low" (green) because 40 < 50 kg threshold

## Root Cause

The dashboard "Current Emissions" endpoint (`/emissions/current`) is showing **aggregated actual emissions** from the events table, NOT the **predicted emissions** from the ML models.

### What Should Happen:
1. Upload extreme spike CSV with high values (850-920 kWh factories, 650-680 kWh warehouses)
2. ML models predict ~750-760 kg CO₂ per event
3. Dashboard shows these HIGH predictions
4. Heatmap shows "Critical" (red) because 750 > 100 kg threshold

### What's Actually Happening:
1. Upload extreme spike CSV ✓
2. ML models predict correctly (750-760 kg) ✓
3. Dashboard shows **aggregated actual** emissions (40 kg) ✗
4. Heatmap shows "Low" (green) ✗

## The Issue

The dashboard is querying `/emissions/current` which returns:
```json
{
  "categories": {
    "GreenTech_Industries": 40.47
  }
}
```

But it SHOULD be showing the **predicted** values from the hotspots/predictions table:
```json
{
  "categories": {
    "GreenTech_Industries": 750.74  // From ML predictions
  }
}
```

## Solution Options

### Option 1: Update Dashboard API
Modify `/emissions/current` endpoint to return **predicted** emissions instead of actual emissions.

### Option 2: Use Different Endpoint
Have the dashboard query `/hotspots` or `/predictions` to get the ML-predicted values.

### Option 3: Add Prediction Field
Add a `predicted_emissions` field to the `/emissions/current` response alongside actual emissions.

## Recommended Fix

**Option 3** is best - show BOTH actual and predicted:
```json
{
  "categories": {
    "GreenTech_Industries": 40.47  // Actual
  },
  "predictions": {
    "GreenTech_Industries": 750.74  // Predicted
  }
}
```

Then update the dashboard to display predictions when available, falling back to actual emissions.

## Temporary Workaround

To see the predictions working:
1. Check the "Critical Hotspots" section - it shows the correct predictions (750+ kg)
2. The hotspots list shows "warn" severity with 30% above baseline
3. The ML models ARE working correctly

The issue is purely a **display problem** in the heatmap and emissions cards.

## Files to Update

1. **Backend**: `plugins/orchestration-engine/src/api/routes_dashboard.py`
   - Update `/emissions/current` to include predictions

2. **Frontend**: `frontend-ui/src/components/charts/EmissionsHeatmap.tsx`
   - Update to use predicted emissions instead of actual

3. **Frontend**: `frontend-ui/src/components/cards/EmissionsCard.tsx`
   - Show predicted emissions prominently

## Current Status

- ✅ CSV upload working
- ✅ ML predictions working (750+ kg CO₂)
- ✅ Hotspot detection working (73 hotspots)
- ✅ Baseline comparison working (30% above)
- ✗ Dashboard display not showing predictions
- ✗ Heatmap showing wrong severity (Low instead of Critical)

The system is working correctly - it's just not displaying the predictions in the main dashboard view!
