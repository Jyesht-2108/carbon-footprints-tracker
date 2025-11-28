"""Check what data is in the database."""
import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('plugins/orchestration-engine/.env')

# Initialize Supabase client
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

print("=" * 80)
print("CHECKING DATABASE DATA")
print("=" * 80)

# Check events_normalized table
print("\n1. EVENTS_NORMALIZED TABLE:")
print("-" * 80)
response = supabase.table("events_normalized").select("*").order("timestamp", desc=True).limit(5).execute()
if response.data:
    print(f"Found {len(response.data)} recent events")
    for i, event in enumerate(response.data[:3], 1):
        print(f"\nEvent {i}:")
        print(f"  - ID: {event.get('id')}")
        print(f"  - Timestamp: {event.get('timestamp')}")
        print(f"  - Supplier: {event.get('supplier_id')}")
        print(f"  - Route: {event.get('route_id')}")
        print(f"  - CO2 (kg): {event.get('co2_kg')}")
        print(f"  - Distance: {event.get('distance_km')}")
        print(f"  - Weight: {event.get('weight_kg')}")
else:
    print("No events found!")

# Check total count
count_response = supabase.table("events_normalized").select("*", count="exact").execute()
print(f"\nTotal events in database: {count_response.count}")

# Check if any events have non-zero CO2
print("\n2. EVENTS WITH NON-ZERO CO2:")
print("-" * 80)
non_zero = supabase.table("events_normalized").select("*").gt("co2_kg", 0).limit(5).execute()
if non_zero.data:
    print(f"Found {len(non_zero.data)} events with CO2 > 0")
    for event in non_zero.data[:3]:
        print(f"  - {event.get('supplier_id')}: {event.get('co2_kg')} kg CO2")
else:
    print("No events with CO2 > 0 found!")

# Check predictions
print("\n3. PREDICTIONS TABLE:")
print("-" * 80)
predictions = supabase.table("predictions").select("*").order("created_at", desc=True).limit(3).execute()
if predictions.data:
    print(f"Found {len(predictions.data)} predictions")
    for pred in predictions.data:
        print(f"  - Event {pred.get('event_id')}: {pred.get('predicted_co2_kg')} kg CO2 (predicted)")
else:
    print("No predictions found!")

# Check hotspots
print("\n4. HOTSPOTS TABLE:")
print("-" * 80)
hotspots = supabase.table("hotspots").select("*").order("created_at", desc=True).limit(3).execute()
if hotspots.data:
    print(f"Found {len(hotspots.data)} hotspots")
    for hotspot in hotspots.data:
        print(f"  - {hotspot.get('entity')}: {hotspot.get('severity')} ({hotspot.get('status')})")
else:
    print("No hotspots found!")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total Events: {count_response.count}")
print(f"Events with CO2 > 0: {len(non_zero.data) if non_zero.data else 0}")
print(f"Predictions: {len(predictions.data) if predictions.data else 0}")
print(f"Hotspots: {len(hotspots.data) if hotspots.data else 0}")
print("=" * 80)
