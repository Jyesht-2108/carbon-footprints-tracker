#!/usr/bin/env python3
"""Analyze prediction distribution to understand outliers."""
from supabase import create_client
import statistics

# Supabase credentials
SUPABASE_URL = "https://azpbgjfsnmepzxofxitu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cGJnamZzbm1lcHp4b2Z4aXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMxMDA2OCwiZXhwIjoyMDc5ODg2MDY4fQ.ipZu4OhIsUBxmdAIoFivzGaVOfdYL1wRV2UUaxHGB-E"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Get predictions
predictions_response = supabase.table("predictions").select("*").order("created_at", desc=True).limit(100).execute()
predictions = predictions_response.data

# Get events
events_response = supabase.table("events_normalized").select("*").order("timestamp", desc=True).limit(200).execute()
events = events_response.data

# Create supplier mapping
event_supplier_map = {}
for e in events:
    event_id = e.get("id")
    supplier = e.get("supplier_id") or e.get("supplier_name") or "Unknown"
    if event_id:
        event_supplier_map[event_id] = supplier

# Group by supplier
supplier_values = {}
for pred in predictions:
    co2 = pred.get("predicted_co2", 0) or 0
    event_id = pred.get("event_id")
    supplier = event_supplier_map.get(event_id) or "Unknown"
    
    if supplier not in supplier_values:
        supplier_values[supplier] = []
    supplier_values[supplier].append(co2)

print("=" * 70)
print("PREDICTION DISTRIBUTION ANALYSIS")
print("=" * 70)

for supplier in sorted(supplier_values.keys()):
    values = sorted(supplier_values[supplier])
    if not values:
        continue
    
    print(f"\n{supplier}:")
    print(f"  Count: {len(values)}")
    print(f"  Min: {min(values):.2f} kg")
    print(f"  Max: {max(values):.2f} kg")
    print(f"  Mean: {statistics.mean(values):.2f} kg")
    print(f"  Median: {statistics.median(values):.2f} kg")
    
    # Show percentiles
    p25 = values[len(values)//4]
    p75 = values[3*len(values)//4]
    p90 = values[9*len(values)//10] if len(values) >= 10 else values[-1]
    
    print(f"  25th percentile: {p25:.2f} kg")
    print(f"  75th percentile: {p75:.2f} kg")
    print(f"  90th percentile: {p90:.2f} kg")
    
    # Count outliers (>100 kg)
    outliers = [v for v in values if v > 100]
    print(f"  Outliers (>100 kg): {len(outliers)} ({len(outliers)/len(values)*100:.1f}%)")
    
    # Show distribution
    print(f"  Sample values: {values[:5]}")

print("\n" + "=" * 70)
print("RECOMMENDATION:")
print("=" * 70)
print("For heatmap, use MEDIAN values as they're more representative.")
print("Median is robust to outliers and shows typical emissions per event.")
