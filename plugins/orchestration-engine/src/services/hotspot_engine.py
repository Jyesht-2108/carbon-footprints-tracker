"""Hotspot detection engine."""
from typing import Dict, Any, Optional, List
from datetime import datetime
from ..utils.config import settings
from ..utils.logger import logger
from ..db.supabase_client import db_client
from .ml_client import ml_client
from .rag_client import rag_client


class HotspotEngine:
    """Engine for detecting emission hotspots."""
    
    def __init__(self):
        """Initialize hotspot engine."""
        self.thresholds = {
            "info": settings.threshold_info,
            "warn": settings.threshold_warn,
            "critical": settings.threshold_critical
        }
    
    def calculate_severity(self, predicted: float, baseline: float) -> str:
        """Calculate hotspot severity level."""
        if baseline == 0:
            return "critical"
        
        ratio = predicted / baseline
        
        if ratio >= self.thresholds["critical"]:
            return "critical"
        elif ratio >= self.thresholds["warn"]:
            return "warn"
        elif ratio >= self.thresholds["info"]:
            return "info"
        else:
            return "normal"
    
    def calculate_percent_above(self, predicted: float, baseline: float) -> float:
        """Calculate percentage above baseline."""
        if baseline == 0:
            return 100.0
        return ((predicted - baseline) / baseline) * 100
    
    async def detect_hotspots_for_event(self, event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Detect hotspot for a single event."""
        try:
            # Determine entity and type
            entity = event.get("supplier_id") or event.get("route_id") or "Unknown"  # Fixed: was supplier_name
            entity_type = "supplier" if event.get("supplier_id") else "route"
            
            # Get prediction based on event type
            predicted_co2 = await self._get_prediction(event)
            if predicted_co2 is None:
                logger.warning(f"Could not get prediction for event {event.get('id')}")
                return None
            
            # Get baseline
            baseline = await db_client.get_baseline(entity, entity_type)
            if baseline is None:
                # Calculate baseline from recent history
                baseline = await self._calculate_baseline(entity, entity_type)
                if baseline is None:
                    # First upload - use current prediction as baseline
                    logger.info(f"First data for {entity}, establishing baseline at {predicted_co2:.2f} kg CO₂")
                    await db_client.upsert_baseline({
                        "entity": entity,
                        "entity_type": entity_type,
                        "baseline_value": predicted_co2,
                        "updated_at": datetime.utcnow().isoformat()
                    })
                    # Don't create hotspot for baseline establishment
                    return None
                else:
                    # Save calculated baseline
                    await db_client.upsert_baseline({
                        "entity": entity,
                        "entity_type": entity_type,
                        "baseline_value": baseline,
                        "updated_at": datetime.utcnow().isoformat()
                    })
            
            # Calculate severity
            severity = self.calculate_severity(predicted_co2, baseline)
            
            # Only create hotspot if above info threshold
            if severity == "normal":
                return None
            
            percent_above = self.calculate_percent_above(predicted_co2, baseline)
            
            # Create hotspot
            hotspot = {
                "entity": entity,
                "entity_type": entity_type,
                "predicted_co2": predicted_co2,
                "baseline_co2": baseline,
                "percent_above": percent_above,
                "severity": severity,
                "status": "active",
                "event_id": event.get("id"),
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Insert hotspot
            inserted_hotspot = await db_client.insert_hotspot(hotspot)
            if not inserted_hotspot:
                return None
            
            logger.info(f"Hotspot detected: {entity} ({severity}) - {percent_above:.1f}% above baseline")
            
            # Generate alert
            await self._generate_alert(inserted_hotspot)
            
            # Generate recommendations via RAG
            await self._generate_recommendations(inserted_hotspot)
            
            # Emit WebSocket event
            try:
                from .websocket_manager import ws_manager
                await ws_manager.emit_hotspot(inserted_hotspot)
            except Exception as e:
                logger.error(f"Error emitting hotspot via WebSocket: {e}")
            
            return inserted_hotspot
            
        except Exception as e:
            logger.error(f"Error detecting hotspot: {e}")
            return None
    
    async def _get_prediction(self, event: Dict[str, Any]) -> Optional[float]:
        """Get ML prediction for event."""
        # Determine event type and prepare features
        prediction_type = event.get("event_type", "").lower()
        predicted_co2 = None
        features = {}
        
        # Use event_type field to determine which prediction to make
        if prediction_type == "logistics":
            # Logistics event - ensure all required fields are present and valid
            distance = float(event.get("distance_km", 0) or 0)
            load = float(event.get("load_kg", 0) or 0)
            
            # Skip if missing critical data
            if distance <= 0 or load <= 0:
                logger.warning(f"Skipping logistics prediction - invalid data: distance={distance}, load={load}")
                return None
            
            features = {
                "distance_km": distance,
                "load_kg": load,
                "vehicle_type": event.get("vehicle_type", "truck"),
                "fuel_type": event.get("fuel_type", "diesel"),
                "avg_speed": float(event.get("speed", 50) or 50),
                "stop_events": int(event.get("stop_events", 0) or 0)
            }
            predicted_co2 = await ml_client.predict_logistics(features)
            
        elif prediction_type == "factory":
            # Factory event - ensure all required fields are present and valid
            energy = float(event.get("energy_kwh", 0) or 0)
            shift_hours = float(event.get("shift_hours", 8) or 8)
            
            # Skip if missing critical data
            if energy <= 0 or shift_hours <= 0:
                logger.warning(f"Skipping factory prediction - invalid data: energy={energy}, shift_hours={shift_hours}")
                return None
            
            features = {
                "energy_kwh": energy,
                "shift_hours": shift_hours,
                "machine_runtime_hours": shift_hours,  # Use shift_hours as default
                "furnace_usage": float(event.get("furnace_usage", 0) or 0),
                "cooling_load": float(event.get("cooling_load", 0) or 0)
            }
            predicted_co2 = await ml_client.predict_factory(features)
            
        elif prediction_type == "warehouse":
            # Warehouse event - temperature is required
            temperature = float(event.get("temperature", 20) or 20)
            
            features = {
                "temperature": temperature,
                "energy_kwh": float(event.get("energy_kwh", 0) or 0),
                "refrigeration_load": float(event.get("refrigeration_load", 0) or 0),
                "inventory_volume": float(event.get("inventory_volume", 0) or 0)
            }
            predicted_co2 = await ml_client.predict_warehouse(features)
            
        elif prediction_type == "delivery":
            # Delivery event - ensure route_length is valid
            route_length = float(event.get("distance_km", 0) or 0)
            
            # Skip if missing critical data
            if route_length <= 0:
                logger.warning(f"Skipping delivery prediction - invalid route_length: {route_length}")
                return None
            
            features = {
                "route_length": route_length,
                "vehicle_type": event.get("vehicle_type", "truck"),
                "traffic_score": int(event.get("traffic_score", 3) or 3),
                "delivery_count": int(event.get("delivery_count", 1) or 1)
            }
            predicted_co2 = await ml_client.predict_delivery(features)
        
        else:
            logger.warning(f"Unknown event type: {prediction_type}")
            return None
        
        # Save prediction to database
        if predicted_co2 is not None:
            await db_client.insert_prediction({
                "event_id": event.get("id"),
                "prediction_type": prediction_type,
                "predicted_co2": predicted_co2,
                "confidence_score": 0.85,  # Default confidence
                "model_version": "v1.0",
                "features": features
            })
        
        return predicted_co2
    
    async def _calculate_baseline(self, entity: str, entity_type: str) -> Optional[float]:
        """Calculate baseline from historical predictions."""
        try:
            # Get predictions for this entity from the predictions table
            predictions = await db_client.get_predictions_by_entity(entity, limit=50)
            
            if not predictions or len(predictions) < 5:
                # Not enough data for baseline - use first batch as baseline
                logger.info(f"Insufficient historical data for {entity}, using current predictions as baseline")
                return None  # Will trigger baseline creation from current batch
            
            # Calculate average CO2 from historical predictions
            co2_values = [p.get("predicted_co2") for p in predictions if p.get("predicted_co2")]
            
            if not co2_values:
                return None
            
            # Use median to avoid outlier influence
            import statistics
            baseline = statistics.median(co2_values)
            
            logger.info(f"Calculated baseline for {entity}: {baseline:.2f} kg CO₂ (from {len(co2_values)} predictions)")
            return baseline
            
        except Exception as e:
            logger.error(f"Error calculating baseline: {e}")
            return None
    
    async def _generate_alert(self, hotspot: Dict[str, Any]) -> None:
        """Generate alert for hotspot."""
        try:
            alert = {
                "level": hotspot["severity"],
                "message": f"{hotspot['entity']} exceeded emissions by {hotspot['percent_above']:.1f}%",
                "hotspot_id": hotspot["id"],
                "created_at": datetime.utcnow().isoformat()
            }
            
            inserted_alert = await db_client.insert_alert(alert)
            logger.info(f"Alert generated for hotspot {hotspot['id']}")
            
            # Emit WebSocket event
            if inserted_alert:
                try:
                    from .websocket_manager import ws_manager
                    await ws_manager.emit_alert(inserted_alert)
                except Exception as e:
                    logger.error(f"Error emitting alert via WebSocket: {e}")
            
        except Exception as e:
            logger.error(f"Error generating alert: {e}")
    
    async def _generate_recommendations(self, hotspot: Dict[str, Any]) -> None:
        """Generate recommendations via RAG for hotspot."""
        try:
            # Check if recommendations already exist for this entity (caching)
            existing_recs = await db_client.get_recommendations_by_entity(
                hotspot["entity"], 
                status="pending"
            )
            
            # If we already have pending recommendations for this entity, skip RAG call
            if existing_recs and len(existing_recs) > 0:
                logger.info(f"Using cached recommendations for {hotspot['entity']} (found {len(existing_recs)} existing)")
                return
            
            # Prepare hotspot reason
            reason = f"Emissions {hotspot['percent_above']:.1f}% above baseline"
            
            # Call RAG service only if no cached recommendations
            result = await rag_client.generate_recommendations(
                supplier=hotspot["entity"],
                predicted=hotspot["predicted_co2"],
                baseline=hotspot["baseline_co2"],
                hotspot_reason=reason,
                hotspot_id=hotspot["id"]
            )
            
            if result:
                logger.info(f"Recommendations generated for hotspot {hotspot['id']}")
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
    
    async def scan_for_hotspots(self, limit: int = 200) -> List[Dict[str, Any]]:
        """Scan recent events for hotspots."""
        try:
            logger.info(f"Starting hotspot scan (processing up to {limit} events)...")
            
            # Get recent events (increased limit for faster processing after upload)
            events = await db_client.get_events_without_predictions(limit=limit)
            
            if not events:
                logger.info("No events to process")
                return []
            
            logger.info(f"Processing {len(events)} events for predictions...")
            
            hotspots = []
            predictions_generated = 0
            
            for idx, event in enumerate(events, 1):
                try:
                    hotspot = await self.detect_hotspots_for_event(event)
                    if hotspot:
                        hotspots.append(hotspot)
                    predictions_generated += 1
                    
                    # Log progress every 10 events
                    if idx % 10 == 0:
                        logger.info(f"Progress: {idx}/{len(events)} events processed, {len(hotspots)} hotspots found")
                        
                except Exception as e:
                    logger.error(f"Error processing event {event.get('id')}: {e}")
                    continue
            
            logger.info(f"✅ Hotspot scan complete. Processed {predictions_generated} events, found {len(hotspots)} hotspots.")
            return hotspots
            
        except Exception as e:
            logger.error(f"Error scanning for hotspots: {e}")
            return []


# Singleton instance
hotspot_engine = HotspotEngine()
