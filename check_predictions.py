#!/usr/bin/env python3
"""Check if predictions are being generated in the database."""

import os
from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://azpbgjfsnmepzxofxitu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cGJnamZzbm1lcHp4b2Z4aXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMxMDA2OCwiZXhwIjoyMDc5ODg2MDY4fQ.ipZu4OhIsUBxmdAIoFivzGaVOfdYL1wRV2UUaxHGB-E"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 80)
print("CHECKING PREDICTIONS IN DATABASE")
print("=" * 80)
print()

# Check events_normalized
print("1. Events Normalized (last 10):")
print("-" * 80)
events = supabase.table("events_normalized").select("*").order("created_at", desc=True).limit(10).execute()
if events.data:
    for event in events.data:
        print(f"  ID: {event['id']}")
        print(f"  Type: {event.get('event_type', 'N/A')}")
        print(f"  Supplier: {event.get('supplier_id', 'N/A')}")
        print(f"  Predicted CO2: {event.get('predicted_co2', 'N/A')}")
        print(f"  Created: {event.get('created_at', 'N/A')}")
        print()
else:
    print("  No events found")
print()

# Check hotspots
print("2. Hotspots (last 10):")
print("-" * 80)
hotspots = supabase.table("hotspots").select("*").order("created_at", desc=True).limit(10).execute()
if hotspots.data:
    for hotspot in hotspots.data:
        print(f"  ID: {hotspot['id']}")
        print(f"  Entity: {hotspot.get('entity', 'N/A')}")
        print(f"  Severity: {hotspot.get('severity', 'N/A')}")
        print(f"  Predicted CO2: {hotspot.get('predicted_co2', 'N/A')}")
        print(f"  Baseline CO2: {hotspot.get('baseline_co2', 'N/A')}")
        print(f"  % Above: {hotspot.get('percent_above', 'N/A')}")
        print(f"  Created: {hotspot.get('created_at', 'N/A')}")
        print()
else:
    print("  No hotspots found")
print()

# Count predictions by event type
print("3. Prediction Counts by Event Type:")
print("-" * 80)
events_with_predictions = supabase.table("events_normalized").select("event_type, predicted_co2").not_.is_("predicted_co2", "null").execute()
if events_with_predictions.data:
    from collections import Counter
    counts = Counter(event['event_type'] for event in events_with_predictions.data)
    for event_type, count in counts.items():
        print(f"  {event_type}: {count} predictions")
    print(f"\n  Total predictions: {len(events_with_predictions.data)}")
else:
    print("  No predictions found")
print()

print("=" * 80)
print("SUMMARY")
print("=" * 80)
total_events = len(events.data) if events.data else 0
total_hotspots = len(hotspots.data) if hotspots.data else 0
total_predictions = len(events_with_predictions.data) if events_with_predictions.data else 0

if total_predictions > 0:
    print(f"✅ Predictions are being generated!")
    print(f"   - {total_events} recent events")
    print(f"   - {total_predictions} total predictions")
    print(f"   - {total_hotspots} recent hotspots")
else:
    print(f"❌ No predictions found in database")
    print(f"   - {total_events} events exist")
    print(f"   - Try uploading a CSV file to trigger predictions")
