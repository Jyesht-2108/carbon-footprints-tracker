#!/usr/bin/env python3
"""Check heatmap data values using direct Supabase query."""
import os
from supabase import create_client

# Supabase credentials
SUPABASE_URL = "https://azpbgjfsnmepzxofxitu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cGJnamZzbm1lcHp4b2Z4aXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMxMDA2OCwiZXhwIjoyMDc5ODg2MDY4fQ.ipZu4OhIsUBxmdAIoFivzGaVOfdYL1wRV2UUaxHGB-E"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 60)
print("CHECKING HEATMAP DATA")
print("=" * 60)

# Get predictions
predictions_response = supabase.table("predictions").select("*").order("created_at", desc=True).limit(100).execute()
predictions = predictions_response.data
print(f"\n✓ Found {len(predictions)} predictions")

# Get events
events_response = supabase.table("events_normalized").select("*").order("timestamp", desc=True).limit(200).execute()
events = events_response.data
print(f"✓ Found {len(events)} events")

# Create supplier mapping
event_supplier_map = {}
for e in events:
    event_id = e.get("id")
    supplier = e.get("supplier_id") or e.get("supplier_name") or "Unknown"
    if event_id:
        event_supplier_map[event_id] = supplier
        event_supplier_map[str(event_id)] = supplier

print(f"✓ Created supplier map with {len(event_supplier_map)} entries")

# Calculate per-supplier stats
supplier_sums = {}
supplier_counts = {}

print("\n" + "=" * 60)
print("SAMPLE PREDICTIONS (first 10):")
print("=" * 60)

for i, pred in enumerate(predictions[:10]):
    co2 = pred.get("predicted_co2", 0) or 0
    event_id = pred.get("event_id")
    supplier = event_supplier_map.get(event_id) or event_supplier_map.get(str(event_id)) or "Unknown"
    print(f"{i+1}. Event {event_id}: {co2:.2f} kg CO₂ (Supplier: {supplier})")

# Calculate all stats
for pred in predictions:
    co2 = pred.get("predicted_co2", 0) or 0
    event_id = pred.get("event_id")
    supplier = event_supplier_map.get(event_id) or event_supplier_map.get(str(event_id)) or "Unknown"
    
    supplier_sums[supplier] = supplier_sums.get(supplier, 0) + co2
    supplier_counts[supplier] = supplier_counts.get(supplier, 0) + 1

print("\n" + "=" * 60)
print("SUPPLIER STATISTICS:")
print("=" * 60)

for supplier in sorted(supplier_sums.keys()):
    total = supplier_sums[supplier]
    count = supplier_counts[supplier]
    avg = total / count
    print(f"\n{supplier}:")
    print(f"  Total CO₂: {total:.2f} kg")
    print(f"  Event Count: {count}")
    print(f"  Average per Event: {avg:.2f} kg")

print("\n" + "=" * 60)
print("HEATMAP VALUES (what should be displayed):")
print("=" * 60)

for supplier in sorted(supplier_sums.keys()):
    avg = supplier_sums[supplier] / supplier_counts[supplier]
    print(f"{supplier}: {avg:.2f} kg CO₂")

print("\n" + "=" * 60)
print("ISSUE DIAGNOSIS:")
print("=" * 60)
print("If averages are still >100 kg, the ML predictions themselves are too high.")
print("This means the ML Engine is predicting unrealistic values.")
