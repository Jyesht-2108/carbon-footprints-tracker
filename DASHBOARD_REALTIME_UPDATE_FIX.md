# Dashboard Real-Time Update Fix

## Issues Fixed

### 1. **Pie Chart Now Groups by Company/Supplier**
- **Before**: Pie chart showed emissions grouped by event type (logistics, warehouse, factory)
- **After**: Pie chart now shows emissions grouped by company/supplier name
- **Change**: Modified `/emissions/current` endpoint to map predictions to suppliers via events

### 2. **Dashboard Auto-Updates on CSV Upload**
- **Before**: Dashboard only refreshed every 30 seconds (polling)
- **After**: Dashboard instantly updates when CSV upload completes and analysis finishes
- **Implementation**:
  - Added WebSocket event `emissions_update` emitted after analysis completes
  - Frontend listens for this event and invalidates all query caches
  - Shows toast notification "Dashboard Updated" when new data arrives

### 3. **Fixed Unrealistic Emission Values**
- **Before**: Heatmap showed 22,087 kg for factory, 12,286 kg for warehouse (sum of 100 predictions)
- **After**: Shows average per event: ~760 kg for factory, ~580 kg for warehouse
- **Change**: Calculate average emissions per supplier instead of total sum

## Technical Changes

### Backend (`orchestration-engine`)

**File: `src/api/routes_dashboard.py`**
```python
# Now groups by supplier and calculates averages
categories_sum = {}
categories_count = {}

for pred in predictions:
    event_id = pred.get("event_id")
    supplier = event_supplier_map.get(event_id, "Unknown")
    categories_sum[supplier] = categories_sum.get(supplier, 0) + co2
    categories_count[supplier] = categories_count.get(supplier, 0) + 1

# Calculate average per supplier (not sum)
categories = {
    supplier: categories_sum[supplier] / categories_count[supplier]
    for supplier in categories_sum
}
```

**File: `src/main.py`**
```python
# Emit WebSocket event after analysis
await ws_manager.emit_emissions_update({
    "status": "analysis_complete",
    "hotspots_detected": len(hotspots),
    "timestamp": datetime.utcnow().isoformat()
})
```

### Frontend (`frontend-ui`)

**File: `src/pages/DashboardPage.tsx`**
```typescript
// Listen for emissions_update WebSocket event
const unsubscribeEmissionsUpdate = subscribe('emissions_update', (data) => {
  // Refetch all dashboard data
  queryClient.invalidateQueries({ queryKey: ['emissions'] })
  queryClient.invalidateQueries({ queryKey: ['hotspots'] })
  queryClient.invalidateQueries({ queryKey: ['recommendations'] })
  queryClient.invalidateQueries({ queryKey: ['alerts'] })
  queryClient.invalidateQueries({ queryKey: ['forecast'] })
  queryClient.invalidateQueries({ queryKey: ['dataQuality'] })
  info('Dashboard Updated', 'New emissions data available', 5000)
})
```

## How It Works Now

1. **User uploads CSV** → Data Core processes it
2. **Data Core triggers analysis** → Orchestration Engine runs predictions
3. **Analysis completes** → WebSocket event `emissions_update` is emitted
4. **Frontend receives event** → All dashboard queries are invalidated and refetched
5. **Dashboard updates instantly** → User sees new data with toast notification

## Benefits

✅ **Real-time updates** - No waiting for 30-second polling interval
✅ **Accurate grouping** - Emissions grouped by actual companies/suppliers
✅ **Realistic values** - Shows average per event, not inflated totals
✅ **Better UX** - Toast notification confirms data is fresh
✅ **Instant feedback** - See results immediately after CSV upload

## Testing

1. Upload a CSV file (e.g., `demo_upload_5_extreme_spike.csv`)
2. Watch for "Dashboard Updated" toast notification
3. Verify pie chart shows suppliers (not event types)
4. Verify heatmap shows realistic values (~700-800 kg for factory events)
5. Verify all charts update with new data

## Notes

- The dashboard still polls every 30 seconds as a fallback
- WebSocket provides instant updates when available
- All emission values are now averages per event, not totals
- Supplier names come from the `supplier_id` field in events
