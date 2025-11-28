# Complete Data Flow - From CSV to Dashboard

## The CSV File: test_data_hotspot_scenarios.csv

### What's Inside?
This CSV contains **simulated logistics/transportation data** with different emission scenarios:

```csv
supplier_id,timestamp,distance_km,load_kg,vehicle_type,fuel_type,speed,event_type
Normal_Supplier,2025-11-28 08:00:00,100,400,truck_diesel,diesel,60,logistics
Hotspot_CRITICAL,2025-11-28 08:00:00,400,1200,truck_diesel,diesel,40,logistics
Heavy_Load_Supplier,2025-11-28 08:00:00,300,1500,truck_diesel,diesel,45,logistics
```

### Data Fields Explained:

| Field | Meaning | Example | Purpose |
|-------|---------|---------|---------|
| **supplier_id** | Company/supplier name | "Heavy_Load_Supplier" | Identify who's emitting |
| **timestamp** | When event occurred | "2025-11-28 08:00:00" | Track emissions over time |
| **distance_km** | Distance traveled | 300 km | Calculate transport emissions |
| **load_kg** | Cargo weight | 1500 kg | Heavier = more emissions |
| **vehicle_type** | Type of vehicle | "truck_diesel" | Different vehicles = different emissions |
| **fuel_type** | Fuel used | "diesel" or "electric" | Fuel type affects CO₂ |
| **speed** | Average speed | 45 km/h | Speed affects efficiency |
| **event_type** | Type of activity | "logistics" | Categorize events |

### Why These Specific Suppliers?

The CSV is designed to test different scenarios:

1. **Normal_Supplier** (Baseline)
   - Distance: ~100 km
   - Load: ~400 kg
   - Expected: Normal emissions, no hotspots

2. **Hotspot_INFO** (Minor Issue)
   - Distance: ~180 km
   - Load: ~700 kg
   - Expected: Slightly elevated emissions

3. **Hotspot_WARN** (Warning Level)
   - Distance: ~250 km
   - Load: ~900 kg
   - Expected: Moderate emissions spike

4. **Hotspot_CRITICAL** (Critical Issue)
   - Distance: ~400-480 km
   - Load: ~1200-1350 kg
   - Expected: Severe emissions spike

5. **Heavy_Load_Supplier** (Heavy Transport)
   - Distance: ~300-330 km
   - Load: ~1500-1580 kg
   - Expected: High emissions due to weight

6. **EV_Efficient** (Electric Vehicles)
   - Distance: ~150 km
   - Load: ~500 kg
   - Fuel: Electric
   - Expected: Very low/zero emissions

---

## Data Flow: CSV → Dashboard

### Step 1: Upload CSV (Manual)
```
User uploads CSV → Data Core API → Validation → Storage
```

**What Happens:**
1. User uploads `test_data_hotspot_scenarios.csv`
2. Data Core validates schema (checks columns)
3. Normalizes data (standardizes format)
4. Detects outliers (flags unusual values)
5. Fills gaps (handles missing data)
6. Stores in `events_normalized` table

**Result**: 25 events stored in database

---

### Step 2: ML Engine Predicts CO₂ (Automatic)
```
Events → ML Engine → CO₂ Predictions
```

**What Happens:**
1. ML Engine reads events from database
2. Calculates CO₂ for each event using formula:
   ```
   CO₂ = f(distance, load, vehicle_type, fuel_type, speed)
   ```
3. For diesel trucks:
   - Heavy load (1500 kg) + long distance (300 km) = ~70 kg CO₂
   - Normal load (400 kg) + short distance (100 km) = ~15 kg CO₂
4. For electric vehicles:
   - CO₂ = 0 (or very low if considering electricity source)

**Result**: Each event gets a `predicted_co2` value

---

### Step 3: Hotspot Detection (Every 30 Minutes)
```
Scheduler runs → Hotspot Engine → Detects anomalies
```

**What Happens:**
1. **Scheduler triggers** every 30 minutes
2. **Hotspot Engine**:
   - Groups events by supplier
   - Calculates average CO₂ per supplier
   - Compares to baseline (60 kg CO₂)
   - Flags suppliers above threshold:
     - **INFO**: 0-20% above baseline
     - **WARN**: 20-50% above baseline
     - **CRITICAL**: >50% above baseline

**Example Detection:**
```
Heavy_Load_Supplier:
- Predicted CO₂: 70 kg
- Baseline: 60 kg
- Percent above: 16.7%
- Severity: WARN
→ Creates hotspot in database
```

**Result**: Hotspots stored in `hotspots` table

---

### Step 4: AI Recommendations (When Hotspot Detected)
```
New Hotspot → RAG Service → AI generates recommendations
```

**What Happens:**
1. Orchestration Engine detects new hotspot
2. Calls RAG Service with hotspot details
3. Google Gemini AI analyzes:
   - Supplier name
   - Emission level
   - Percent above baseline
4. Generates 2-3 actionable recommendations:
   - "Optimize route planning" (12 kg reduction)
   - "Consolidate shipments" (8 kg reduction)
   - "Switch to alternative fuels" (7 kg reduction)

