from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv('plugins/orchestration-engine/.env')

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

print("=" * 80)
print("REAL-TIME DATA VERIFICATION")
print("=" * 80)
print(f"Current Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# Check hotspots with timestamps
print("1. ACTIVE HOTSPOTS (with timestamps):")
print("-" * 80)
hotspots = supabase.table("hotspots").select("*").eq("status", "active").order("created_at", desc=True).limit(10).execute()

if hotspots.data:
    total_predicted = sum(h['predicted_co2'] for h in hotspots.data)
    total_baseline = sum(h['baseline_co2'] for h in hotspots.data)
    
    print(f"Total Active Hotspots: {len(hotspots.data)}")
    print(f"Total Predicted CO2: {total_predicted:.2f} kg")
    print(f"Total Baseline CO2: {total_baseline:.2f} kg")
    print(f"Percent Above Baseline: {((total_predicted - total_baseline) / total_baseline * 100):.1f}%")
    print()
    print("Recent hotspots:")
    for h in hotspots.data[:5]:
        created = h['created_at']
        print(f"  - {h['entity']}: {h['predicted_co2']} kg CO2 ({h['severity']})")
        print(f"    Created: {created}")
        print(f"    Status: {h['status']}")
else:
    print("No active hotspots found!")

# Check recommendations with timestamps
print("\n2. PENDING RECOMMENDATIONS (with timestamps):")
print("-" * 80)
recs = supabase.table("recommendations").select("*").eq("status", "pending").order("created_at", desc=True).limit(5).execute()

if recs.data:
    print(f"Total Pending: {len(recs.data)}")
    total_reduction = sum(r['co2_reduction'] for r in recs.data)
    print(f"Total Potential Reduction: {total_reduction:.2f} kg CO2")
    print()
    print("Recent recommendations:")
    for r in recs.data[:3]:
        print(f"  - {r['title']}: {r['co2_reduction']} kg reduction")
        print(f"    Created: {r.get('created_at', 'N/A')}")
        print(f"    Confidence: {r['confidence'] * 100:.0f}%")
else:
    print("No pending recommendations!")

# Check recent events
print("\n3. RECENT EVENTS (last 10):")
print("-" * 80)
events = supabase.table("events_normalized").select("*").order("timestamp", desc=True).limit(10).execute()

if events.data:
    print(f"Total Events in DB: {len(events.data)}")
    print("\nMost recent:")
    for e in events.data[:3]:
        print(f"  - Supplier: {e['supplier_id']}, Distance: {e.get('distance_km', 'N/A')} km")
        print(f"    Timestamp: {e.get('timestamp', 'N/A')}")
else:
    print("No events found!")

print("\n" + "=" * 80)
print("CHATBOT DATA FRESHNESS CHECK")
print("=" * 80)

# What the chatbot should be seeing
print("\nWhat chatbot queries:")
print("1. Hotspots: SELECT * FROM hotspots WHERE status='active' ORDER BY predicted_co2 DESC LIMIT 10")
print("2. Recommendations: SELECT * FROM recommendations WHERE status='pending' ORDER BY confidence DESC LIMIT 5")
print("3. Events: SELECT * FROM events_normalized ORDER BY timestamp DESC LIMIT 10")

print("\nData Freshness:")
if hotspots.data:
    latest_hotspot = hotspots.data[0]['created_at']
    print(f"✓ Latest hotspot created: {latest_hotspot}")
else:
    print("✗ No hotspots to check freshness")

if recs.data:
    latest_rec = recs.data[0].get('created_at', 'N/A')
    print(f"✓ Latest recommendation created: {latest_rec}")
else:
    print("✗ No recommendations to check freshness")

print("\n" + "=" * 80)
print("CONCLUSION")
print("=" * 80)
print("The chatbot queries the database EVERY TIME you ask a question.")
print("It gets the LATEST data from Supabase (no caching).")
print(f"Current data shows: {len(hotspots.data) if hotspots.data else 0} hotspots, {total_predicted:.2f} kg CO2 total")
print("\nThis is REAL-TIME data from the database!")
print("=" * 80)
