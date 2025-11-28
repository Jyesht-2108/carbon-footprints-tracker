# Hotspot & Anomaly Detection - Simple Explanation

## What is a Hotspot?

**Simple Definition**: A hotspot is a **supplier/entity that's emitting MORE CO₂ than expected**.

Think of it like a **fever detector** for emissions:
- Normal body temperature: 98.6°F (baseline)
- Fever: 101°F (hotspot!)
- The thermometer checks every 30 minutes

---

## Real-World Example

### Your CSV File Has This Data:

```csv
supplier_id,distance_km,load_kg
Normal_Supplier,100,400        ← Normal operations
Heavy_Load_Supplier,300,1500   ← Heavy load!
Hotspot_CRITICAL,400,1200      ← Long distance + heavy!
```

### What Happens:

#### 1. ML Engine Calculates CO₂
```
Normal_Supplier:
- Distance: 100 km
- Load: 400 kg
- ML predicts: ~15 kg CO₂ ✅ Normal

Heavy_Load_Supplier:
- Distance: 300 km
- Load: 1500 kg (HEAVY!)
- ML predicts: ~70 kg CO₂ ⚠️ High!

Hotspot_CRITICAL:
- Distance: 400 km (LONG!)
- Load: 1200 kg (HEAVY!)
- ML predicts: ~88 kg CO₂ 🚨 Very High!
```

#### 2. Hotspot Engine Compares to Baseline
```
Baseline (Expected): 60 kg CO₂

Normal_Supplier: 15 kg
→ 75% BELOW baseline ✅ Good!

Heavy_Load_Supplier: 70 kg
→ 16.7% ABOVE baseline ⚠️ WARN hotspot!

Hotspot_CRITICAL: 88 kg
→ 47% ABOVE baseline 🚨 CRITICAL hotspot!
```

---

## Why Detect Hotspots from a Single CSV Upload?

### The CSV Contains DIFFERENT Suppliers with DIFFERENT Behaviors

Even in ONE upload, you can see:
- **Who's doing well** (Normal_Supplier)
- **Who's struggling** (Heavy_Load_Supplier)
- **Who needs urgent help** (Hotspot_CRITICAL)

### It's Like a Health Checkup:
```
Doctor examines 5 patients in one day:
- Patient 1: Healthy ✅
- Patient 2: Slightly high blood pressure ⚠️
- Patient 3: Critical condition 🚨

Same CSV = Same checkup!
```

---

## What Causes an Anomaly/Hotspot?

### From the CSV Data:

1. **Heavy Load**
   ```
   Normal: 400 kg
   Heavy: 1500 kg ← 3.75x heavier!
   → More fuel needed → More CO₂
   ```

2. **Long Distance**
   ```
   Normal: 100 km
   Critical: 400 km ← 4x longer!
   → More fuel burned → More CO₂
   ```

3. **Inefficient Vehicle**
   ```
   Diesel truck: High emissions
   Electric truck: Low emissions
   → Fuel type matters!
   ```

4. **Low Speed**
   ```
   Normal: 60 km/h (efficient)
   Critical: 40 km/h (inefficient)
   → Slower = more fuel per km
   ```

### Real Example from Your CSV:

```csv
Heavy_Load_Supplier,300,1500,truck_diesel,diesel,45
                    ↑   ↑    ↑            ↑      ↑
                    │   │    │            │      └─ Slow speed
                    │   │    │            └─ Diesel fuel
                    │   │    └─ Heavy truck
                    │   └─ VERY heavy load (1500 kg!)
                    └─ Long distance (300 km)

Result: 70 kg CO₂ (16.7% above baseline)
→ WARN hotspot detected!
```

---

## The 30-Minute Check (Scheduler)

### What It Does:

```
Every 30 minutes:
1. Read all events from database
2. Group by supplier
3. Calculate average CO₂ per supplier
4. Compare to baseline (60 kg)
5. Flag anyone above threshold
```

### Why Every 30 Minutes?

**Scenario 1: Continuous Monitoring**
```
Time 00:00 - Upload CSV
Time 00:30 - Check: Heavy_Load_Supplier at 70 kg ⚠️
Time 01:00 - Check: Still at 70 kg ⚠️
Time 01:30 - Check: Now at 65 kg (improving!)
```

**Scenario 2: New Data Arrives**
```
Time 00:00 - Upload CSV #1
Time 00:30 - Check: 3 hotspots detected
Time 01:00 - Upload CSV #2 (new data!)
Time 01:00 - Check: 5 hotspots now! (2 new ones)
```

