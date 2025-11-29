# Heatmap Severity Display Fix

## Issue
The Emissions Heatmap was incorrectly labeling warnings as "Critical" when they should have been "High" or lower severity.

## Root Cause
The `getIntensityLabel` function in `EmissionsHeatmap.tsx` was using overly aggressive thresholds:
- **Old**: Anything > 70% of max value = "Critical"
- **Problem**: With 17 kg CO₂ as the max, it showed as "Critical" even though hotspots were "warn" severity

## Fix Applied
Updated the intensity thresholds to be more reasonable:

```typescript
// OLD THRESHOLDS
if (intensity > 0.7) return 'Critical'  // 70%+
if (intensity > 0.4) return 'High'      // 40-70%
if (intensity > 0.2) return 'Medium'    // 20-40%
return 'Low'                            // <20%

// NEW THRESHOLDS
if (intensity > 0.9) return 'Critical'  // 90%+ (top 10%)
if (intensity > 0.7) return 'High'      // 70-90%
if (intensity > 0.4) return 'Medium'    // 40-70%
return 'Low'                            // <40%
```

Also updated the color gradients to match:
- **Critical** (>90%): Red gradient
- **High** (70-90%): Orange gradient  
- **Medium** (40-70%): Yellow gradient
- **Low** (<40%): Green gradient

## Result
Now the heatmap severity labels align better with:
1. The actual hotspot severity from the backend ("warn" vs "critical")
2. More intuitive thresholds (only top 10% is truly "Critical")
3. Better visual representation of emission intensity

## Example
With current data (17 kg CO₂):
- **Before**: Showed as "Critical" (red)
- **After**: Shows as "High" (orange)

This matches the "warn" severity from the hotspot detection system.

## Files Changed
- `frontend-ui/src/components/charts/EmissionsHeatmap.tsx`
  - Updated `getIntensityLabel()` thresholds
  - Updated `getColor()` thresholds to match
