# CSV Files Corrected - Final Version

## What Was Wrong

The original CSV files had values that were **too high for baseline operations**:
- ❌ Distances: 120-145 km (too long for baseline)
- ❌ Loads: 480-560 kg (too heavy for baseline)
- ❌ Factory energy: 450-480 kWh (too high for baseline)
- ❌ Warehouse inventory: 8500-8620 (too large for baseline)

This caused the ML models to predict **very high CO2 values (~784 kg)**, which when compared to a low baseline (60 kg) resulted in **1207% hotspots** - completely wrong for baseline data!

## Correct Approach (ChatGPT Verified)

### File 1: Baseline (Should be LOW and STABLE)
**Purpose**: Establish normal, efficient operations
**Values**: Small distances, light loads, moderate energy use
**Expected CO2**: ~40-60 kg per event
**Expected Hotspots**: **0** (this IS the baseline!)

### File 2: Increased Activity (Should be HIGHER)
**Purpose**: Show peak demand / stress
**Values**: Longer distances, heavier loads, more energy
**Expected CO2**: ~80-120 kg per event (+40-100% above baseline)
**Expected Hotspots**: **15-20 critical**

### File 3: Optimized (Should be BACK TO BASELINE)
**Purpose**: Show optimization working
**Values**: Return to baseline-like values
**Expected CO2**: ~45-65 kg per event (close to baseline)
**Expected Hotspots**: **5-10 warnings** (minor variations)

## New CSV Values

### File 1: demo_upload_1_baseline_v2.csv (BASELINE)

**Logistics** (10 events):
- Distance: 38-55 km (SHORT - efficient routes)
- Load: 260-310 kg (LIGHT - optimized loads)
- Vehicle: Mostly vans (fuel efficient)
- Speed: 70-78 km/h (optimal speed)

**Factory** (8 events):
- Energy: 180-195 kWh (MODERATE - efficient operations)
- Furnace: 35-39% (LOW usage)
- Cooling: 55-60 (MODERATE)

**Warehouse** (6 events):
- Temperature: 19-22°C (OPTIMAL - minimal cooling)
- Refrigeration: 25-30 (LOW load)
- Inventory: 4100-4300 (MODERATE volume)

**Expected ML Predictions**: ~40-60 kg CO2 per event
**Expected Dashboard**: 🟢 Green, stable, NO hotspots

---

### File 2: demo_upload_2_increased_activity.csv (SPIKE)

**GreenTech Logistics** (12 events):
- Distance: 68-95 km (+50-70% vs baseline)
- Load: 400-510 kg (+60-80% vs baseline)
- Vehicle: All trucks (less efficient)
- Speed: 57-68 km/h (slower, more fuel)

**GreenTech Factory** (6 events):
- Energy: 260-275 kWh (+40-45% vs baseline)
- Furnace: 52-56% (+50% vs baseline)
- Cooling: 82-88 (+45% vs baseline)

**GreenTech Warehouse** (5 events):
- Temperature: 22-26°C (WARMER - more cooling needed)
- Refrigeration: 36-42 (+40% vs baseline)
- Inventory: 5100-5420 (+25% vs baseline)

**EcoSupply** (smaller, more efficient):
- Logistics: 38-52 km, 240-280 kg (similar to GreenTech baseline)
- Factory: 175-182 kWh (efficient)
- Warehouse: 3800-3950 (smaller)

**Expected ML Predictions**: 
- GreenTech: ~80-120 kg CO2 (+40-100% above baseline)
- EcoSupply: ~45-65 kg CO2 (at baseline level)

**Expected Dashboard**: 🔴 Red, 15-20 critical hotspots (GreenTech only)

---

### File 3: demo_upload_3_optimized_operations.csv (OPTIMIZED)

**GreenTech Logistics** (8 events):
- Distance: 38-55 km (BACK TO BASELINE)
- Load: 265-320 kg (BACK TO BASELINE)
- Vehicle: Vans (efficient again)
- Speed: 73-81 km/h (optimal)

