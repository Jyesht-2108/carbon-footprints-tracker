# Test Data Upload Guide

## 📊 Test Data Files Created

I've created 3 CSV files with different test scenarios:

### 1. `test_data_emissions.csv` (25 rows)
**Purpose:** Basic emissions data with 5 different suppliers

**Suppliers:**
- **Supplier_A** - Diesel trucks, medium distance (120-200 km)
- **Supplier_B** - EV trucks, short distance (80-95 km) - LOW EMISSIONS
- **Supplier_C** - Diesel trucks, long distance (250-350 km) - HIGH EMISSIONS
- **Supplier_D** - Diesel vans, medium distance (100-115 km)
- **Supplier_E** - Two-wheelers, short distance (60-70 km) - VERY LOW EMISSIONS

**Expected Results:**
- Supplier_B (EV) should have lowest emissions
- Supplier_C should trigger HOTSPOT (high distance + heavy load)
- Supplier_E should be most efficient per km

---

### 2. `test_data_hotspot_scenarios.csv` (25 rows)
**Purpose:** Specifically designed to test hotspot detection at all severity levels

**Suppliers:**
- **Normal_Supplier** - Baseline normal operations (100 km, 400 kg)
- **Hotspot_INFO** - 80% above baseline (180 km, 700 kg) → INFO alert
- **Hotspot_WARN** - 100% above baseline (250 km, 900 kg) → WARN alert
- **Hotspot_CRITICAL** - 150%+ above baseline (400+ km, 1200+ kg) → CRITICAL alert
- **EV_Efficient** - Electric vehicle, efficient operations
- **Mixed_Fleet_A** - Mix of diesel and EV
- **Heavy_Load_Supplier** - Very heavy loads (1500+ kg) → CRITICAL alert

**Expected Results:**
- Normal_Supplier: No hotspot
- Hotspot_INFO: INFO severity hotspot
- Hotspot_WARN: WARN severity hotspot
- Hotspot_CRITICAL: CRITICAL severity hotspot + alert + recommendations
- Heavy_Load_Supplier: CRITICAL hotspot

---

### 3. `test_data_realistic.csv` (30 rows)
**Purpose:** Realistic data mimicking real logistics companies

**Companies:**
- **Amazon_Logistics** - Short-distance van deliveries
- **FedEx_Express** - Medium-distance express deliveries
- **DHL_International** - Long-distance heavy freight
- **UPS_Ground** - Standard ground shipping
- **Local_Delivery_Co** - Two-wheeler last-mile delivery
- **GreenFleet_EV** - Electric vehicle fleet

**Expected Results:**
- DHL_International should have highest emissions (long distance + heavy)
- Local_Delivery_Co should be most efficient
- GreenFleet_EV should have low emissions
- FedEx_Express might trigger hotspot (high speed + distance)

---

## 🚀 How to Upload

### Option 1: Using curl (Command Line)

```bash
# Upload basic emissions data
curl -X POST http://localhost:8002/api/v1/ingest/csv \
  -F "file=@test_data_emissions.csv"

# Upload hotspot scenarios
curl -X POST http://localhost:8002/api/v1/ingest/csv \
  -F "file=@test_data_hotspot_scenarios.csv"

# Upload realistic data
curl -X POST http://localhost:8002/api/v1/ingest/csv \
  -F "file=@test_data_realistic.csv"
```

### Option 2: Using Python Script

```python
import requests

files = [
    'test_data_emissions.csv',
    'test_data_hotspot_scenarios.csv',
    'test_data_realistic.csv'
]

for file in files:
    with open(file, 'rb') as f:
        response = requests.post(
            'http://localhost:8002/api/v1/ingest/csv',
            files={'file': f}
        )
        print(f"Uploaded {file}: {response.status_code}")
        print(response.json())
```

### Option 3: Using Postman

1. Open Postman
2. Create new POST request
3. URL: `http://localhost:8002/api/v1/ingest/csv`
4. Body → form-data
5. Key: `file` (type: File)
6. Value: Select CSV file
7. Send

---

## 🧪 Testing the Complete Flow

### Step 1: Upload Data
```bash
curl -X POST http://localhost:8002/api/v1/ingest/csv \
  -F "file=@test_data_hotspot_scenarios.csv"
```

### Step 2: Wait for Processing
Data Core will:
- Validate data
- Normalize values
- Insert into `events_normalized`

### Step 3: Trigger Hotspot Scan (or wait 5 min)
```bash
curl -X POST http://localhost:8003/hotspots/scan
```

