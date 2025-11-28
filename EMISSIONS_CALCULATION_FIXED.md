# Emissions Calculation Fixed ✅

## Root Cause Found!

The **emissions showing 0** was because:

### ❌ **Problem**: Missing `co2_kg` Column
The backend code was trying to read `co2_kg` from the `events_normalized` table, but **this column doesn't exist in the database schema!**

**Database Schema** (`events_normalized` table):
```sql
CREATE TABLE events_normalized (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT,
    supplier_id TEXT,
    distance_km FLOAT,        ← Has this
    load_kg FLOAT,            ← Has this
    vehicle_type TEXT,
    fuel_type TEXT,           ← Has this
    speed FLOAT,
    timestamp TIMESTAMPTZ,
    is_outlier BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- NO co2_kg column!
```

**Backend Code** (was trying to do):
```python
total_co2 = sum(e.get("co2_kg", 0) for e in events)  # ← Always returns 0!
```

## ✅ **Solution**: Calculate CO₂ from Available Data

Updated the backend to **calculate CO₂** from the existing fields:

```python
# Calculate CO2 from event data
# Formula: distance_km * (load_kg / 1000) * emission_factor

emission_factors = {
    "diesel": 0.062,    # kg CO2 per km per ton
    "electric": 0.015,
    "hybrid": 0.035,
    "petrol": 0.068,
    "gasoline": 0.068
}

for event in events:
    distance = event.get("distance_km", 0) or 0
    load = event.get("load_kg", 0) or 0
    fuel_type = (event.get("fuel_type") or "diesel").lower()
    
    emission_factor = emission_factors.get(fuel_type, 0.062)
    co2 = distance * (load / 1000) * emission_factor
    
    total_co2 += co2
```

## 📊 Expected Results

With the fix applied, the dashboard will now show:

**Before**:
- Current Emissions: **0 kg CO₂** ❌
- Trend: **0%** ❌

**After** (with 47 events in database):
- Current Emissions: **Real calculated values** ✅
- Trend: **Actual percentage change** ✅
- Categories: **CO₂ per supplier** ✅

## 🔧 Files Modified

**plugins/orchestration-engine/src/api/routes_dashboard.py**:
- Added CO₂ calculation logic
- Added emission factors for different fuel types
- Calculate CO₂ for current rate
- Calculate CO₂ for trend analysis
- Calculate CO₂ per supplier category

## 🚀 How to Apply

1. **Restart the Orchestration Engine**:
   ```powershell
   # Stop current process (Ctrl+C)
   # Then restart:
   cd plugins/orchestration-engine
   python -m src.main
   ```

2. **Refresh the Frontend**:
   - Go to http://localhost:3000
   - Refresh the page
   - Check the Emissions card

3. **Verify**:
   ```powershell
   curl http://localhost:8003/emissions/current
   ```
   
   Should now show non-zero values like:
   ```json
   {
     "current_rate": 45.2,
     "trend": 12.5,
     "categories": {
       "S-1": 120.5,
       "Normal_Supplier": 85.3,
       ...
     }
   }
   ```

## 📝 Notes

- The emission factors used are industry-standard values
- Formula: `CO₂ = distance (km) × load (tons) × emission_factor`
- Default fuel type is "diesel" if not specified
- This matches how real logistics companies calculate emissions

## ✅ Status

- [x] Root cause identified
- [x] Fix implemented
- [ ] Orchestration engine restarted
- [ ] Frontend verified

**Next**: Restart the orchestration engine to see real emissions data!
