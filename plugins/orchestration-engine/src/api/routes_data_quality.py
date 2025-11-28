"""Data quality API routes."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..db.supabase_client import db_client
from ..utils.logger import logger

router = APIRouter(prefix="/data-quality", tags=["data-quality"])


@router.get("")
async def get_data_quality() -> Dict[str, Any]:
    """Get overall data quality metrics."""
    try:
        # Get quality metrics from database
        response = db_client.client.table("data_quality")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if response.data and len(response.data) > 0:
            quality = response.data[0]
            return {
                "completeness_pct": quality.get("completeness_pct", 0),
                "predicted_pct": quality.get("predicted_pct", 0),
                "anomalies_count": quality.get("anomalies_count", 0),
                "total_rows": quality.get("total_rows", 0),
                "last_updated": quality.get("created_at")
            }
        
        # Return defaults if no data
        return {
            "completeness_pct": 100,
            "predicted_pct": 0,
            "anomalies_count": 0,
            "total_rows": 0,
            "last_updated": None
        }
        
    except Exception as e:
        logger.error(f"Error getting data quality: {e}")
        raise HTTPException(status_code=500, detail=str(e))
