# Required columns for event data
REQUIRED_COLUMNS = [
    "timestamp",
    "supplier_id",
    "event_type"
]

# Optional columns
OPTIONAL_COLUMNS = [
    "distance_km",
    "load_kg",
    "vehicle_type",
    "fuel_type",
    "energy_kwh",
    "temperature",
    "route_id",
    "warehouse_id",
    "factory_id",
    "speed",
    "stop_events",
    "furnace_usage",
    "cooling_load",
    "shift_hours",
    "refrigeration_load",
    "inventory_volume"
]

# Vehicle type mappings
VEHICLE_TYPE_MAPPING = {
    "2w": "two_wheeler",
    "bike": "two_wheeler",
    "motorcycle": "two_wheeler",
    "truck": "truck",
    "truck_diesel": "truck",
    "truck_petrol": "truck",
    "truck_cng": "truck",
    "mini_truck": "mini_truck",
    "van": "van",
    "van_diesel": "van",
    "van_petrol": "van",
    "van_cng": "van",
    "ev": "electric_vehicle",
    "electric": "electric_vehicle",
    "electric_vehicle": "electric_vehicle"
}

# Fuel type mappings
FUEL_TYPE_MAPPING = {
    "diesel": "diesel",
    "petrol": "petrol",
    "gasoline": "petrol",
    "electric": "electric",
    "ev": "electric",
    "cng": "cng",
    "lpg": "lpg"
}

# Event types
EVENT_TYPES = [
    "logistics",
    "factory",
    "warehouse",
    "delivery"
]

# Gap fillable fields
GAP_FILLABLE_FIELDS = [
    "distance_km",
    "energy_kwh",
    "load_kg",
    "speed"
]
