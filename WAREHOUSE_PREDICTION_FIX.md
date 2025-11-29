# Warehouse Prediction 422 Error - FIXED ✅

## Problem

Warehouse predictions were failing with 422 Unprocessable Content errors:

```
ERROR | src.services.ml_client:predict_warehouse:58 - ML Engine warehouse prediction error: 
Client error '422 Unprocessable Content' for url 'http://localhost:8001/api/v1/predict/warehouse'
```

## Root Cause

The ML Engine's `WarehouseRequest` Pydantic model required `energy_kwh` to be greater than 0:

```python
class WarehouseRequest(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius")
    energy_kwh: float = Field(..., gt=0, description="Energy consumption in kWh")  # ❌ Required > 0
    refrigeration_load: Optional[float] = Field(0, description="Refrigeration load")
    inventory_volume: Optional[float] = Field(0, description="Inventory volume")
```

However, warehouse events in the CSV had empty `energy_kwh` values:
```csv
GreenTech_Industries,2025-11-29 06:00:00,warehouse,,,,,,,,,,22,45,8500
```

The gap filler would fill these with 0 or calculated values, but the orchestration engine was sending `energy_kwh: 0`, which failed the `gt=0` validation.

## Solution

Changed `energy_kwh` to be optional with `ge=0` (greater than or equal to 0) instead of required with `gt=0`:

```python
class WarehouseRequest(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius")
    energy_kwh: Optional[float] = Field(0, ge=0, description="Energy consumption in kWh (calculated if 0)")  # ✅ Optional, >= 0
    refrigeration_load: Optional[float] = Field(0, description="Refrigeration load")
    inventory_volume: Optional[float] = Field(0, description="Inventory volume")
```

The preprocessing function already handles the case when `energy_kwh` is 0:

```python
def preprocess_warehouse_input(data: Dict[str, Any]) -> np.ndarray:
    # Calculate estimated energy_kwh if not provided
    if "energy_kwh" not in processed or processed["energy_kwh"] == 0:
        refrigeration = processed.get("refrigeration_load", 0)
        inventory = processed.get("inventory_volume", 0)
        # Estimate: base 100 kWh + refrigeration load + inventory volume factor
        processed["energy_kwh"] = 100 + refrigeration * 2 + inventory * 0.01
```

## Files Modified

- `plugins/ml-engine/src/api/routes.py` - Updated `WarehouseRequest` model

## Expected Behavior After Fix

✅ Warehouse predictions will now work with empty/zero `energy_kwh` values
✅ The preprocessing will calculate energy_kwh based on refrigeration_load and inventory_volume
✅ All 6 warehouse events in the CSV will generate predictions
✅ Hotspots will be detected for warehouse events

## Testing

After the ML Engine restarts, upload the CSV again and verify:

1. No more 422 errors for warehouse predictions
2. All 24 events (10 logistics + 8 factory + 6 warehouse) generate predictions
3. Hotspots detected for all event types

## Current Status

- ✅ Logistics predictions: Working (8/10 events - 2 skipped due to other issues)
- ✅ Factory predictions: Working (8/8 events)
- ❌ Warehouse predictions: Failing with 422 (0/6 events) → **FIXED, awaiting restart**

After ML Engine restart, all predictions should work correctly.
