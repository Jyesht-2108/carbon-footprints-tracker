# Design Document: Emission Calculation Pipeline

## Overview

This design implements an automatic emission calculation pipeline that processes normalized supply chain events and calculates CO2 emissions. The pipeline will be integrated into the existing data-core service and will execute immediately after CSV upload, ensuring emissions data is available for ML predictions, hotspot detection, and dashboard visualization.

The emission calculator uses industry-standard emission factors based on vehicle type, fuel type, distance traveled, and load weight. Results are stored in a new `emissions` table with references to the original events.

## Architecture

### High-Level Flow

```
CSV Upload → Normalize Events → Calculate Emissions → Store Emissions → Trigger Analysis
     ↓              ↓                    ↓                   ↓                ↓
events_raw → events_normalized → EmissionCalculator → emissions table → ML Engine
```

### Component Integration

The emission calculation pipeline integrates into the existing data-core service:

1. **Upload Endpoint** (`/ingest/upload`) - Modified to call emission calculator after normalization
2. **Emission Calculator** - New component that calculates CO2 emissions
3. **Emission Factors** - Configuration defining CO2 coefficients for vehicle/fuel combinations
4. **Supabase Client** - Extended to support emissions table operations
5. **Emissions API** - New endpoints for querying and aggregating emission data

### Service Dependencies

- **Data-Core Service** (port 8001) - Hosts the emission calculator
- **Supabase Database** - Stores emissions in new table
- **Orchestration Engine** (port 8000) - Consumes emission data for hotspot detection
- **ML Engine** (port 8003) - Uses emission data for predictions

## Components and Interfaces

### 1. Emission Calculator Component

**Location:** `plugins/data-core/src/processing/emission_calculator.py`

**Responsibilities:**
- Calculate CO2 emissions from normalized event data
- Apply emission factors based on vehicle and fuel type
- Handle missing or invalid data gracefully
- Support batch processing for performance

**Interface:**

```python
class EmissionCalculator:
    @staticmethod
    def calculate_emission(
        vehicle_type: str,
        fuel_type: str,
        distance_km: float,
        load_kg: float
    ) -> Dict[str, Any]:
        """
        Calculate CO2 emission for a single event
        
        Returns:
            {
                "co2_kg": float,
                "emission_factor": float,
                "calculation_method": str,
                "is_estimated": bool
            }
        """
        pass
    
    @staticmethod
    def calculate_emissions_batch(
        events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Calculate emissions for multiple events in batch
        
        Returns list of emission results
        """
        pass
    
    @staticmethod
    def get_emission_factor(
        vehicle_type: str,
        fuel_type: str
    ) -> float:
        """
        Get emission factor for vehicle/fuel combination
        Returns kg CO2 per km
        """
        pass
```

### 2. Emission Factors Configuration

**Location:** `plugins/data-core/src/utils/emission_factors.py`

**Emission Factor Table** (kg CO2 per km):

| Vehicle Type | Diesel | Petrol | Electric | CNG | LPG |
|-------------|--------|--------|----------|-----|-----|
| truck | 0.850 | 0.750 | 0.050 | 0.600 | 0.650 |
| mini_truck | 0.600 | 0.550 | 0.040 | 0.450 | 0.500 |
| van | 0.400 | 0.350 | 0.030 | 0.300 | 0.320 |
| two_wheeler | 0.080 | 0.070 | 0.010 | 0.060 | 0.065 |
| electric_vehicle | 0.000 | 0.000 | 0.020 | 0.000 | 0.000 |

**Load Factor Adjustment:**
- Base emission factor applies to empty vehicle
- Add 0.1% per kg of load (multiplicative factor: 1 + load_kg * 0.001)
- Example: 1000 kg load increases emissions by 100% (2x multiplier)

**Default Factor:**
- Unknown vehicle/fuel combinations: 0.500 kg CO2/km
- Flagged with `is_estimated: true`

### 3. Emissions Database Table

**Schema:**

