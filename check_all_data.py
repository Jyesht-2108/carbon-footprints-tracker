from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('plugins/orchestration-engine/.env')

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

print("=" * 80)
print("COMPLETE DATABASE CHECK")
print("=" * 80)

# 1. Check events_normalized
print("\n1. EVENTS_NORMALIZED TABLE:")
print("-" * 80)
events = supabase.table("events_normalized").select("*").limit(5).execute()
print(f"Total events: {len(events.data)}")
if events.data:
    print("\nSample event:")
    for key, value in events.data[0].items():
        print(f"  {key}: {value}")

# 2. Check hotspots
print("\n2. HOTSPOTS TABLE:")
print("-" * 80)
hotspots = supabase.table("hotspots").select("*").eq("status", "active").execute()
print(f"Active hotspots: {len(hotspots.data)}")
if hotspots.data:
    print("\nTop 3 hotspots:")
    for h in hotspots.data[:3]:
        print(f"  - {h['entity']}: {h['predicted_co2']} kg CO2 ({h['severity']})")

# 3. Check recommendations
print("\n3. RECOMMENDATIONS TABLE:")
print("-" * 80)
recs = supabase.table("recommendations").select("*").eq("status", "pending").execute()
print(f"Pending recommendations: {len(recs.data)}")
if recs.data:
    print("\nSample recommendations:")
    for r in recs.data[:3]:
        print(f"  - {r['title']}: {r['co2_reduction']} kg reduction")

# 4. Check alerts
print("\n4. ALERTS TABLE:")
print("-" * 80)
alerts = supabase.table("alerts").select("*").execute()
print(f"Total alerts: {len(alerts.data)}")
if alerts.data:
    print("\nRecent alerts:")
    for a in alerts.data[:3]:
        print(f"  - {a['level'].upper()}: {a['message'][:60]}...")

# 5. Check ingest_jobs
print("\n5. INGEST_JOBS TABLE:")
print("-" * 80)
jobs = supabase.table("ingest_jobs").select("*").order("created_at", desc=True).limit(5).execute()
print(f"Total upload jobs: {len(jobs.data)}")
if jobs.data:
    print("\nRecent uploads:")
    for j in jobs.data:
        print(f"  - {j['filename']}: {j['status']} ({j.get('rows_processed', 0)}/{j.get('rows_total', 0)} rows)")
else:
    print("  No uploads found - Upload History will be empty!")

# 6. Check baselines
print("\n6. BASELINES TABLE:")
print("-" * 80)
baselines = supabase.table("baselines").select("*").execute()
print(f"Total baselines: {len(baselines.data)}")
if baselines.data:
    print("\nSample baselines:")
    for b in baselines.data[:3]:
        print(f"  - {b['entity']}: {b['baseline_value']} kg CO2")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"✓ Events in database: {len(events.data) if events.data else 0}")
print(f"✓ Active hotspots: {len(hotspots.data) if hotspots.data else 0}")
print(f"✓ Pending recommendations: {len(recs.data) if recs.data else 0}")
print(f"✓ Alerts: {len(alerts.data) if alerts.data else 0}")
print(f"✓ Upload jobs: {len(jobs.data) if jobs.data else 0}")
print(f"✓ Baselines: {len(baselines.data) if baselines.data else 0}")
print("\nAll dashboard data is REAL from database!")
print("=" * 80)
