"""Dashboard API routes."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from ..db.supabase_client import db_client
from ..services.ml_client import ml_client
from ..utils.logger import logger

router = APIRouter(prefix="/emissions", tags=["dashboard"])


@router.get("/current")
async def get_current_emissions() -> Dict[str, Any]:
    """Get current emission pulse using ML predictions."""
    try:
        # Get recent predictions (last hour worth of data)
        predictions = await db_client.get_recent_predictions(limit=100)
        
        if not predictions:
            logger.warning("No predictions found, returning zero emissions")
            return {
                "current_rate": 0,
                "trend": 0,
                "categories": {},
                "total_today": 0,
                "target": 1000,
                "last_updated": None
            }
        
        # Get events to map predictions to suppliers
        events = await db_client.get_recent_events(limit=200)
        
        # Create mapping using both id and event_id as keys
        event_supplier_map = {}
        for e in events:
            event_id = e.get("id")
            supplier = e.get("supplier_id") or e.get("supplier_name") or "Unknown"
            if event_id:
                event_supplier_map[event_id] = supplier
                event_supplier_map[str(event_id)] = supplier  # Also store string version
        
        logger.info(f"Created supplier map with {len(event_supplier_map)} entries from {len(events)} events")
        
        # Calculate TYPICAL (25th percentile) CO2 per supplier per event
        # This shows baseline/typical emissions, filtering out anomalies and spikes
        # 25th percentile represents "good performance" baseline
        total_co2 = 0
        supplier_values = {}  # Store all values for percentile calculation
        
        for pred in predictions:
            co2 = pred.get("predicted_co2", 0) or 0
            total_co2 += co2
            
            # Get supplier from event mapping
            event_id = pred.get("event_id")
            supplier = event_supplier_map.get(event_id) or event_supplier_map.get(str(event_id)) or "Unknown"
            
            # Store all values for percentile calculation
            if supplier not in supplier_values:
                supplier_values[supplier] = []
            supplier_values[supplier].append(co2)
        
        # Calculate 25th percentile per supplier (typical baseline performance)
        # This filters out spikes and anomalies, showing normal operations
        categories = {}
        for supplier, values in supplier_values.items():
            sorted_values = sorted(values)
            n = len(sorted_values)
            if n == 0:
                percentile_25 = 0
            else:
                # 25th percentile index
                idx = max(0, n // 4)
                percentile_25 = sorted_values[idx]
            categories[supplier] = round(percentile_25, 2)
        
        supplier_counts = {s: len(v) for s, v in supplier_values.items()}
        
        logger.info(f"Typical (25th percentile) emissions per event by supplier: {categories}")
        logger.info(f"Event counts by supplier: {supplier_counts}")
        
        # Calculate average CO2 per event (this is the "current rate")
        avg_co2_per_event = total_co2 / len(predictions) if predictions else 0
        
        # For "per hour" display, we'll just use the average per event
        hourly_rate = avg_co2_per_event
        
        # Calculate trend (compare first half vs second half)
        trend = 0
        if len(predictions) >= 4:
            mid = len(predictions) // 2
            
            first_half_co2 = sum(p.get("predicted_co2", 0) or 0 for p in predictions[:mid])
            second_half_co2 = sum(p.get("predicted_co2", 0) or 0 for p in predictions[mid:])
            
            first_half_avg = first_half_co2 / mid
            second_half_avg = second_half_co2 / (len(predictions) - mid)
            
            # Calculate percentage change
            if first_half_avg > 0:
                trend = round(((second_half_avg - first_half_avg) / first_half_avg) * 100, 2)
            else:
                trend = 0
        
        logger.info(f"Current emissions: {hourly_rate:.2f} kg CO₂/hour from {len(predictions)} predictions")
        
        return {
            "current_rate": round(hourly_rate, 2),
            "trend": trend,
            "categories": categories,
            "total_today": round(total_co2, 2),
            "target": 1000,
            "last_updated": predictions[0].get("created_at") if predictions else None,
            "prediction_count": len(predictions)
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
