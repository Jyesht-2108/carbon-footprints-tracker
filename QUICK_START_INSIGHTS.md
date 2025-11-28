# Quick Start Guide: AI Insights & Recommendations

## 🚀 Get Started in 5 Minutes

### Step 1: Start the ML Engine (Backend)

```bash
cd carbon-footprint/plugins/ml-engine
source myvenv/bin/activate
python -m src.app
```

✅ ML Engine running on `http://localhost:8001`

### Step 2: Start the Frontend

```bash
cd carbon-footprint/frontend-ui
npm run dev
```

✅ Frontend running on `http://localhost:5173`

### Step 3: Add Insights Page to Your App

Update your `frontend-ui/src/App.tsx`:

```typescript
import InsightsPage from './pages/InsightsPage';

// In your routes:
<Route path="/insights" element={<InsightsPage />} />
```

### Step 4: Navigate to Insights

Open your browser and go to:
```
http://localhost:5173/insights
```

## 🎯 What You'll See

### Tab 1: Insights
- Emission hotspots
- Trend analysis
- Opportunities for improvement
- Warnings and achievements

### Tab 2: Recommendations
- Personalized reduction strategies
- ROI calculations
- Implementation steps
- Cost estimates

### Tab 3: Forecast
- Future emissions predictions
- Trend indicators
- Confidence intervals
- Planning insights

### Tab 4: Anomalies
- Unusual emission patterns
- Severity classifications
- Real-time alerts
- Investigation recommendations

## 🧪 Test the APIs

### Generate Insights
```bash
curl -X POST http://localhost:8001/api/v1/insights/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Get Forecast
```bash
curl -X POST http://localhost:8001/api/v1/ml/forecast \
  -H "Content-Type: application/json" \
  -d '{"periods": 30, "frequency": "D"}'
```

### Detect Anomalies
```bash
curl -X POST http://localhost:8001/api/v1/ml/anomalies/detect \
  -H "Content-Type: application/json" \
  -d '{"realtime": false}'
```

### Get Recommendations
```bash
curl -X POST http://localhost:8001/api/v1/ml/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{"limit": 5}'
```

### Complete Analysis (All at Once)
```bash
curl http://localhost:8001/api/v1/ml/analysis/complete
```

## 📊 Sample Response

### Insights Response:
```json
{
  "insights": [
    {
      "id": "warning_transport_123",
      "type": "warning",
      "title": "High Concentration: Transportation",
      "description": "Transportation accounts for 65% of total emissions",
      "impact": "high",
      "category": "transport",
      "recommendation": "Focus reduction efforts on Transportation for maximum impact",
      "estimatedReduction": 2500,
      "priority": 9
    }
  ],
  "recommendations": [...],
  "summary": {...}
}
```

## 🎨 Customize

### Change Forecast Period
In `ForecastChart.tsx`:
```typescript
const [periods, setPeriods] = useState(30); // Change default
```

### Adjust Anomaly Sensitivity
In `anomaly_detection.py`:
```python
contamination=0.1  # 10% expected anomalies (adjust as needed)
```

### Add Custom Recommendations
Edit `recommendation_engine.py` and add to `_create_default_recommendations()`.

## 🔧 Troubleshooting

### ML Engine Not Starting
```bash
# Check if port 8001 is in use
lsof -i :8001

# Install missing dependencies
pip install -r requirements.txt
```

### Frontend Not Connecting
- Ensure ML Engine is running on port 8001
- Check CORS settings in `ml-engine/src/app.py`
- Verify API URLs in frontend components

### No Data Showing
- The system uses mock data by default
- Upload real emissions data via the dashboard
- Or connect to data-core service

## 📚 Learn More

- **Full Documentation**: See `IMPLEMENTATION_COMPLETE.md`
- **ML Models Details**: See `ML_MODELS_AND_INSIGHTS_IMPLEMENTATION.md`
- **API Reference**: Visit `http://localhost:8001/docs` (FastAPI auto-docs)

## 💡 Pro Tips

1. **Train Models with Real Data**: Once you have emissions data, train the models for better accuracy
2. **Set Up Alerts**: Configure email/SMS alerts for critical anomalies
3. **Track Actions**: Implement a system to track which recommendations are implemented
4. **Measure Impact**: Compare predicted vs actual emission reductions

## 🎉 You're All Set!

Your AI-powered sustainability insights platform is now running. Start exploring the insights and implementing recommendations to reduce your environmental impact!
