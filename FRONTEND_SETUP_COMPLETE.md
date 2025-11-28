# Frontend Setup Complete ✅

## 🔧 Changes Made

### 1. Updated API URLs

**File:** `frontend-ui/.env`
```env
VITE_API_URL=http://localhost:8003          # Orchestration Engine (was 8000)
VITE_WS_URL=ws://localhost:8003/ws          # WebSocket (was 8000)
VITE_DATA_CORE_URL=http://localhost:8002    # Data Core for uploads (NEW)
```

### 2. Updated API Service

**File:** `frontend-ui/src/services/api.ts`

Added two API clients:
- `api` - Orchestration Engine (port 8003) for dashboard data
- `dataCoreApi` - Data Core (port 8002) for CSV uploads

Added upload API:
```typescript
export const uploadApi = {
  uploadCSV: (file: File) => {...},
  getJobStatus: (jobId: string) => {...}
}
```

### 3. Updated Upload Component

**File:** `frontend-ui/src/components/upload/FileUploadCard.tsx`

Now uploads directly to Data Core:
```typescript
const DATA_CORE_URL = import.meta.env.VITE_DATA_CORE_URL || 'http://localhost:8002';
const response = await axios.post(`${DATA_CORE_URL}/api/v1/ingest/csv`, formData, {...});
```

---

## 🚀 How to Start Frontend

### Step 1: Install Dependencies (if not done)
```bash
cd frontend-ui
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Step 3: Open in Browser
```
http://localhost:3000
```

---

## 📊 Frontend Features Now Connected

### Dashboard Page
- ✅ Current emissions from `/emissions/current`
- ✅ 7-day forecast from `/emissions/forecast`
- ✅ Hotspots from `/hotspots`
- ✅ Recommendations from `/recommendations`
- ✅ Alerts from `/alerts`

### Upload Page (IngestPage)
- ✅ CSV/XLSX file upload
- ✅ Drag & drop support
- ✅ Upload progress indicator
- ✅ Upload history
- ✅ Connects to Data Core (port 8002)

### Activity Page
- ✅ View all activities
- ✅ Filter by type

### Chatbot Page
- ✅ RAG chatbot integration (if configured)

### Settings Page
- ✅ System settings

---

## 🧪 Test the Upload Flow

### 1. Start All Services

```bash
# Terminal 1: Data Core
cd plugins/data-core
python -m src.main

# Terminal 2: ML Engine
cd plugins/ml-engine
python -m src.main

# Terminal 3: RAG Chatbot
cd rag_chatbot_plugin
npm run dev

# Terminal 4: Orchestration Engine
cd plugins/orchestration-engine
python -m src.main

# Terminal 5: Frontend
cd frontend-ui
npm run dev
```

### 2. Upload Test Data

1. Open http://localhost:3000
2. Go to "Data Upload" page
3. Drag & drop `test_data_hotspot_scenarios.csv`
4. Click "Upload"
5. Wait for success message

### 3. Check Results

**Wait 5 minutes for scheduler OR trigger manually:**
```bash
curl -X POST http://localhost:8003/hotspots/scan
```

**Then check dashboard:**
1. Go to Dashboard page
2. See hotspots on heatmap
3. View recommendations
4. Check alerts

---

## 🔌 API Endpoints Used by Frontend

### Orchestration Engine (Port 8003)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/emissions/current` | GET | Current emission rate |
| `/emissions/forecast` | GET | 7-day forecast |
| `/hotspots` | GET | All hotspots |
| `/hotspots/top` | GET | Top hotspots |
| `/recommendations` | GET | All recommendations |
| `/recommendations/{id}/approve` | POST | Approve recommendation |
| `/recommendations/{id}/reject` | POST | Reject recommendation |
| `/alerts` | GET | All alerts |
| `/simulate` | POST | What-if simulation |

### Data Core (Port 8002)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/ingest/csv` | POST | Upload CSV file |
| `/api/v1/ingest/status/{jobId}` | GET | Check upload status |

---

## 📝 Environment Variables

### Required
```env
VITE_API_URL=http://localhost:8003          # Orchestration Engine
VITE_DATA_CORE_URL=http://localhost:8002    # Data Core
```

### Optional
```env
VITE_WS_URL=ws://localhost:8003/ws          # WebSocket (future)
VITE_MAPBOX_TOKEN=                          # Mapbox for maps (optional)
```

---

## 🎯 Complete Upload Flow

```
1. User uploads CSV in Frontend
   ↓
2. Frontend → Data Core (port 8002)
   POST /api/v1/ingest/csv
   ↓
3. Data Core processes:
   - Validates data
   - Normalizes values
   - Inserts into events_normalized
   ↓
4. Orchestration Scheduler (5 min)
   - Fetches new events
   - Calls ML Engine for predictions
   - Detects hotspots
   - Generates alerts
   - Creates recommendations
   ↓
5. Frontend Dashboard refreshes
   - Shows hotspots
   - Displays recommendations
   - Shows alerts
```

---

## 🐛 Troubleshooting

### Upload Fails
- Check Data Core is running: `curl http://localhost:8002/api/v1/health`
- Check browser console for errors
- Verify file format (CSV or XLSX)
- Check file size (max 50MB)

### No Data on Dashboard
- Check Orchestration Engine: `curl http://localhost:8003/health`
- Wait for scheduler (5 min) OR trigger: `curl -X POST http://localhost:8003/hotspots/scan`
- Check browser console for API errors

### CORS Errors
- Verify all services have CORS enabled
- Check API URLs in `.env` are correct
- Try hard refresh (Ctrl+Shift+R)

---

## ✅ Verification Checklist

- [x] Frontend `.env` updated with correct ports
- [x] API service updated with two clients
- [x] Upload component connects to Data Core
- [x] All API endpoints match orchestration
- [x] Test data files created
- [x] Documentation complete

---

## 🎉 You're Ready!

The frontend is now fully connected to:
- ✅ Orchestration Engine (port 8003) - Dashboard data
- ✅ Data Core (port 8002) - CSV uploads
- ✅ All backend services integrated

**Start the frontend and upload your test data!** 🚀

---

## 📚 Next Steps

1. Start all services (5 terminals)
2. Open frontend: http://localhost:3000
3. Upload `test_data_hotspot_scenarios.csv`
4. Wait 5 minutes OR trigger scan
5. View results on dashboard

**Everything is connected end-to-end!** 🎊
