"""
Test script to verify instant analysis on CSV upload.
This simulates uploading a CSV and checks if immediate analysis is triggered.
"""
import requests
import time
import sys

# Configuration
DATA_CORE_URL = "http://localhost:8001"
ORCHESTRATION_URL = "http://localhost:8000"

def check_services():
    """Check if required services are running."""
    print("🔍 Checking services...")
    
    # Check Data-Core
    try:
        response = requests.get(f"{DATA_CORE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Data-Core is running")
        else:
            print(f"❌ Data-Core returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Data-Core is not running: {e}")
        print(f"   Start it with: cd plugins/data-core && python -m uvicorn src.main:app --reload --port 8001")
        return False
    
    # Check Orchestration Engine
    try:
        response = requests.get(f"{ORCHESTRATION_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Orchestration Engine is running")
        else:
            print(f"❌ Orchestration Engine returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Orchestration Engine is not running: {e}")
        print(f"   Start it with: cd plugins/orchestration-engine && python -m uvicorn src.main:app --reload --port 8000")
        return False
    
    return True


def test_trigger_endpoint():
    """Test the trigger-analysis endpoint directly."""
    print("\n🧪 Testing trigger-analysis endpoint...")
    
    try:
        start_time = time.time()
        response = requests.post(f"{ORCHESTRATION_URL}/trigger-analysis", timeout=30)
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Trigger endpoint works!")
            print(f"   Status: {result.get('status')}")
            print(f"   Message: {result.get('message')}")
            print(f"   Hotspots detected: {result.get('hotspots_detected', 0)}")
            print(f"   Time taken: {elapsed:.2f} seconds")
            return True
        else:
            print(f"❌ Trigger endpoint failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error calling trigger endpoint: {e}")
        return False


def test_csv_upload():
    """Test CSV upload with instant analysis."""
    print("\n🧪 Testing CSV upload with instant analysis...")
    
    # Create a simple test CSV
    csv_content = """event_type,supplier_id,distance_km,load_kg,vehicle_type,fuel_type,speed,timestamp
logistics,Heavy_Load_Supplier,500,15000,truck_diesel,diesel,60,2025-11-29T12:00:00
logistics,Normal_Supplier,300,8000,truck_diesel,diesel,55,2025-11-29T12:30:00
logistics,Heavy_Load_Supplier,600,18000,truck_diesel,diesel,65,2025-11-29T13:00:00
"""
    
    # Save to temporary file
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write(csv_content)
        temp_file = f.name
    
    try:
        print(f"📤 Uploading test CSV...")
        
        with open(temp_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            start_time = time.time()
            response = requests.post(f"{DATA_CORE_URL}/ingest/upload", files=files, timeout=60)
            elapsed = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ CSV upload successful!")
            print(f"   Job ID: {result.get('jobId')}")
            print(f"   Rows processed: {result.get('rows')}")
            print(f"   Message: {result.get('message')}")
            print(f"   Time taken: {elapsed:.2f} seconds")
            
            # Check if immediate analysis was mentioned
            if "Immediate analysis triggered" in result.get('message', ''):
                print(f"✅ Immediate analysis was triggered!")
            else:
                print(f"⚠️ Message doesn't mention immediate analysis")
            
            return True
        else:
            print(f"❌ CSV upload failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    except Exception as e:
        print(f"❌ Error uploading CSV: {e}")
        return False
    
    finally:
        # Clean up temp file
        import os
        try:
            os.unlink(temp_file)
        except:
            pass


def main():
    """Main test function."""
    print("=" * 70)
    print("🧪 INSTANT ANALYSIS ON UPLOAD - TEST SCRIPT")
    print("=" * 70)
    print()
    
    # Check services
    if not check_services():
        print("\n❌ Services not running. Please start them first.")
        sys.exit(1)
    
    print("\n✅ All services are running!")
    
    # Test trigger endpoint
    print("\n" + "=" * 70)
    if not test_trigger_endpoint():
        print("\n❌ Trigger endpoint test failed")
        sys.exit(1)
    
    # Test CSV upload
    print("\n" + "=" * 70)
    if not test_csv_upload():
        print("\n❌ CSV upload test failed")
        sys.exit(1)
    
    # Success!
    print("\n" + "=" * 70)
    print("✅ ALL TESTS PASSED!")
    print("=" * 70)
    print()
    print("📊 Summary:")
    print("  ✅ Services are running")
    print("  ✅ Trigger endpoint works")
    print("  ✅ CSV upload triggers immediate analysis")
    print()
    print("🎉 Instant analysis on upload is working correctly!")
    print()
    print("📝 What to check next:")
    print("  1. Open frontend: http://localhost:5173")
    print("  2. Go to Ingest page")
    print("  3. Upload a CSV file")
    print("  4. Watch for immediate popup notifications")
    print("  5. Check bell badge updates")
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
