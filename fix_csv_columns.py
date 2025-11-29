#!/usr/bin/env python3
"""
Fix CSV files to have exactly 15 columns
"""
import csv

files = [
    'upload-data/demo_upload_1_baseline.csv',
    'upload-data/demo_upload_2_increased_activity.csv',
    'upload-data/demo_upload_3_critical_hotspots.csv'
]

expected_columns = [
    'supplier_id', 'timestamp', 'event_type', 'distance_km', 'load_kg',
    'vehicle_type', 'fuel_type', 'speed', 'energy_kwh', 'furnace_usage',
    'cooling_load', 'shift_hours', 'temperature', 'refrigeration_load', 'inventory_volume'
]

for filename in files:
    print(f"Fixing {filename}...")
    
    rows = []
    with open(filename, 'r') as f:
        reader = csv.reader(f)
        header = next(reader)
        
        print(f"  Original header columns: {len(header)}")
        print(f"  Header: {header}")
        
        # Use expected header
        rows.append(expected_columns)
        
        for i, row in enumerate(reader, start=2):
            # Ensure exactly 15 columns
            if len(row) < 15:
                row.extend([''] * (15 - len(row)))
            elif len(row) > 15:
                row = row[:15]
            
            rows.append(row)
    
    # Write back
    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    
    print(f"  Fixed! Total rows: {len(rows)}")

print("Done!")
