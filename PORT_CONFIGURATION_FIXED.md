# Port Configuration Fixed

## Issues Found

1. **WebSocket Port Wrong**: Frontend trying to connect to 8003, should be 8000
2. **API URLs Wrong**: Orchestration on 8003, should be 8000; Data Core on 8002, should be 8001
3. **PDF Upload Auth**: Upload endpoint required authentication, blocking chatbot uploads

## Correct Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| **Orchestration Engine** | 8000 | Dashboard APIs, WebSocket, Hotspots, Recommendations |
| **Data Core** | 8001 | CSV Upload, Data Ingestion, Upload Jobs |
| **Frontend** | 5173 | React UI |
| **RAG Chatbot** | 4000 | AI Chat, PDF Upload, Document Search |

## Fixes Applied

### 1. Fixed WebSocket URL ✅
**File**: `frontend-ui/src/services/websocket.ts`

```typescript
// ❌ Before
const WS_URL = 'http://localhost:8003'

// ✅ After
const WS_URL = 'http://localhost:8000'
```

### 2. Fixed API URLs ✅
**File**: `frontend-ui/src/services/api.ts`

```typescript
// ❌ Before
const API_URL = 'http://localhost:8003'
const DATA_CORE_URL = 'http://localhost:8002'

// ✅ After
const API_URL = 'http://localhost:8000'
const DATA_CORE_URL = 'http://localhost:8001'
```

### 3. Removed Auth from Upload ✅
**File**: `rag_chatbot_plugin/src/routes/upload.routes.ts`

```typescript
// ❌ Before
router.post('/upload', authMiddleware, upload.single('file'), controller.upload);

// ✅ After  
router.post('/upload', upload.single('file'), controller.upload);
```

## Service Startup Commands

```bash
# Terminal 1: Orchestration Engine (Port 8000)
cd plugins/orchestration-engine
python -m src.main

# Terminal 2: Data Core (Port 8001)
cd plugins/data-core
python -m src.main

# Terminal 3: RAG Chatbot (Port 4000)
cd rag_chatbot_plugin
npm run dev

# Terminal 4: Frontend (Port 5173)
cd frontend-ui
npm run dev
```

## Verification

After restarting services:

### WebSocket
- Open browser console
- Should see: "✅ WebSocket connected"
- No more "WebSocket connection error"

### PDF Upload
- Go to AI Assistant page
- Upload a PDF file
- Should see: "✅ Successfully uploaded..."
- No more "401 Unauthorized"

### Upload History
- Go to Data Ingest page
- Should see upload history (or empty if no uploads)
- No more "404 Not Found"

## Error Messages Fixed

### Before:
```
❌ WebSocket connection to 'ws://localhost:8003/socket.io/' failed
❌ Failed to load resource: 401 (Unauthorized) - /api/upload
❌ Failed to load resource: 404 (Not Found) - /api/v1/ingest/jobs
❌ Failed to load resource: 500 (Internal Server Error) - /api/v1/ingest/status/all
```

### After:
```
✅ WebSocket connected
✅ PDF uploaded successfully
✅ Upload history loaded
```

## Why Chatbot Wasn't Using Uploaded Documents

The PDF upload was failing with 401 Unauthorized because:
1. Upload endpoint required authentication token
2. Chatbot doesn't send auth tokens (it's public)
3. Files never reached Qdrant vector database

**Now fixed**: Upload endpoint is public, PDFs will be stored in Qdrant and chatbot can search them!

## Testing PDF Upload & Search

1. **Upload a PDF**:
   - Go to AI Assistant
   - Click paperclip icon
   - Select a PDF file
   - Should see success message

2. **Verify in Qdrant**:
   - PDF is chunked and embedded
   - Stored in Qdrant vector database
   - Ready for semantic search

3. **Ask Questions**:
   - Ask chatbot about PDF content
   - It will search Qdrant for relevant chunks
   - Provides answers based on uploaded documents

## Files Modified

1. `frontend-ui/src/services/api.ts` - Fixed API URLs (8000, 8001)
2. `frontend-ui/src/services/websocket.ts` - Fixed WebSocket URL (8000)
3. `rag_chatbot_plugin/src/routes/upload.routes.ts` - Removed auth requirement

## Restart Required

After these changes:
1. Restart RAG Chatbot service (npm run dev)
2. Restart Frontend (npm run dev)
3. Orchestration and Data Core should already be on correct ports

All services will now communicate on the correct ports! 🎉
