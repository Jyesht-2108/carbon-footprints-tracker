from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('plugins/orchestration-engine/.env')

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

print("=" * 80)
print("ACTIVE HOTSPOTS")
print("=" * 80)

hotspots = supabase.table('hotspots').select('*').eq('status', 'active').order('predicted_co2', desc=True).limit(10).execute()

for h in hotspots.data:
    print(f"\nEntity: {h['entity']}")
    print(f"  Type: {h['entity_type']}")
    print(f"  Predicted CO2: {h['predicted_co2']} kg")
    print(f"  Baseline CO2: {h['baseline_co2']} kg")
    print(f"  Percent Above: {h['percent_above']}%")
    print(f"  Severity: {h['severity']}")

print("\n" + "=" * 80)
print(f"Total active hotspots: {len(hotspots.data)}")
