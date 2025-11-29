# Test Scenarios Guide

## Overview
This guide explains the 7 CSV test files and their intended use cases for testing the Carbon Nexus system.

## Test Files

### 1. demo_upload_1_baseline_v2.csv
**Purpose**: Establish baseline emissions  
**Supplier**: GreenTech_Industries  
**Events**: 24 events (mixed logistics, factory, warehouse)  
**Expected Behavior**:
- ✅ First upload establishes baseline (~50 kg CO₂)
- ✅ Should show 0 or minimal hotspots
- ✅ Dashboard shows "Low" severity (green)
- ✅ Sets reference point for future comparisons

**Upload Command**:
```bash
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_1_baseline_v2.csv" \
  -F "supplier_id=GreenTech_Industries"
```

---

### 2. demo_upload_2_increased_activity.csv
**Purpose**: Simulate spike in emissions  
**Supplier**: GreenTech_Industries  
**Events**: 32 events (increased activity)  
**Expected Behavior**:
- ⚠️ Predictions ~100 kg CO₂ (+100% above baseline)
- ⚠️ 15-20 critical hotspots detected
- ⚠️ Dashboard shows "Medium" severity (yellow/orange)
- ⚠️ Alerts generated for excessive emissions

**Upload Command**:
```bash
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_2_increased_activity.csv" \
  -F "supplier_id=GreenTech_Industries"
```

---

### 3. demo_upload_3_optimized_operations.csv
**Purpose**: Show improvement after optimization  
**Supplier**: GreenTech_Industries  
**Events**: 37 events (optimized operations)  
**Expected Behavior**:
- ✅ Predictions ~55 kg CO₂ (back near baseline)
- ✅ 5-10 warning hotspots (reduced)
- ✅ Dashboard shows "Low" severity (green)
- ✅ Demonstrates successful optimization

**Upload Command**:
```bash
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_3_optimized_operations.csv" \
  -F "supplier_id=GreenTech_Industries"
```

---

### 4. demo_upload_4_multiple_suppliers.csv ⭐ NEW
**Purpose**: Test multi-supplier comparison  
**Suppliers**: 5 different suppliers (EcoTech, GreenTech, SustainCorp, CleanEnergy, NatureFirst)  
**Events**: 20 events (4 per supplier)  
**Expected Behavior**:
- 📊 Heatmap shows 5 different suppliers
- 📊 Pie chart shows distribution across suppliers
- 📊 Bar chart ranks suppliers by emissions
- 📊 Each supplier ~15-20 kg CO₂
- ✅ All show "Low" severity (green)

**Upload Command**:
```bash
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_4_multiple_suppliers.csv" \
  -F "supplier_id=Multiple"
```

**What to Check**:
- Dashboard heatmap displays 5 tiles
- Each supplier has different color intensity
- Pie chart shows 5 slices
- Bar chart shows 5 bars

---

### 5. demo_upload_5_extreme_spike.csv ⭐ NEW
**Purpose**: Test critical threshold detection  
**Supplier**: GreenTech_Industries  
**Events**: 20 events (extreme high emissions)  
**Expected Behavior**:
- 🔴 Predictions ~200+ kg CO₂ (+300% above baseline)
- 🔴 20+ critical hotspots
- 🔴 Dashboard shows "Critical" severity (red)
- 🔴 Multiple critical alerts
- 🔴 Heatmap shows red/critical intensity

**Upload Command**:
```bash
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_5_extreme_spike.csv" \
  -F "supplier_id=GreenTech_Industries"
```

**What to Check**:
- Heatmap tile shows "Critical" label (red)
- Alert count increases significantly
- Hotspots list shows "critical" severity
- Recommendations suggest urgent actions

---

### 6. demo_upload_6_gradual_improvement.csv ⭐ NEW
**Purpose**: Test trend detection (improving over time)  
**Supplier**: GreenTech_Industries  
**Events**: 20 events (gradually decreasing emissions)  
**Expected Behavior**:
- 📉 Predictions show downward trend
- 📉 Emissions decrease from ~60 kg to ~45 kg
- ✅ Fewer hotspots over time
- ✅ Dashboard shows "Low" severity
- 📊 7-day forecast shows declining trend

**Upload Command**:
```bash
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_6_gradual_improvement.csv" \
  -F "supplier_id=GreenTech_Industries"
```

**What to Check**:
- Forecast chart shows downward slope
- Hotspot count decreases
- Data quality improves
- Positive trend indicators

