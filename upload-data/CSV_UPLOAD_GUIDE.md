# CSV Upload Test Guide

## Overview

Three CSV files have been created to test the complete data pipeline and demonstrate different operational scenarios.

## File Descriptions

### 1. demo_upload_1_baseline_v2.csv (Baseline Operations)
**Purpose**: Establish baseline emissions for GreenTech_Industries

**Data Profile**:
- **Supplier**: GreenTech_Industries (single supplier)
- **Time Range**: 2025-11-29 06:00 - 21:00
- **Total Events**: 24
  - 10 Logistics events (06:00-10:30, every 30 min)
  - 8 Factory events (06:00-20:00, every 2 hours)
  - 6 Warehouse events (06:00-21:00, every 3 hours)

**Characteristics**:
- Moderate logistics activity (120-145 km, 480-560 kg loads)
- Standard factory operations (450-480 kWh, 75-82% furnace usage)
- Normal warehouse conditions (21-24°C, 44-49 refrigeration load)

**Expected Results**:
- ✅ Baseline emissions established at ~784 kg CO₂ (from predictions)
- ✅ **NO HOTSPOTS** (this is the baseline!)
- ✅ All three event types generate predictions
- ✅ Dashboard shows green/stable
- ✅ No alerts triggered

---

### 2. demo_upload_2_increased_activity.csv (Peak Operations)
**Purpose**: Test system with increased activity and multiple suppliers

**Data Profile**:
- **Suppliers**: GreenTech_Industries + EcoSupply_Corp (2 suppliers)
- **Time Range**: 2025-11-29 11:00 - 23:00
- **Total Events**: 32
  - 17 Logistics events (12 GreenTech, 5 EcoSupply)
  - 9 Factory events (6 GreenTech, 3 EcoSupply)
  - 7 Warehouse events (5 GreenTech, 2 EcoSupply)

**Characteristics**:
- **GreenTech_Industries**: Increased activity
  - Higher logistics loads (590-720 kg, 20% increase)
  - Longer distances (142-190 km, 30% increase)
  - Higher factory energy (510-540 kWh, 15% increase)
  - Warmer warehouse temps (23-27°C, higher cooling needs)
  
- **EcoSupply_Corp**: More efficient operations
  - Lighter loads (360-420 kg)
  - Shorter distances (88-110 km)
  - Lower factory energy (375-390 kWh)
  - Cooler warehouse temps (20-21°C)

**Expected Results**:
- GreenTech hotspots should increase (higher emissions)
- EcoSupply should show lower emissions (more efficient)
- Comparison between suppliers visible in dashboard
- 20-25 hotspots expected (mostly GreenTech)

---

### 3. demo_upload_3_optimized_operations.csv (Optimized Operations)
**Purpose**: Test system with improved efficiency and three suppliers

**Data Profile**:
- **Suppliers**: GreenTech_Industries + EcoSupply_Corp + SustainableGoods_Ltd (3 suppliers)
- **Time Range**: 2025-11-30 06:00 - 21:00
- **Total Events**: 37
  - 15 Logistics events (8 GreenTech, 4 EcoSupply, 3 Sustainable)
  - 12 Factory events (7 GreenTech, 3 EcoSupply, 2 Sustainable)
  - 10 Warehouse events (6 GreenTech, 2 EcoSupply, 2 Sustainable)

**Characteristics**:
- **GreenTech_Industries**: Optimized operations
  - Reduced distances (92-118 km, 20% reduction from baseline)
  - Moderate loads (485-540 kg)
  - Lower factory energy (420-445 kWh, 8% reduction)
  - Better warehouse efficiency (20-23°C, 39-44 refrigeration)
  
- **EcoSupply_Corp**: Continued efficiency
  - Short distances (68-82 km)
  - Light loads (300-340 kg)
  - Low factory energy (350-360 kWh)
  - Efficient warehouse (19-20°C)
  
- **SustainableGoods_Ltd**: Best-in-class efficiency
  - Minimal distances (55-62 km)
  - Lightest loads (250-270 kg)
  - Lowest factory energy (280-290 kWh)
  - Most efficient warehouse (18-19°C)

**Expected Results**:
- GreenTech emissions should decrease (optimization working)
- Clear efficiency ranking: Sustainable > EcoSupply > GreenTech
- Fewer critical hotspots (10-15 expected)
- Demonstrates improvement over time

---

## Upload Sequence

### Step 1: Upload Baseline (File 1)
```bash
# Upload: demo_upload_1_baseline_v2.csv
```

**What to Check**:
- ✅ 24 events processed
- ✅ Baseline established at ~60 kg CO₂
- ✅ 16+ critical hotspots (GreenTech_Industries)
- ✅ All event types (logistics, factory, warehouse) have predictions
- ✅ Dashboard shows single supplier

