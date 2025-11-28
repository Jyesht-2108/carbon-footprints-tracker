# Frontend Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Backend services running (Data Core, ML Engine, Orchestration Engine)

## Installation Steps

### 1. Install Dependencies

```bash
cd frontend-ui
npm install
```

This will install:
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Query (data fetching)
- React Router (routing)
- Recharts (charts)
- Axios (HTTP client)
- Lucide React (icons)

### 2. Verify Environment Variables

Check `.env` file:

```env
VITE_API_URL=http://localhost:8003          # Orchestration Engine
VITE_DATA_CORE_URL=http://localhost:8002    # Data Core  
VITE_RAG_URL=http://localhost:4000          # RAG Service
```

### 3. Start Development Server

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 4. Open in Browser

Navigate to: **http://localhost:3000**

You should see the Carbon Nexus dashboard!

## Verify Backend Connections

### Check Orchestration Engine
```bash
curl http://localhost:8003/health
```

Expected: `{"status":"healthy"}`

### Check Data Core
```bash
curl http://localhost:8002/api/v1/health
```

Expected: `{"status":"healthy"}`

## Test the Complete Flow

### 1. Upload Test Data

1. Go to http://localhost:3000/ingest
2. Drag & drop `test_data_hotspot_scenarios.csv`
3. Click "Upload"
4. Wait for success message

### 2. Trigger Hotspot Detection

```bash
curl -X POST http://localhost:8003/hotspots/scan
```

### 3. View Results

1. Go to http://localhost:3000 (Dashboard)
2. You should see:
   - Updated emissions metrics
   - Detected hotspots
   - Generated recommendations
   - New alerts

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Troubleshooting

### Port 3000 Already in Use

Change the port in `vite.config.ts`:

```typescript
server: {
  port: 3001,  // Change to any available port
  host: true,
}
```

### Module Not Found Errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Ensure backend services have CORS enabled. Check backend logs for CORS-related errors.

### API Connection Errors

1. Verify backend services are running
2. Check `.env` URLs are correct
3. Test endpoints with curl
4. Check browser console for detailed errors

## Development Tips

### Hot Reload

Vite provides instant hot module replacement. Changes to React components will reflect immediately without full page reload.

### TypeScript Errors

Run type checking:
```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Next Steps

1. ✅ Frontend is running
2. ✅ Connected to backends
3. ✅ Upload test data
4. ✅ View dashboard

Now you can:
- Customize the UI
- Add more features
- Integrate WebSocket for real-time updates
- Add animations with Framer Motion
- Implement the heatmap with Mapbox

## Support

If you encounter issues:
1. Check backend services are running
2. Verify `.env` configuration
3. Check browser console for errors
4. Review backend logs
5. Test API endpoints with curl

---

**Happy coding! 🚀**