### Step 4: Check Results

**Check Predictions:**
```bash
# Via Supabase: Check predictions table
# Should have 25+ rows
```

**Check Hotspots:**
```bash
curl http://localhost:8003/hotspots
```

Expected hotspots:
- Hotspot_INFO (severity: info)
- Hotspot_WARN (severity: warn)
- Hotspot_CRITICAL (severity: critical)
- Heavy_Load_Supplier (severity: critical)

**Check Alerts:**
```bash
curl http://localhost:8003/alerts
```

Expected: 2-4 alerts for critical/warn hotspots

**Check Recommendations:**
```bash
curl http://localhost:8003/recommendations
```

Expected: AI-generated recommendations for each hotspot

---

## 📊 Expected Database State After Upload

### events_normalized
- 25 rows from hotspot scenarios
- All normalized and validated

### predictions
- 25 rows with ML predictions
- CO2 values ranging from ~5 kg (EV) to ~80+ kg (heavy diesel)

### baselines
- 7 baselines created (one per supplier)
- Values based on historical average

### hotspots
- 4-5 hotspots detected:
  - Hotspot_INFO (info)
  - Hotspot_WARN (warn)
  - Hotspot_CRITICAL (critical)
  - Heavy_Load_Supplier (critical)

### alerts
- 2-4 alerts for warn/critical hotspots

### recommendations
- 2-4 AI recommendations from RAG service

---

## 🎯 What to Look For

### In Orchestration Logs:
```
INFO: Hotspot detected: Hotspot_CRITICAL (critical) - 150.5% above baseline
INFO: Alert generated for hotspot 1
INFO: Recommendations generated for hotspot 1
```

### In Supabase:
- Check each table has data
- Verify hotspot severity levels
- Check recommendation quality

### In Frontend (after fixing port):
- Hotspots displayed on heatmap
- Alerts in notification panel
- Recommendation cards with actions
- Emission trends in charts

---

## 🐛 Troubleshooting

### No Predictions Created
- Check ML Engine is running: `curl http://localhost:8001/api/v1/health`
- Check orchestration logs for errors
- Verify API path is `/api/v1/predict/logistics`

### No Hotspots Detected
- Check if baselines exist in database
- Verify threshold settings in orchestration .env
- Check if predictions are high enough to trigger

### No Recommendations
- Check RAG service is running: `curl http://localhost:4000/health`
- Verify hotspots were created first
- Check orchestration logs for RAG errors

---

## 📈 Advanced Testing

### Test Different Scenarios

**Low Emissions (Should NOT trigger hotspot):**
```csv
supplier_id,timestamp,distance_km,load_kg,vehicle_type,fuel_type,speed
Efficient_Co,2025-11-28 08:00:00,50,200,truck_ev,electric,70
```

**High Emissions (Should trigger CRITICAL):**
```csv
supplier_id,timestamp,distance_km,load_kg,vehicle_type,fuel_type,speed
Polluter_Co,2025-11-28 08:00:00,500,1500,truck_diesel,diesel,40
```

**Mixed Fleet:**
```csv
supplier_id,timestamp,distance_km,load_kg,vehicle_type,fuel_type,speed
Mixed_Co,2025-11-28 08:00:00,100,400,truck_diesel,diesel,60
Mixed_Co,2025-11-28 09:00:00,100,400,truck_ev,electric,60
```

---

## ✅ Success Criteria

After uploading test data, you should see:

- ✅ Data in `events_normalized` table
- ✅ Predictions in `predictions` table
- ✅ Hotspots in `hotspots` table (for high emitters)
- ✅ Alerts in `alerts` table
- ✅ Recommendations in `recommendations` table
- ✅ Baselines in `baselines` table
- ✅ Audit logs in `audit_logs` table (for actions)

---

## 🚀 Quick Test Command

Upload all test data at once:

```bash
# Upload all files
for file in test_data_*.csv; do
  echo "Uploading $file..."
  curl -X POST http://localhost:8002/api/v1/ingest/csv -F "file=@$file"
  echo ""
done

# Wait 10 seconds
sleep 10

# Trigger hotspot scan
curl -X POST http://localhost:8003/hotspots/scan

# Check results
echo "Hotspots:"
curl http://localhost:8003/hotspots

echo "Alerts:"
curl http://localhost:8003/alerts

echo "Recommendations:"
curl http://localhost:8003/recommendations
```

---

**Ready to test!** 🎉

Upload the data and watch the complete system work end-to-end!
