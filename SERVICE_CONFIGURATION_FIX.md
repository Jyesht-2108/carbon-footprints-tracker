# Service Configuration Fix Summary

## Issues Resolved

### 1. ✅ Port Configuration Corrections
**Problem**: Services were configured with incorrect ports causing 404 errors and connection failures.

**Solution**: Updated all service ports to correct values:
- **ML Engine**: Port 8001 (was incorrectly set to 8003)
- **Data Core**: Port 8002 (correct)
- **Orchestration Engine**: Port 8003 (was incorrectly set to 8000)

### 2. ✅ Analysis Trigger 404 Error
**Problem**: Data Core was calling `http://localhost:8000/trigger-analysis` but Orchestration Engine runs on 8003.

**Solution**: Updated `ORCHESTRATION_ENGINE_URL` in data-core/.env to `http://localhost:8003`

### 3. ✅ WebSocket 403 Forbidden Error
**Problem**: WebSocket connections were being rejected with 403 Forbidden due to `always_connect=False` setting.

**Solution**: Changed `always_connect=True` in websocket_manager.py to accept all connections.

### 4. ✅ Frontend API URL
**Problem**: Frontend was pointing to wrong orchestration engine URL.

**Solution**: Updated `VITE_API_URL` in frontend-ui/.env to `http://localhost:8003`

## Configuration Files Updated

### 1. `plugins/ml-engine/.env`
```properties
PORT=8001  # Changed from 8003
```

### 2. `plugins/data-core/.env`
```properties
ORCHESTRATION_ENGINE_URL=http://localhost:8003  # Added/corrected
```

### 3. `plugins/orchestration-engine/.env`
```properties
ML_ENGINE_URL=http://localhost:8001      # Changed from 8003
DATA_CORE_URL=http://localhost:8002      # Changed from 8001
API_PORT=8003                            # Changed from 8000
```

### 4. `frontend-ui/.env`
```properties
VITE_API_URL=http://localhost:8003  # Changed from 8000
```

### 5. `plugins/orchestration-engine/src/services/websocket_manager.py`
```python
always_connect=True  # Changed from False
```

## Service Architecture (Corrected)

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│                   http://localhost:5173                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP + WebSocket
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Orchestration Engine (FastAPI)                  │
│                   http://localhost:8003                      │
│  • Hotspot Detection    • WebSocket Hub                      │
│  • Recommendations      • Scheduler                          │
└──────┬──────────────────────────────┬───────────────────────┘
       │                              │
       │ HTTP                         │ HTTP
       ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│   ML Engine      │          │   Data Core      │
│  Port: 8001      │          │  Port: 8002      │
│  • Predictions   │          │  • CSV Upload    │
│  • Forecasting   │          │  • Processing    │
└──────────────────┘          └──────────────────┘
```

## Next Steps

1. **Restart all services** for configuration changes to take effect:
   ```bash
   # Stop all services (Ctrl+C in each terminal)
   
   # Restart ML Engine
   cd plugins/ml-engine
   source venv/bin/activate
   python src/main.py
   
   # Restart Data Core
   cd plugins/data-core
   source myvenv/bin/activate
   uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload
   
   # Restart Orchestration Engine
   cd plugins/orchestration-engine
   source venv/bin/activate
   python -m src.main
   
   # Restart Frontend
   cd frontend-ui
   npm run dev
   ```

2. **Test the fixes**:
   - Upload a CSV file
   - Check terminal logs for successful analysis trigger (should see 200 status, not 404)
   - Verify WebSocket connection (should see "connected" message, not 403)
   - Check that predictions are generated in the database

3. **Verify predictions**:
   ```bash
   python3 quick_db_check.py
   ```

## Expected Behavior After Fix

✅ CSV upload triggers immediate analysis (200 OK)
✅ WebSocket connects successfully (no 403 errors)
✅ ML predictions are generated for all event types
✅ Hotspots are detected and displayed in frontend
✅ Real-time notifications work via WebSocket

## Troubleshooting

If issues persist:

1. **Check service ports**:
   ```bash
   lsof -i :8001  # ML Engine
   lsof -i :8002  # Data Core
   lsof -i :8003  # Orchestration Engine
   ```

2. **Check service logs** for any startup errors

3. **Verify database schema** has all required columns:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'events_normalized';
   ```

4. **Test endpoints manually**:
   ```bash
   # Test ML Engine
   curl http://localhost:8001/health
   
   # Test Data Core
   curl http://localhost:8002/health
   
   # Test Orchestration Engine
   curl http://localhost:8003/health
   
   # Test trigger analysis
   curl -X POST http://localhost:8003/trigger-analysis
   ```
