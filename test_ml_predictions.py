#!/usr/bin/env python3
"""Test ML Engine predictions with valid and invalid data."""
import requests
import json

ML_ENGINE_URL = "http://localhost:8001"

def test_logistics_valid():
    """Test logistics with valid data."""
    payload = {
        "distance_km": 100.0,
        "load_kg": 5000.0,
        "vehicle_type": "truck",
        "fuel_type": "diesel",
        "avg_speed": 60.0,
        "stop_events": 2
    }
    response = requests.post(f"{ML_ENGINE_URL}/api/v1/predict/logistics", json=payload)
    print(f"✓ Logistics (valid): {response.status_code} - {response.json() if response.status_code == 200 else response.text}")

def test_logistics_invalid():
    """Test logistics with invalid data (missing required fields)."""
    payload = {
        "distance_km": 0,  # Invalid: must be > 0
        "load_kg": 5000.0,
        "vehicle_type": "truck",
        "fuel_type": "diesel"
    }
    response = requests.post(f"{ML_ENGINE_URL}/api/v1/predict/logistics", json=payload)
    print(f"✗ Logistics (invalid): {response.status_code} - {response.text[:100]}")

def test_factory_valid():
    """Test factory with valid data."""
    payload = {
        "energy_kwh": 1000.0,
        "shift_hours": 8.0,
        "machine_runtime_hours": 8.0,
        "furnace_usage": 500.0,
        "cooling_load": 200.0
    }
    response = requests.post(f"{ML_ENGINE_URL}/api/v1/predict/factory", json=payload)
    print(f"✓ Factory (valid): {response.status_code} - {response.json() if response.status_code == 200 else response.text}")

def test_factory_invalid():
    """Test factory with invalid data."""
    payload = {
        "energy_kwh": 0,  # Invalid: must be > 0
        "shift_hours": 8.0
    }
    response = requests.post(f"{ML_ENGINE_URL}/api/v1/predict/factory", json=payload)
    print(f"✗ Factory (invalid): {response.status_code} - {response.text[:100]}")

def test_warehouse_valid():
    """Test warehouse with valid data."""
    payload = {
        "temperature": 20.0,
        "energy_kwh": 500.0,
        "refrigeration_load": 100.0,
        "inventory_volume": 1000.0
    }
    response = requests.post(f"{ML_ENGINE_URL}/api/v1/predict/warehouse", json=payload)
    print(f"✓ Warehouse (valid): {response.status_code} - {response.json() if response.status_code == 200 else response.text}")

if __name__ == "__main__":
    print("Testing ML Engine predictions...\n")
    test_logistics_valid()
    test_logistics_invalid()
    print()
    test_factory_valid()
    test_factory_invalid()
    print()
    test_warehouse_valid()