```sql
CREATE TABLE IF NOT EXISTS emissions (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events_normalized(id) ON DELETE CASCADE,
    supplier_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    co2_kg FLOAT NOT NULL CHECK (co2_kg >= 0),
    emission_factor FLOAT NOT NULL,
    distance_km FLOAT,
    load_kg FLOAT,
    vehicle_type TEXT,
    fuel_type TEXT,
    calculation_method TEXT DEFAULT 'standard',
    is_estimated BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT emissions_event_unique UNIQUE (event_id)
);

CREATE INDEX idx_emissions_supplier ON emissions(supplier_id);
CREATE INDEX idx_emissions_event_type ON emissions(event_type);
CREATE INDEX idx_emissions_timestamp ON emissions(timestamp DESC);
CREATE INDEX idx_emissions_created_at ON emissions(created_at DESC);
```

### 4. Supabase Client Extension

**Location:** `plugins/data-core/src/db/supabase_client.py`

**New Methods:**

```python
def insert_emission(self, emission: Dict[str, Any]) -> Dict[str, Any]:
    """Insert single emission record"""
    pass

def insert_emissions_batch(self, emissions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Bulk insert emission records"""
    pass

def get_emissions_by_supplier(
    self, 
    supplier_id: str, 
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Get emissions for a supplier with optional date range"""
    pass

def get_emissions_aggregated(
    self,
    group_by: str,  # 'supplier', 'vehicle_type', 'fuel_type', 'event_type'
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Get aggregated emissions"""
    pass
```

### 5. API Endpoints

**Location:** `plugins/data-core/src/api/routes.py`

**New Endpoints:**

```python
@router.get("/emissions/{supplier_id}")
async def get_supplier_emissions(
    supplier_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get emissions for a specific supplier"""
    pass

@router.get("/emissions/aggregate/{group_by}")
async def get_emissions_aggregate(
    group_by: str,  # supplier, vehicle_type, fuel_type, event_type
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get aggregated emissions"""
    pass

@router.get("/emissions/total")
async def get_total_emissions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get total emissions across all suppliers"""
    pass
```

## Data Models

### Emission Record

```python
{
    "id": 12345,
    "event_id": 67890,
    "supplier_id": "GreenTech_Industries",
    "event_type": "logistics",
    "co2_kg": 85.5,
    "emission_factor": 0.850,
    "distance_km": 100.0,
    "load_kg": 500.0,
    "vehicle_type": "truck",
    "fuel_type": "diesel",
    "calculation_method": "standard",
    "is_estimated": false,
    "timestamp": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:31:00Z"
}
```

### Emission Calculation Result

```python
{
    "co2_kg": 85.5,
    "emission_factor": 0.850,
    "load_factor": 1.5,
    "calculation_method": "standard",
    "is_estimated": false,
    "details": {
        "base_emission": 85.0,
        "load_adjustment": 0.5,
        "vehicle_type": "truck",
        "fuel_type": "diesel"
    }
}
```

### Aggregated Emissions

