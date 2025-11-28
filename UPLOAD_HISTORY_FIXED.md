# Upload History Fixed - Real Data Integration

## Issue

The Upload History component was showing **fake/mock data** that never changed:
- "weekly_emissions.csv" stuck at "processing" forever
- Fake timestamps and filenames
- No actual connection to database

## Root Cause

The component was hardcoded with mock data (lines 20-60 in UploadHistory.tsx):

```typescript
// ❌ OLD: Mock data
queryFn: async () => {
  return [
    { filename: 'emissions_data_nov_2025.csv', status: 'completed', ... },
    { filename: 'weekly_emissions.csv', status: 'processing', ... }, // Stuck forever!
  ]
}
```

## Solution

### 1. Added New API Endpoint ✅

**File**: `plugins/data-core/src/api/routes.py`

```python
@router.get("/ingest/jobs")
async def get_all_jobs(limit: int = 20):
    """Get all upload jobs (most recent first)"""
    try:
        jobs = supabase_client.get_all_ingest_jobs(limit)
        return JSONResponse(content=jobs)
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### 2. Added Database Method ✅

**File**: `plugins/data-core/src/db/supabase_client.py`

```python
def get_all_ingest_jobs(self, limit: int = 20) -> List[Dict[str, Any]]:
    """Get all ingest jobs (most recent first)"""
    try:
        result = self.client.table("ingest_jobs") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        return result.data if result.data else []
    except Exception as e:
        logger.error(f"Error fetching all ingest jobs: {e}")
        return []
```

### 3. Updated Frontend API Service ✅

**File**: `frontend-ui/src/services/api.ts`

```typescript
export const uploadApi = {
  uploadCSV: async (file: File) => { ... },
  getJobStatus: (jobId: string) => 
    dataCoreApi.get(`/api/v1/ingest/status/${jobId}`),
  getAllJobs: (limit: number = 20) =>
    dataCoreApi.get(`/api/v1/ingest/jobs?limit=${limit}`), // ✅ NEW
}
```

### 4. Updated Upload History Component ✅

**File**: `frontend-ui/src/components/upload/UploadHistory.tsx`

```typescript
// ✅ NEW: Real data from API
const { data: jobs, isLoading } = useQuery({
  queryKey: ['uploadHistory'],
  queryFn: async () => {
    try {
      const response = await uploadApi.getAllJobs(20)
      return response.data as UploadJob[]
    } catch (error) {
      console.warn('Failed to fetch upload history:', error)
      return []
    }
  },
  refetchInterval: 5000, // Auto-refresh every 5 seconds
})
```

## How It Works Now

### Upload Flow
1. User uploads CSV file
2. Data Core creates job in `ingest_jobs` table with status "received"
3. Processing begins, status updates: "parsing" → "validating" → "normalizing" → "inserting"
4. Progress tracked: `rows_processed` / `rows_total`
5. Final status: "complete" or "failed"

### Display Flow
1. Frontend queries `/api/v1/ingest/jobs` every 5 seconds
2. Gets real jobs from database (most recent first)
3. Shows actual status, progress, and timestamps
4. Auto-updates as jobs progress

## Database Schema

```sql
CREATE TABLE ingest_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_id TEXT UNIQUE,
    status TEXT,                    -- 'received', 'parsing', 'validating', 
                                    -- 'normalizing', 'inserting', 'complete', 'failed'
    filename TEXT,
    rows_total INTEGER,
    rows_processed INTEGER,
    errors JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing

### 1. Restart Data Core
```bash
cd plugins/data-core
python -m src.main
```

### 2. Upload a File
- Go to "Data Ingest" page
- Upload a CSV file
- Watch it appear in Upload History

### 3. Check Real-Time Updates
- Upload History refreshes every 5 seconds
- Status changes: received → parsing → validating → complete
- Progress bar updates in real-time

## Expected Behavior

### Before Fix
- ❌ Shows fake data
- ❌ "Processing" jobs stuck forever
- ❌ No connection to database
- ❌ Can't see real uploads

### After Fix
- ✅ Shows real upload jobs from database
- ✅ Real-time status updates
- ✅ Accurate progress tracking
- ✅ Auto-refreshes every 5 seconds
- ✅ Shows actual timestamps
- ✅ Displays real errors if upload fails

## Example Real Data

```json
{
  "id": 1,
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "filename": "emissions_nov_2025.csv",
  "status": "complete",
  "rows_total": 1500,
  "rows_processed": 1500,
  "errors": null,
  "created_at": "2025-11-28T19:30:00Z",
  "updated_at": "2025-11-28T19:35:00Z"
}
```

## Status Values

| Status | Description |
|--------|-------------|
| `received` | File uploaded, queued for processing |
| `parsing` | Reading and parsing file |
| `validating` | Checking data schema and format |
| `normalizing` | Standardizing data format |
| `inserting` | Writing to database |
| `complete` | Successfully processed |
| `failed` | Error occurred (see errors field) |

## Benefits

✅ **Real Data**: Shows actual uploads from database
✅ **Live Updates**: Auto-refreshes every 5 seconds
✅ **Progress Tracking**: See rows processed in real-time
✅ **Error Visibility**: Failed uploads show error messages
✅ **History**: See all past uploads (last 20)
✅ **Accurate**: No more fake "stuck" jobs

## Files Modified

1. `plugins/data-core/src/api/routes.py` - Added `/ingest/jobs` endpoint
2. `plugins/data-core/src/db/supabase_client.py` - Added `get_all_ingest_jobs()` method
3. `frontend-ui/src/services/api.ts` - Added `getAllJobs()` function
4. `frontend-ui/src/components/upload/UploadHistory.tsx` - Removed mock data, use real API

## Next Steps

After restarting Data Core:
1. Upload a CSV file
2. Watch it appear in Upload History
3. See real-time progress updates
4. Verify status changes from "received" to "complete"

The Upload History now shows **real, live data** from your database! 🎉
