# Heatmap Supplier Name & Data Fix

## Issues Fixed

### 1. **"Unknown" Supplier Names**
- **Problem**: Heatmap was showing "Unknown" instead of actual supplier names
- **Root Cause**: Event ID mapping wasn't working correctly between predictions and events
- **Solution**: 
  - Improved event-to-supplier mapping with both numeric and string ID lookups
  - Added fallback to check both `supplier_id` and `supplier_name` fields
  - Increased event fetch limit to ensure all recent events are mapped

### 2. **Emission Values Display**
- **Problem**: Values seemed confusing (showing averages across all event types)
- **Root Cause**: Mixing high-emission events (factory: ~760 kg) with low-emission events (logistics: ~7 kg)
- **Solution**: Changed from showing **average per event** to **total emissions per supplier**
  - This gives a clearer picture of each supplier's total carbon footprint
  - More intuitive for comparing supplier impact

## Technical Changes

**File: `plugins/orchestration-engine/src/api/routes_dashboard.py`**

```python
# Before: Simple ID mapping
event_supplier_map = {e.get("id"): e.get("supplier_id", "Unknown") for e in events}

# After: Robust mapping with multiple fallbacks
event_supplier_map = {}
for e in events:
    event_id = e.get("id")
    supplier = e.get("supplier_id") or e.get("supplier_name") or "Unknown"
    if event_id:
        event_supplier_map[event_id] = supplier
        event_supplier_map[str(event_id)] = supplier  # String version too

# Before: Average per event
categories = {
    supplier: categories_sum[supplier] / categories_count[supplier]
    for supplier in categories_sum
}

# After: Total emissions
categories[supplier] = categories.get(supplier, 0) + co2
```

## What The Heatmap Now Shows

The heatmap displays **total CO₂ emissions per supplier** from recent operations:

- **GreenTech_Industries**: Total emissions from all their logistics, factory, and warehouse operations
- **EcoSupply_Corp**: Total emissions from their operations
- **SustainableGoods_Ltd**: Total emissions from their operations
- **Unknown**: Any events that couldn't be mapped to a supplier

## Expected Values

Based on typical operations:
- **Logistics event**: ~6-15 kg CO₂ each
- **Factory event**: ~750-770 kg CO₂ each
- **Warehouse event**: ~580-600 kg CO₂ each

If a supplier has:
- 10 logistics events = ~100 kg
- 5 factory events = ~3,800 kg
- 5 warehouse events = ~2,900 kg
- **Total = ~6,800 kg CO₂**

## Debugging

Added logging to help diagnose issues:
```python
logger.info(f"Created supplier map with {len(event_supplier_map)} entries")
logger.info(f"Emissions by supplier: {categories}")
logger.info(f"Event counts by supplier: {supplier_counts}")
```

Check the orchestration engine logs to see:
- How many events were mapped
- Which suppliers were found
- Total emissions per supplier

## Testing

1. Upload a CSV file with known supplier names (e.g., `demo_upload_1_baseline_v2.csv`)
2. Wait for analysis to complete
3. Check dashboard heatmap - should show actual supplier names
4. Values should reflect total emissions from all their operations
5. Check orchestration engine logs for mapping details

## Notes

- If you still see "Unknown", check that:
  - Events have `supplier_id` or `supplier_name` field populated
  - Predictions have valid `event_id` that matches event IDs
  - Database has recent events (not just old data)
- Total emissions will be higher than averages (this is expected and correct)
- The more operations a supplier has, the higher their total will be