```python
{
    "group_by": "vehicle_type",
    "results": [
        {
            "key": "truck",
            "total_co2_kg": 12500.5,
            "event_count": 150,
            "avg_co2_per_event": 83.34,
            "percentage": 65.2
        },
        {
            "key": "van",
            "total_co2_kg": 4200.3,
            "event_count": 120,
            "avg_co2_per_event": 35.00,
            "percentage": 21.9
        }
    ],
    "total_co2_kg": 19200.8,
    "total_events": 320
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Emission calculation completeness
*For any* batch of normalized events uploaded via CSV, the number of records in the emissions table should equal the number of records in events_normalized after processing completes.
**Validates: Requirements 1.1**

### Property 2: Correct emission factor application
*For any* event with a known vehicle type and fuel type combination, the emission factor used in the calculation should match the emission factor defined in the emission factors configuration for that combination.
**Validates: Requirements 1.2**

### Property 3: Event reference integrity
*For any* emission record in the emissions table, the event_id should reference a valid record in the events_normalized table, and querying that event should return the corresponding event data.
**Validates: Requirements 1.3**

### Property 4: Error resilience
*For any* batch of events containing both valid and invalid data, all valid events should have corresponding emission records even when some events fail validation.
**Validates: Requirements 1.4**

### Property 5: Load weight impact
*For any* two emission calculations with identical vehicle type, fuel type, and distance but different load weights, the emission with higher load should have higher CO2 output.
**Validates: Requirements 2.3**

### Property 6: Distance scaling
*For any* emission calculation, if distance is doubled while keeping vehicle type, fuel type, and load constant, the calculated CO2 emissions should approximately double (within 1% tolerance for rounding).
**Validates: Requirements 2.4**

### Property 7: Unknown vehicle/fuel handling
*For any* event with an unknown vehicle type or fuel type, the emission calculation should use the default emission factor and set the is_estimated flag to true.
**Validates: Requirements 2.5**

### Property 8: Immediate queryability
*For any* emission record inserted into the database, immediately querying the emissions table by that record's ID should return the same emission data.
**Validates: Requirements 4.1**

### Property 9: Aggregation correctness
*For any* set of emission records grouped by a field (vehicle_type, fuel_type, supplier_id, or event_type), the sum of CO2 values in each group should equal the total CO2 when summed across all groups.
**Validates: Requirements 4.4**

### Property 10: Non-negative emissions
*For any* valid emission calculation with non-negative distance and load values, the resulting CO2 emission value should be greater than or equal to zero.
**Validates: Requirements 5.3**

### Property 11: Input validation
*For any* emission calculation with distance or load values outside reasonable ranges (distance > 10000 km or load > 100000 kg), the system should either reject the calculation or flag it as estimated.
**Validates: Requirements 5.2**

### Property 12: Response completeness
*For any* emission calculation response or aggregation query, the response should include both total_co2_kg and event_count fields with values that accurately reflect the underlying data.
**Validates: Requirements 1.5, 6.5**

## Error Handling

### Validation Errors

**Invalid Input Data:**
- Negative distance or load values → Skip event, log error, continue processing
- Missing required fields (vehicle_type, fuel_type) → Use default factor, set is_estimated=true
- Invalid data types → Skip event, log error, continue processing

**Database Errors:**
- Duplicate event_id → Skip insertion, log warning (emission already calculated)
- Foreign key violation → Log error, skip event (referenced event doesn't exist)
- Connection timeout → Retry up to 3 times with exponential backoff

### Calculation Errors

**Unknown Vehicle/Fuel Combinations:**
- Use default emission factor (0.500 kg CO2/km)
- Set is_estimated flag to true
- Log warning with vehicle/fuel types

**Extreme Values:**
- Distance > 10000 km → Flag as estimated, use value
- Load > 100000 kg → Flag as estimated, use value
- Speed > 200 km/h → Log warning, continue calculation

### API Errors

**Query Errors:**
- Invalid supplier_id → Return empty result set with 200 status
- Invalid date format → Return 400 Bad Request with error message
- Invalid group_by parameter → Return 400 Bad Request with valid options

**Timeout Errors:**
- Query timeout (>30s) → Return 504 Gateway Timeout
- Suggest using date range filters to reduce query size

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

**Emission Calculator Tests:**
- Test diesel truck emission calculation with known values
- Test electric vehicle emission calculation
- Test zero distance returns zero emissions
- Test zero load returns base emissions
- Test negative values are rejected
- Test unknown vehicle/fuel uses default factor
- Test load factor adjustment calculation

**Database Tests:**
- Test emission insertion
- Test bulk emission insertion
- Test query by supplier
- Test aggregation by vehicle type
- Test aggregation by fuel type
- Test date range filtering

**API Tests:**
- Test GET /emissions/{supplier_id} returns correct data
- Test GET /emissions/aggregate/{group_by} returns correct structure
- Test invalid parameters return appropriate errors

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **Hypothesis** (Python PBT library). Each test will run a minimum of 100 iterations with randomly generated inputs.

**Test Configuration:**
```python
from hypothesis import given, settings
from hypothesis import strategies as st

# Configure to run 100 iterations minimum
@settings(max_examples=100)
```

**Property Test Generators:**

```python
# Generate valid events
@st.composite
def valid_event(draw):
    return {
        "vehicle_type": draw(st.sampled_from(VEHICLE_TYPES)),
        "fuel_type": draw(st.sampled_from(FUEL_TYPES)),
        "distance_km": draw(st.floats(min_value=0.1, max_value=1000)),
        "load_kg": draw(st.floats(min_value=0, max_value=50000))
    }

