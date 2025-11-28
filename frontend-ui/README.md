# Carbon Nexus Frontend

Modern React dashboard for Carbon Nexus emissions monitoring platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend-ui
npm install
```

### 2. Configure Environment

The `.env` file is already configured with default ports:

```env
VITE_API_URL=http://localhost:8003          # Orchestration Engine
VITE_DATA_CORE_URL=http://localhost:8002    # Data Core
VITE_RAG_URL=http://localhost:4000          # RAG Service
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## 📦 Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Server state management
- **React Router** - Routing
- **Recharts** - Charts
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Framer Motion** - Animations (ready to add)

## 📁 Project Structure

```
frontend-ui/
├── src/
│   ├── components/
│   │   ├── cards/           # Dashboard cards
│   │   ├── charts/          # Chart components
│   │   └── layout/          # Layout components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── lib/                 # Utilities
│   ├── App.tsx
│   └── main.tsx
├── .env                     # Environment variables
└── package.json
```

## 🎯 Features

### Dashboard Page (`/`)
- Real-time emissions monitoring
- 7-day forecast chart
- Critical hotspots list
- Recommendations with approve/reject
- Active alerts summary
- Data quality metrics

### Data Upload Page (`/ingest`)
- Drag & drop file upload
- CSV/XLSX support
- Upload progress tracking
- File validation
- Upload history

### Alerts Page (`/alerts`)
- All system alerts
- Severity filtering
- Timestamp tracking

### Activity Page (`/activity`)
- System activity feed (coming soon)

## 🔌 API Integration

### Orchestration Engine (Port 8003)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/emissions/current` | GET | Current emission rate |
| `/emissions/forecast` | GET | 7-day forecast |
| `/hotspots` | GET | All hotspots |
| `/recommendations` | GET | Recommendations |
| `/recommendations/{id}/approve` | POST | Approve recommendation |
| `/recommendations/{id}/reject` | POST | Reject recommendation |
| `/alerts` | GET | All alerts |
| `/data-quality` | GET | Data quality metrics |

### Data Core (Port 8002)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/ingest/csv` | POST | Upload CSV file |
| `/api/v1/ingest/status/{jobId}` | GET | Check upload status |

## 🧪 Testing the Complete Flow

### 1. Start All Backend Services

```bash
# Terminal 1: Data Core
cd plugins/data-core
python -m src.main

# Terminal 2: ML Engine  
cd plugins/ml-engine
python -m src.main

# Terminal 3: Orchestration Engine
cd plugins/orchestration-engine
python -m src.main

# Terminal 4: Frontend
cd frontend-ui
npm run dev
```

### 2. Upload Test Data

1. Open http://localhost:3000
2. Go to "Data Upload" page
3. Upload `test_data_hotspot_scenarios.csv`
4. Wait for success message

### 3. View Results

Wait 5 minutes for the scheduler OR trigger manually:

```bash
curl -X POST http://localhost:8003/hotspots/scan
```

Then check the dashboard for:
- Updated emissions
- Detected hotspots
- Generated recommendations
- New alerts

## 🎨 Customization

### Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#0EA5A0',  // Teal
      danger: '#ef4444',   // Red
      warning: '#f59e0b',  // Orange
      success: '#10b981',  // Green
    },
  },
}
```

### API URLs

Edit `.env` to point to different backend URLs.

## 🐛 Troubleshooting

### CORS Errors
- Verify all backend services have CORS enabled
- Check API URLs in `.env`
- Try hard refresh (Ctrl+Shift+R)

### No Data on Dashboard
- Check backend services are running
- Verify API endpoints return data
- Check browser console for errors
- Wait for scheduler or trigger manually

### Upload Fails
- Check Data Core is running: `curl http://localhost:8002/api/v1/health`
- Verify file format (CSV or XLSX)
- Check file size (max 50MB)
- Ensure required columns are present

## 📚 Next Steps

### Enhancements to Add

1. **WebSocket Integration** - Real-time updates
2. **Dark Mode** - Theme toggle
3. **Animations** - Framer Motion transitions
4. **Heatmap** - Interactive map with Mapbox
5. **What-If Simulator** - Modal for simulations
6. **RAG Chatbot** - Document Q&A interface

### Adding WebSocket

```typescript
// src/services/websocket.ts
import { io } from 'socket.io-client'

const socket = io('http://localhost:8003')

socket.on('hotspots', (data) => {
  // Update React Query cache
  queryClient.setQueryData(['hotspots'], data)
})
```

## ✅ Verification Checklist

- [x] React + TypeScript setup
- [x] TailwindCSS configured
- [x] React Query integrated
- [x] API services created
- [x] Dashboard page with cards
- [x] Forecast chart
- [x] Hotspots list
- [x] Recommendations with actions
- [x] File upload page
- [x] Alerts page
- [x] Responsive layout
- [x] Error handling

## 🎉 You're Ready!

The frontend is fully functional and connected to all backend services. Start uploading data and monitoring your emissions!

---

**Built with ❤️ for Carbon Nexus**