---

### 7. demo_upload_7_mixed_performance.csv ⭐ NEW
**Purpose**: Test comparative analysis across suppliers  
**Suppliers**: 3 suppliers with different performance levels  
**Events**: 24 events (8 per supplier)  
**Expected Behavior**:
- 📊 EcoTech_Solutions: ~12 kg CO₂ (best performer - green)
- ⚠️ GreenTech_Industries: ~35 kg CO₂ (worst performer - orange)
- 📊 SustainCorp: ~15 kg CO₂ (middle performer - yellow)
- 📊 Heatmap shows clear visual difference
- 📊 Bar chart clearly ranks performance

**Upload Command**:
```bash
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_7_mixed_performance.csv" \
  -F "supplier_id=Multiple"
```

**What to Check**:
- Heatmap shows 3 different intensity colors
- GreenTech tile is orange/yellow (highest)
- EcoTech tile is green (lowest)
- Bar chart clearly shows ranking
- Pie chart shows GreenTech has largest slice

---

## Recommended Testing Sequence

### Scenario 1: Basic Flow (Baseline → Spike → Optimize)
```bash
# 1. Clear database (optional)
# DELETE FROM baselines; DELETE FROM hotspots; etc.

# 2. Upload baseline
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_1_baseline_v2.csv" \
  -F "supplier_id=GreenTech_Industries"

# Wait 30 seconds, check dashboard

# 3. Upload spike
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_2_increased_activity.csv" \
  -F "supplier_id=GreenTech_Industries"

# Wait 30 seconds, check dashboard (should show warnings)

# 4. Upload optimization
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_3_optimized_operations.csv" \
  -F "supplier_id=GreenTech_Industries"

# Wait 30 seconds, check dashboard (should show improvement)
```

### Scenario 2: Multi-Supplier Comparison
```bash
# Clear database first

# Upload multi-supplier data
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_4_multiple_suppliers.csv" \
  -F "supplier_id=Multiple"

# Check: Heatmap shows 5 suppliers, all green
```

### Scenario 3: Critical Alert Testing
```bash
# Upload baseline first
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_1_baseline_v2.csv" \
  -F "supplier_id=GreenTech_Industries"

# Then upload extreme spike
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_5_extreme_spike.csv" \
  -F "supplier_id=GreenTech_Industries"

# Check: Red alerts, critical hotspots, red heatmap tile
```

### Scenario 4: Trend Analysis
```bash
# Upload baseline
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_1_baseline_v2.csv" \
  -F "supplier_id=GreenTech_Industries"

# Upload gradual improvement
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_6_gradual_improvement.csv" \
  -F "supplier_id=GreenTech_Industries"

# Check: Forecast shows downward trend
```

### Scenario 5: Comparative Performance
```bash
# Clear database

# Upload mixed performance
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@upload-data/demo_upload_7_mixed_performance.csv" \
  -F "supplier_id=Multiple"

# Check: Clear visual ranking in heatmap and charts
```

---

## Expected Dashboard Behavior

### Heatmap Severity Thresholds
- **Low** (Green): < 20 kg CO₂
- **Medium** (Yellow): 20-50 kg CO₂
- **High** (Orange): 50-100 kg CO₂
- **Critical** (Red): > 100 kg CO₂

### Hotspot Severity Thresholds
- **warn**: 0-50% above baseline
- **critical**: > 50% above baseline

### Alert Counts
- Baseline: 0-5 alerts
- Spike: 15-25 alerts
- Extreme: 30+ alerts

---

## Troubleshooting

### If uploads fail:
1. Check Data Core is running on port 8002
2. Check Orchestration Engine is running on port 8003
3. Check ML Engine is running on port 8001
4. Verify database columns exist (run migration SQL)

### If analysis doesn't trigger:
```bash
# Manually trigger analysis
curl -X POST http://localhost:8003/trigger-analysis
```

### If dashboard doesn't update:
1. Refresh browser (Ctrl+R or Cmd+R)
2. Check browser console for errors
3. Verify API endpoints are responding

---

## Summary

You now have 7 comprehensive test files:
1. ✅ Baseline (normal operations)
2. ⚠️ Spike (increased activity)
3. ✅ Optimization (improvement)
4. 📊 Multiple suppliers (comparison)
5. 🔴 Extreme spike (critical alerts)
6. 📉 Gradual improvement (trends)
7. 📊 Mixed performance (ranking)

These cover all major testing scenarios for the Carbon Nexus platform!