# Generate events with unknown types
@st.composite
def unknown_vehicle_event(draw):
    return {
        "vehicle_type": draw(st.text(min_size=1, max_size=20)),
        "fuel_type": draw(st.text(min_size=1, max_size=20)),
        "distance_km": draw(st.floats(min_value=0.1, max_value=1000)),
        "load_kg": draw(st.floats(min_value=0, max_value=50000))
    }

# Generate edge case events
@st.composite
def edge_case_event(draw):
    return {
        "vehicle_type": draw(st.sampled_from(VEHICLE_TYPES)),
        "fuel_type": draw(st.sampled_from(FUEL_TYPES)),
        "distance_km": draw(st.one_of(
            st.just(0),
            st.floats(min_value=0.1, max_value=1000),
            st.floats(min_value=10000, max_value=50000)
        )),
        "load_kg": draw(st.one_of(
            st.just(0),
            st.floats(min_value=0, max_value=50000),
            st.floats(min_value=100000, max_value=500000)
        ))
    }
```

**Property Tests:**

Each property-based test will be tagged with a comment referencing the design document property:

```python
# Feature: emission-calculation-pipeline, Property 1: Emission calculation completeness
@given(events=st.lists(valid_event(), min_size=1, max_size=100))
def test_emission_calculation_completeness(events):
    # Test implementation
    pass

# Feature: emission-calculation-pipeline, Property 2: Correct emission factor application
@given(event=valid_event())
def test_correct_emission_factor_application(event):
    # Test implementation
    pass
```

### Integration Testing

Integration tests will verify the complete flow:

1. Upload CSV → Verify emissions calculated → Verify API returns data
2. Calculate emissions → Trigger analysis → Verify hotspots use emission data
3. Upload multiple CSVs → Verify aggregations are correct

### Test Data

**Sample Events:**
```python
SAMPLE_EVENTS = [
    {
        "vehicle_type": "truck",
        "fuel_type": "diesel",
        "distance_km": 100,
        "load_kg": 5000,
        "expected_co2_kg": 127.5  # (0.850 * 100) * (1 + 5000 * 0.001)
    },
    {
        "vehicle_type": "electric_vehicle",
        "fuel_type": "electric",
        "distance_km": 50,
        "load_kg": 0,
        "expected_co2_kg": 1.0  # 0.020 * 50
    }
]
```

## Performance Considerations

### Batch Processing

- Process emissions in chunks of 100 events
- Use bulk insert operations (single database round-trip per chunk)
- Expected throughput: 1000 events/second

### Database Optimization

- Index on supplier_id for fast supplier queries
- Index on timestamp for time-range queries
- Index on event_type for aggregations
- Composite index on (supplier_id, timestamp) for common query pattern

### Caching Strategy

- Cache emission factors in memory (loaded at startup)
- No caching of emission data (always query fresh from database)
- Cache aggregation results for 5 minutes (configurable)

### Monitoring

- Log emission calculation time per batch
- Alert if calculation takes > 60 seconds
- Track emission factor cache hit rate
- Monitor database query performance

## Deployment Considerations

### Database Migration

1. Create emissions table using provided schema
2. Add indexes for performance
3. Verify foreign key constraints work with events_normalized
4. Run migration on staging environment first

### Backward Compatibility

- Existing CSV upload flow continues to work
- Emission calculation is additive (doesn't break existing functionality)
- API endpoints are new (no breaking changes)

### Rollback Plan

- If emission calculation fails, CSV upload still succeeds
- Emissions table can be dropped without affecting other tables
- Feature flag to disable emission calculation if needed

### Configuration

Environment variables:
```
ENABLE_EMISSION_CALCULATION=true
EMISSION_CALCULATION_BATCH_SIZE=100
EMISSION_CALCULATION_TIMEOUT=60
DEFAULT_EMISSION_FACTOR=0.500
```

## Future Enhancements

1. **Dynamic Emission Factors** - Load emission factors from database instead of code
2. **Regional Factors** - Support different emission factors by geographic region
3. **Time-based Factors** - Account for traffic conditions, weather affecting emissions
4. **Real-time Calculation** - Calculate emissions for streaming events
5. **Emission Forecasting** - Predict future emissions based on planned routes
6. **Carbon Offset Tracking** - Track carbon offset purchases against emissions