**Scenario 3: Real-Time Operations**
```
Your trucks are running right now:
- Every hour, new data comes in
- Every 30 min, system checks for problems
- Alerts you immediately if issues arise
```

---

## Your Log Explained

```
2025-11-29 01:38:55 | Starting hotspot scan...
```
**What**: Scheduler triggered (every 30 min)
**Why**: Time to check all suppliers

```
2025-11-29 01:39:10 | Hotspot detected: Hotspot_CRITICAL (warn) - 47.9% above baseline
```
**What**: Found a problem!
**Who**: Hotspot_CRITICAL supplier
**How bad**: 47.9% above normal (WARN level)
**Why**: Their CO₂ is 88 kg vs baseline 60 kg

```
2025-11-29 01:39:10 | Alert generated for hotspot 90
```
**What**: Created an alert
**Why**: Notify user about the problem

```
2025-11-29 01:39:11 | Using cached recommendations for Hotspot_CRITICAL (found 5 existing)
```
**What**: AI already generated recommendations before
**Why**: Don't regenerate same advice (saves API calls)
**Smart**: Reuses existing recommendations

```
2025-11-29 01:39:14 | Hotspot detected: Heavy_Load_Supplier (warn) - 16.9% above baseline
```
**What**: Found another problem!
**Who**: Heavy_Load_Supplier
**How bad**: 16.9% above normal (WARN level)

---

## Why This Matters

### Without Hotspot Detection:
```
❌ You upload CSV
❌ See numbers on dashboard
❌ Don't know what's normal vs. abnormal
❌ Miss critical issues
❌ No alerts
❌ No recommendations
```

### With Hotspot Detection:
```
✅ You upload CSV
✅ System analyzes each supplier
✅ Identifies who's above normal
✅ Alerts you to problems
✅ AI suggests solutions
✅ You take action!
```

---

## Real-World Business Scenario

### Monday Morning:
```
You upload last week's logistics data (CSV)
- 100 deliveries
- 10 different suppliers
- Various distances and loads
```

### System Analyzes:
```
Supplier A: 45 kg CO₂ ✅ Good
Supplier B: 52 kg CO₂ ✅ Good
Supplier C: 88 kg CO₂ 🚨 HOTSPOT!
Supplier D: 48 kg CO₂ ✅ Good
Supplier E: 71 kg CO₂ ⚠️ HOTSPOT!
```

### You Get Alerts:
```
🚨 CRITICAL: Supplier C is 47% above baseline!
   Recommendations:
   - Optimize routes (save 12 kg CO₂)
   - Consolidate shipments (save 8 kg CO₂)

⚠️ WARNING: Supplier E is 18% above baseline!
   Recommendations:
   - Switch to alternative fuels (save 7 kg CO₂)
```

### You Take Action:
```
1. Call Supplier C → Discuss route optimization
2. Review Supplier E → Plan fuel switch
3. Monitor next week → See if improvements work
```

---

## Continuous Monitoring

### Week 1:
```
Upload CSV → 3 hotspots detected
```

### Week 2:
```
Upload CSV → 2 hotspots (1 fixed!)
```

### Week 3:
```
Upload CSV → 1 hotspot (another fixed!)
```

### Week 4:
```
Upload CSV → 0 hotspots (all fixed! 🎉)
```

---

## Summary

### What is a Hotspot?
A supplier emitting MORE CO₂ than expected (above baseline)

### What is Anomaly Detection?
Finding suppliers whose emissions are abnormally high

### Why from ONE CSV?
The CSV contains MULTIPLE suppliers with DIFFERENT behaviors
- Some normal
- Some high
- Some critical

### Why Every 30 Minutes?
- Continuous monitoring
- Catch new problems quickly
- Track improvements over time
- Alert you immediately

### The Magic:
```
CSV Upload
    ↓
ML calculates CO₂ for each event
    ↓
Hotspot Engine compares to baseline
    ↓
Flags anyone above threshold
    ↓
AI generates recommendations
    ↓
You get alerts and take action!
```

**It's like having a 24/7 emissions watchdog that never sleeps!** 🐕‍🦺

---

## Your Specific Case

From your log:
- **Hotspot_CRITICAL**: 47.9% above baseline (88 kg vs 60 kg)
- **Heavy_Load_Supplier**: 16.9% above baseline (70 kg vs 60 kg)

These were detected because:
1. Their distance + load combinations are HIGH
2. ML predicted high CO₂ for them
3. Hotspot engine compared to baseline (60 kg)
4. Found them above threshold
5. Created alerts and recommendations

**Yes, it checks every 30 minutes!** ✅