**GreenTech Factory** (7 events):
- Energy: 185-196 kWh (BACK TO BASELINE)
- Furnace: 36-39% (BACK TO BASELINE)
- Cooling: 56-61 (BACK TO BASELINE)

**GreenTech Warehouse** (6 events):
- Temperature: 18-21°C (OPTIMAL again)
- Refrigeration: 23-28 (BACK TO BASELINE)
- Inventory: 4050-4220 (BACK TO BASELINE)

**EcoSupply** (even more efficient):
- Logistics: 32-40 km, 210-240 kg (BETTER than baseline)
- Factory: 165-170 kWh (BETTER than baseline)
- Warehouse: 3600-3720 (efficient)

**SustainableGoods** (best-in-class):
- Logistics: 28-32 km, 180-200 kg (MOST efficient)
- Factory: 135-140 kWh (MOST efficient)
- Warehouse: 2900-3050 (MOST efficient)

**Expected ML Predictions**:
- GreenTech: ~42-62 kg CO2 (at baseline)
- EcoSupply: ~35-50 kg CO2 (below baseline)
- Sustainable: ~25-40 kg CO2 (well below baseline)

**Expected Dashboard**: 🟡 Yellow/green, 5-10 warnings, improvement shown

## Expected Dashboard Progression

```
Upload 1: BASELINE
═══════════════════════════════════
CO2: ████ 50 kg (baseline)
Hotspots: (none)
Status: 🟢 GREEN
Message: "Baseline established"


Upload 2: SPIKE
═══════════════════════════════════
CO2: ████████ 100 kg (+100%)
Hotspots: 🔴🔴🔴🔴🔴🔴 (18 critical)
Status: 🔴 RED
Message: "Critical: Emissions doubled!"


Upload 3: OPTIMIZED
═══════════════════════════════════
CO2: █████ 55 kg (+10%)
Hotspots: 🟡🟡 (6 warnings)
Status: 🟡 YELLOW
Message: "Improvement: Back to baseline"
```

## Key Changes Made

| Metric | File 1 (OLD) | File 1 (NEW) | Change |
|--------|--------------|--------------|--------|
| Distance | 120-145 km | 38-55 km | -60% |
| Load | 480-560 kg | 260-310 kg | -45% |
| Factory Energy | 450-480 kWh | 180-195 kWh | -60% |
| Warehouse Inventory | 8500-8620 | 4100-4300 | -50% |

**Result**: Baseline predictions should now be ~40-60 kg CO2 instead of ~784 kg CO2

## Why This Matters

**Old Behavior**:
- File 1: 784 kg CO2 → compared to 60 kg baseline → 1207% hotspot ❌
- Completely wrong narrative

**New Behavior**:
- File 1: ~50 kg CO2 → establishes baseline → 0 hotspots ✅
- File 2: ~100 kg CO2 → 100% above baseline → critical hotspots ✅
- File 3: ~55 kg CO2 → 10% above baseline → minor warnings ✅
- Perfect demo narrative!

## Testing Instructions

1. **Clear all data**:
```sql
DELETE FROM baselines;
DELETE FROM hotspots;
DELETE FROM predictions;
DELETE FROM events_normalized;
```

2. **Restart services** (to pick up all fixes):
```bash
# ML Engine
cd plugins/ml-engine && source myvenv/bin/activate && python -m src.app

# Orchestration Engine  
cd plugins/orchestration-engine && source venv/bin/activate && python -m src.main
```

3. **Upload files in sequence**:
   - File 1 → Expect: 0 hotspots, ~50 kg CO2 baseline
   - File 2 → Expect: 15-20 hotspots, ~100 kg CO2
   - File 3 → Expect: 5-10 hotspots, ~55 kg CO2

## Summary

✅ CSV values corrected to realistic baseline levels
✅ File 1 will establish proper baseline (~50 kg CO2)
✅ File 2 will show real spike (+100%)
✅ File 3 will show optimization success (back to baseline)
✅ Perfect demo narrative: Baseline → Problem → Solution 🎯
