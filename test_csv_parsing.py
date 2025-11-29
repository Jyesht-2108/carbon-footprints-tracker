#!/usr/bin/env python3
"""
Test CSV parsing to identify the issue
"""
import pandas as pd

files = [
    'upload-data/demo_upload_1_baseline.csv',
    'upload-data/demo_upload_2_increased_activity.csv',
    'upload-data/demo_upload_3_critical_hotspots.csv'
]

for file in files:
    print(f"\n{'='*60}")
    print(f"Testing: {file}")
    print('='*60)
    
    try:
        # Try normal parsing
        df = pd.read_csv(file)
        print(f"✅ Success! Rows: {len(df)}, Columns: {len(df.columns)}")
        print(f"Columns: {list(df.columns)}")
        
        # Check for any issues
        print(f"\nFirst row:")
        print(df.iloc[0])
        
        print(f"\nLast row:")
        print(df.iloc[-1])
        
    except pd.errors.ParserError as e:
        print(f"❌ Parser Error: {e}")
        
        # Try with on_bad_lines='skip'
        try:
            df = pd.read_csv(file, on_bad_lines='skip')
            print(f"✅ Recovered with skip: Rows: {len(df)}, Columns: {len(df.columns)}")
        except Exception as e2:
            print(f"❌ Still failed: {e2}")
    
    except Exception as e:
        print(f"❌ Error: {e}")

print(f"\n{'='*60}")
print("Test complete!")
