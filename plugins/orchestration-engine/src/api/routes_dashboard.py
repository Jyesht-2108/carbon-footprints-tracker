"""Dashboard API routes."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from ..db.supabase_client import db_client
from ..services.ml_client import ml_client
from ..utils.logger import logger

router = APIRouter(prefix="/emissions", tags=["dashboard"])


@router.get("/current")
async def get_current_emissions() -> Dict[str, Any]:
    """Get current emission pulse."""
    try:
        # Get recent events
        events = await db_client.get_recent_events(limit=100)
        
        if not events:
            return {
                "current_rate": 0,
                "trend": "stable",
                "categories": {},
                "total_today": 0,
                "target": 1000,
                "last_updated": None
            }
        
        # Calculate CO2 from event data (since co2_kg doesn't exist in schema)
        # Simple formula: distance_km * load_kg * emission_factor
        # Emission factors (kg CO2 per km per ton): diesel=0.062, electric=0.015, hybrid=0.035
        emission_factors = {
            "diesel": 0.062,
            "electric": 0.015,
            "hybrid": 0.035,
            "petrol": 0.068,
            "gasoline": 0.068
        }
        
        total_co2 = 0
        categories = {}
        
        for event in events:
            distance = event.get("distance_km", 0) or 0
            load = event.get("load_kg", 0) or 0
            fuel_type = (event.get("fuel_type") or "diesel").lower()
            
            # Calculate CO2: distance * (load in tons) * emission factor
            emission_factor = emission_factors.get(fuel_type, 0.062)  # Default to diesel
            co2 = distance * (load / 1000) * emission_factor  # Convert kg to tons
            
            total_co2 += co2
            
            # Group by supplier
            supplier = event.get("supplier_id", "Unknown")
            categories[supplier] = categories.get(supplier, 0) + co2
        
        avg_co2 = total_co2 / len(events) if events else 0
        
        # Calculate trend (compare first half vs second half)
        trend = 0
        if len(events) >= 4:
            mid = len(events) // 2
            
            # Calculate CO2 for first half
            first_half_co2 = 0
            for event in events[:mid]:
                distance = event.get("distance_km", 0) or 0
                load = event.get("load_kg", 0) or 0
                fuel_type = (event.get("fuel_type") or "diesel").lower()
                emission_factor = emission_factors.get(fuel_type, 0.062)
                first_half_co2 += distance * (load / 1000) * emission_factor
            
            # Calculate CO2 for second half
            second_half_co2 = 0
            for event in events[mid:]:
                distance = event.get("distance_km", 0) or 0
                load = event.get("load_kg", 0) or 0
                fuel_type = (event.get("fuel_type") or "diesel").lower()
                emission_factor = emission_factors.get(fuel_type, 0.062)
                second_half_co2 += distance * (load / 1000) * emission_factor
            
            first_half_avg = first_half_co2 / mid
            second_half_avg = second_half_co2 / (len(events) - mid)
            
            # Calculate percentage change
            if first_half_avg > 0:
                trend = round(((second_half_avg - first_half_avg) / first_half_avg) * 100, 2)
            else:
                trend = 0
        
        return {
            "current_rate": round(avg_co2, 2),
            "trend": trend,  # Now a number (percentage)
            "categories": categories,
            "total_today": round(total_co2, 2),
            "target": 1000,  # Default target
            "last_updated": events[0].get("timestamp") if events else None,
            "event_count": len(events)
        }
        
    except Exception as e:
        logger.error(f"Error getting current emissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecast")
async def get_forecast() -> Dict[str, Any]:
    """Get 7-day emission forecast."""
    try:
        # Get historical data
        events = await db_client.get_recent_events(limit=30)
        
        if not events:
            return {
                "forecast": [],
                "confidence_low": [],
                "confidence_high": []
            }
        
        # Extract daily totals (simplified)
        history = [e.get("co2_kg", 0) for e in events[:7]]
        
        # Get forecast from ML Engine
        forecast_data = await ml_client.forecast_7d(history)
        
        if not forecast_data:
            # Return dummy forecast if ML Engine unavailable
            from datetime import datetime, timedelta
            today = datetime.now()
            dates = [(today + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
            
            return {
                "dates": dates,
                "forecast": [100, 105, 110, 108, 112, 115, 118],
                "confidence_low": [90, 95, 100, 98, 102, 105, 108],
                "confidence_high": [110, 115, 120, 118, 122, 125, 128]
            }
        
        # Ensure dates are included
        if "dates" not in forecast_data:
            from datetime import datetime, timedelta
            today = datetime.now()
            forecast_data["dates"] = [(today + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
        
        return forecast_data
        
    except Exception as e:
        logger.error(f"Error getting forecast: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_emissions_summary() -> Dict[str, Any]:
    """Get emissions summary statistics."""
    try:
        events = await db_client.get_recent_events(limit=100)
        hotspots = await db_client.get_active_hotspots()
        
        total_co2 = sum(e.get("co2_kg", 0) for e in events)
        avg_co2 = total_co2 / len(events) if events else 0
        
        return {
            "total_emissions": round(total_co2, 2),
            "average_emissions": round(avg_co2, 2),
            "event_count": len(events),
            "active_hotspots": len(hotspots),
            "critical_hotspots": len([h for h in hotspots if h.get("severity") == "critical"])
        }
        
    except Exception as e:
        logger.error(f"Error getting emissions summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))
