#!/usr/bin/env python3
"""Test script to verify all services are running and properly configured."""

import requests
import sys

def test_service(name, url, port):
    """Test if a service is responding."""
    try:
        response = requests.get(f"{url}/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ {name} (port {port}): HEALTHY")
            return True
        else:
            print(f"⚠️  {name} (port {port}): Responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ {name} (port {port}): NOT RUNNING")
        return False
    except Exception as e:
        print(f"❌ {name} (port {port}): ERROR - {e}")
        return False

def test_trigger_analysis():
    """Test the trigger-analysis endpoint."""
    try:
        response = requests.post("http://localhost:8003/trigger-analysis", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Trigger Analysis: SUCCESS")
            print(f"   Hotspots detected: {data.get('hotspots_detected', 0)}")
            return True
        else:
            print(f"⚠️  Trigger Analysis: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Trigger Analysis: ERROR - {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("Service Connectivity Test")
    print("=" * 60)
    print()
    
    results = []
    
    # Test all services
    results.append(test_service("ML Engine", "http://localhost:8001", 8001))
    results.append(test_service("Data Core", "http://localhost:8002", 8002))
    results.append(test_service("Orchestration Engine", "http://localhost:8003", 8003))
    
    print()
    print("=" * 60)
    print("Testing Analysis Trigger")
    print("=" * 60)
    print()
    
    results.append(test_trigger_analysis())
    
    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    
    if all(results):
        print("✅ All tests passed! Services are properly configured.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