**Dashboard Metrics**:
- Total Emissions: ~784 kg CO₂
- Hotspots: **0** (baseline establishment)
- Suppliers: 1 (GreenTech_Industries)
- Alerts: **0** (all green)
- Baseline: 784 kg CO₂ established

---

### Step 2: Upload Increased Activity (File 2)
```bash
# Upload: demo_upload_2_increased_activity.csv
```

**What to Check**:
- ✅ 32 events processed
- ✅ Two suppliers visible in dashboard
- ✅ GreenTech hotspots increase (higher emissions)
- ✅ EcoSupply shows lower emissions
- ✅ Supplier comparison visible

**Dashboard Metrics**:
- Total Emissions: ~950-1100 kg CO₂ (increased 20-40%)
- Hotspots: **15-20 critical** (GreenTech above baseline)
- Suppliers: 2 (GreenTech + EcoSupply)
- Alerts: **15-20 critical**
- Emissions by Supplier chart shows distribution

**Expected Insights**:
- ⚠️ GreenTech emissions 20-40% above baseline (784 kg)
- ✅ EcoSupply more efficient (below baseline)
- ⚠️ Recommendations generated for GreenTech
- 📈 Trend shows upward spike

---

### Step 3: Upload Optimized Operations (File 3)
```bash
# Upload: demo_upload_3_optimized_operations.csv
```

**What to Check**:
- ✅ 37 events processed
- ✅ Three suppliers visible
- ✅ GreenTech emissions decreased (optimization working)
- ✅ Clear efficiency ranking visible
- ✅ Fewer critical hotspots

**Dashboard Metrics**:
- Total Emissions: ~650-750 kg CO₂ (decreased, closer to baseline)
- Hotspots: **5-10 warnings** (improvement!)
- Suppliers: 3 (GreenTech + EcoSupply + Sustainable)
- Alerts: **5-10 warnings** (reduced from 20)
- Heatmap shows efficiency differences

**Expected Insights**:
- ✅ GreenTech improved 20-30% from File 2
- ✅ Now within 10-15% of baseline (784 kg)
- ✅ SustainableGoods_Ltd shows best practices
- ✅ Recommendations acknowledge improvements
- 📉 Trend shows downward correction

---

## Data Validation Checklist

After each upload, verify:

### ✅ Upload Success
- [ ] CSV parsed without errors
- [ ] All rows processed
- [ ] Job status shows "complete"

### ✅ Predictions Generated
- [ ] Logistics predictions (check logs for success)
- [ ] Factory predictions (check logs for success)
- [ ] Warehouse predictions (check logs for success - should work after ML Engine restart)
- [ ] No 422 errors in logs

### ✅ Hotspot Detection
- [ ] Hotspots created in database
- [ ] Severity levels assigned (info/warn/critical)
- [ ] Percent above baseline calculated
- [ ] WebSocket notifications sent

### ✅ Dashboard Display
- [ ] Current emissions updated
- [ ] Hotspots list populated
- [ ] Supplier breakdown shows all suppliers
- [ ] Heatmap displays correctly
- [ ] Recommendations generated

### ✅ Database Verification
```bash
python3 check_predictions.py
```
Should show:
- Events in events_normalized table
- Predictions in predictions table
- Hotspots in hotspots table
- Breakdown by event type and supplier

---

## Expected Progression

### Upload 1 (Baseline):
- ✅ Baseline established: ~784 kg CO₂
- ✅ **NO hotspots** (this is correct!)
- ✅ Green dashboard
- ✅ Reference point created

### Upload 1 → Upload 2:
- ❌ Emissions INCREASE 20-40% (more activity, heavier loads)
- ❌ **15-20 hotspots** appear (above baseline)
- ⚠️ Red/orange dashboard
- ⚠️ Critical alerts triggered

### Upload 2 → Upload 3:
- ✅ Emissions DECREASE 20-30% (optimization working)
- ✅ **Only 5-10 hotspots** (improvement!)
- ✅ Yellow/green dashboard
- ✅ System acknowledges improvement

---

## Troubleshooting

### If warehouse predictions fail:
```bash
# Restart ML Engine
cd plugins/ml-engine
source myvenv/bin/activate
python -m src.app
```

### If no hotspots detected:
- Check baseline values in database
- Verify predictions are being generated
- Check orchestration engine logs

### If dashboard doesn't update:
- Refresh browser
- Check WebSocket connection (should see "Connected" in console)
- Verify orchestration engine is running on port 8003

---

## Summary

These three CSV files provide a complete test scenario:

1. **Baseline**: Establish normal operations
2. **Increased**: Test with higher activity and multiple suppliers
3. **Optimized**: Demonstrate improvement and efficiency gains

Upload them in sequence to see the full story of emissions tracking, hotspot detection, and operational optimization!