**Result**: Recommendations stored in `recommendations` table

---

### Step 5: Forecast Generation (ML Engine)
```
Historical data → ML Model → 7-day forecast
```

**What Happens:**
1. ML Engine analyzes historical patterns
2. Uses time-series forecasting
3. Predicts next 7 days of emissions
4. Includes confidence intervals

**Example Forecast:**
```
Day 1: 455 kg CO₂
Day 2: 462 kg CO₂
Day 3: 458 kg CO₂
Day 4: 470 kg CO₂
Day 5: 465 kg CO₂
Day 6: 468 kg CO₂
Day 7: 472 kg CO₂
```

**Result**: Forecast data available via API

---

### Step 6: Dashboard Display (Real-Time)
```
Frontend queries APIs → Displays charts/cards
```

**What Happens:**
1. **Dashboard loads** → Queries all APIs
2. **Emissions Card**: Shows total current CO₂
3. **Forecast Chart**: Displays 7-day prediction
4. **Hotspots Card**: Lists detected hotspots
5. **Recommendations Card**: Shows AI suggestions
6. **Pie Chart**: Breaks down emissions by source
7. **Bar Chart**: Compares suppliers
8. **Heatmap**: Shows emission patterns

---

## Update Frequencies

### Real-Time (Immediate)
- **Dashboard queries**: Every page load
- **WebSocket notifications**: Instant when hotspot detected
- **Chatbot queries**: Every question asked

### Scheduled (Automatic)
- **Hotspot detection**: Every 30 minutes
- **Baseline recalculation**: Every 1 hour
- **Forecast update**: When new data uploaded

### Manual (User-Triggered)
- **CSV upload**: When user uploads file
- **Simulation**: When user clicks "Run Simulation"
- **Recommendation approval**: When user clicks approve/reject

---

## 7-Day Forecast Explained

### What It Represents:
The forecast shows **predicted total CO₂ emissions** for the next 7 days based on:
- Historical patterns
- Current trends
- Seasonal variations
- Known events

### How It Updates:
1. **Initial**: Generated when you first upload data
2. **Continuous**: Updates as new data comes in
3. **ML-Powered**: Uses machine learning to improve accuracy

### What You See:
- **Blue line**: Predicted emissions
- **Shaded area**: Confidence interval (uncertainty)
- **Dots**: Daily predictions
- **Hover**: Exact values and dates

### Example Interpretation:
```
Today: 455 kg CO₂
Tomorrow: 462 kg CO₂ (+7 kg, +1.5%)
→ Emissions trending upward
→ May need intervention
```

---

## Data Transformations

### CSV → Database
```
Raw CSV data
↓ Validation (check schema)
↓ Normalization (standardize format)
↓ Outlier detection (flag anomalies)
↓ Gap filling (handle missing values)
↓ Storage (events_normalized table)
```

### Events → CO₂ Predictions
```
Event data (distance, load, vehicle)
↓ ML Model (trained on emission factors)
↓ CO₂ calculation
↓ Prediction storage
```

### Predictions → Hotspots
```
CO₂ predictions by supplier
↓ Aggregation (group by supplier)
↓ Baseline comparison
↓ Threshold check (>20%, >50%)
↓ Hotspot creation
```

### Hotspots → Recommendations
```
Hotspot details
↓ AI analysis (Google Gemini)
↓ Strategy generation
↓ Feasibility scoring
↓ Recommendation storage
```

### All Data → Dashboard
```
Database queries
↓ API responses
↓ Frontend processing
↓ Chart rendering
↓ User sees visualizations
```

---

## Why This CSV File?

### Purpose:
1. **Testing**: Validate the entire pipeline
2. **Demo**: Show different scenarios
3. **Training**: Help users understand the system
4. **Baseline**: Establish normal vs. abnormal patterns

### Design:
- **Variety**: Different suppliers with different patterns
- **Realism**: Based on actual logistics data
- **Scenarios**: Covers normal, warning, and critical cases
- **Completeness**: All required fields present

### What It Proves:
✅ Data ingestion works
✅ ML predictions work
✅ Hotspot detection works
✅ AI recommendations work
✅ Dashboard displays work
✅ End-to-end flow works

---

## Summary

### The Journey:
```
CSV File (25 events)
    ↓
Database (events_normalized)
    ↓
ML Engine (CO₂ predictions)
    ↓
Hotspot Engine (detects anomalies)
    ↓
RAG Service (AI recommendations)
    ↓
Dashboard (visualizations)
    ↓
User (insights & actions)
```

### Update Schedule:
- **Hotspots**: Every 30 minutes
- **Baselines**: Every 1 hour
- **Forecast**: When data changes
- **Dashboard**: Real-time queries

### Data Sources:
- **Primary**: CSV uploads (your data)
- **Calculated**: ML predictions
- **Detected**: Hotspots (automated)
- **Generated**: AI recommendations

**Everything you see on the dashboard comes from that CSV file + ML/AI processing!** 🎯
