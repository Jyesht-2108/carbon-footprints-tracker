"""
ML Models API Routes
Endpoints for all ML models: forecasting, anomaly detection, clustering, recommendations
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from loguru import logger
import pandas as pd

from src.models.time_series_forecast import TimeSeriesForecaster
from src.models.anomaly_detection import AnomalyDetector
from src.models.clustering import EmissionClusterer
from src.models.recommendation_engine import RecommendationEngine

router = APIRouter()

# Initialize models
forecaster = TimeSeriesForecaster()
anomaly_detector = AnomalyDetector()
clusterer = EmissionClusterer()
recommender = RecommendationEngine()


# Request/Response Models
class ForecastRequest(BaseModel):
    periods: int = 30
    frequency: str = "D"  # D=daily, W=weekly, M=monthly
    include_confidence: bool = True


class AnomalyDetectionRequest(BaseModel):
    realtime: bool = False
    sample: Optional[Dict[str, Any]] = None


class ClusteringRequest(BaseModel):
    n_clusters: Optional[int] = None
    auto_clusters: bool = True


class RecommendationRequest(BaseModel):
    company_profile: Optional[Dict[str, Any]] = None
    limit: int = 5


# ============ TIME SERIES FORECASTING ============

@router.post("/forecast")
async def generate_forecast(request: ForecastRequest):
    """
    Generate emissions forecast
    
    Predicts future emissions based on historical trends
    """
    try:
        # Fetch historical data
        emissions_data = await fetch_emissions_data()
        
        if not emissions_data:
            raise HTTPException(status_code=404, detail="No emissions data available")
        
        # Train model if not already trained
        df = pd.DataFrame(emissions_data)
        if not forecaster.model:
            forecaster.train(df)
        
        # Generate forecast
        forecast = forecaster.forecast(
            periods=request.periods,
            frequency=request.frequency,
            include_confidence=request.include_confidence
        )
        
        return forecast
        
    except Exception as e:
        logger.error(f"Error generating forecast: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/forecast/train")
async def train_forecast_model():
    """Train the forecasting model with latest data"""
    try:
        emissions_data = await fetch_emissions_data()
        
        if not emissions_data:
            raise HTTPException(status_code=404, detail="No emissions data available")
        
        df = pd.DataFrame(emissions_data)
        success = forecaster.train(df)
        
        if success:
            forecaster.save()
            return {"message": "Forecast model trained successfully", "samples": len(df)}
        else:
            raise HTTPException(status_code=500, detail="Training failed")
            
    except Exception as e:
        logger.error(f"Error training forecast model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ ANOMALY DETECTION ============

@router.post("/anomalies/detect")
async def detect_anomalies(request: AnomalyDetectionRequest):
    """
    Detect anomalies in emissions data
    
    Identifies unusual patterns or spikes in emissions
    """
    try:
        if request.realtime and request.sample:
            # Real-time detection for single sample
            if not anomaly_detector.model:
                raise HTTPException(status_code=400, detail="Model not trained")
            
            result = anomaly_detector.detect_realtime(request.sample)
            return result
        else:
            # Batch detection
            emissions_data = await fetch_emissions_data()
            
            if not emissions_data:
                raise HTTPException(status_code=404, detail="No emissions data available")
            
            df = pd.DataFrame(emissions_data)
            
            # Train if needed
            if not anomaly_detector.model:
                anomaly_detector.train(df)
            
            # Detect anomalies
            result = anomaly_detector.detect(df)
            return result
            
    except Exception as e:
        logger.error(f"Error detecting anomalies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/anomalies/train")
async def train_anomaly_model():
    """Train the anomaly detection model"""
    try:
        emissions_data = await fetch_emissions_data()
        
        if not emissions_data:
            raise HTTPException(status_code=404, detail="No emissions data available")
        
        df = pd.DataFrame(emissions_data)
        success = anomaly_detector.train(df)
        
        if success:
            anomaly_detector.save()
            return {"message": "Anomaly detection model trained successfully", "samples": len(df)}
        else:
            raise HTTPException(status_code=500, detail="Training failed")
            
    except Exception as e:
        logger.error(f"Error training anomaly model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ CLUSTERING ============

@router.post("/clusters/analyze")
async def analyze_clusters(request: ClusteringRequest):
    """
    Cluster emissions data to identify patterns
    
    Groups similar emission sources together
    """
    try:
        emissions_data = await fetch_emissions_data()
        
        if not emissions_data:
            raise HTTPException(status_code=404, detail="No emissions data available")
        
        df = pd.DataFrame(emissions_data)
        
        # Train clustering model
        if request.n_clusters:
            clusterer.n_clusters = request.n_clusters
        
        clusterer.train(df, auto_clusters=request.auto_clusters)
        
        # Get cluster assignments
        result = clusterer.predict(df)
        
        # Add insights
        result['insights'] = clusterer.get_cluster_insights()
        
        return result
        
    except Exception as e:
        logger.error(f"Error analyzing clusters: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clusters/insights")
async def get_cluster_insights():
    """Get insights from cluster analysis"""
    try:
        if not clusterer.model:
            raise HTTPException(status_code=400, detail="Clustering model not trained")
        
        insights = clusterer.get_cluster_insights()
        return {"insights": insights, "cluster_profiles": clusterer.cluster_profiles}
        
    except Exception as e:
        logger.error(f"Error getting cluster insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ RECOMMENDATIONS ============

@router.post("/recommendations/generate")
async def generate_recommendations(request: RecommendationRequest):
    """
    Generate personalized emission reduction recommendations
    
    Provides actionable strategies based on current emissions profile
    """
    try:
        # Fetch emissions data
        emissions_data = await fetch_emissions_data()
        
        if not emissions_data:
            raise HTTPException(status_code=404, detail="No emissions data available")
        
        # Calculate emissions summary
        df = pd.DataFrame(emissions_data)
        emissions_summary = {
            'total': df['emissions'].sum() if 'emissions' in df.columns else 0,
            'by_category': {}
        }
        
        if 'category' in df.columns:
            emissions_summary['by_category'] = df.groupby('category')['emissions'].sum().to_dict()
        
        # Generate recommendations
        recommendations = recommender.generate_recommendations(
            emissions_data=emissions_summary,
            company_profile=request.company_profile,
            limit=request.limit
        )
        
        return {
            'recommendations': recommendations,
            'emissions_summary': emissions_summary,
            'total_potential_reduction': sum(
                r['estimated_impact']['co2_reduction_kg'] 
                for r in recommendations
            )
        }
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations/{rec_id}")
async def get_recommendation_details(rec_id: str):
    """Get detailed information about a specific recommendation"""
    try:
        recommendation = recommender.get_recommendation_by_id(rec_id)
        
        if not recommendation:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        return recommendation
        
    except Exception as e:
        logger.error(f"Error fetching recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations/category/{category}")
async def get_recommendations_by_category(category: str):
    """Get all recommendations for a specific category"""
    try:
        recommendations = recommender.get_recommendations_by_category(category)
        return {"category": category, "recommendations": recommendations}
        
    except Exception as e:
        logger.error(f"Error fetching recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ COMBINED ANALYSIS ============

@router.get("/analysis/complete")
async def complete_analysis():
    """
    Run complete ML analysis
    
    Includes forecasting, anomaly detection, clustering, and recommendations
    """
    try:
        emissions_data = await fetch_emissions_data()
        
        if not emissions_data:
            raise HTTPException(status_code=404, detail="No emissions data available")
        
        df = pd.DataFrame(emissions_data)
        
        # Train models if needed
        if not forecaster.model:
            forecaster.train(df)
        if not anomaly_detector.model:
            anomaly_detector.train(df)
        if not clusterer.model:
            clusterer.train(df, auto_clusters=True)
        
        # Generate all analyses
        forecast = forecaster.forecast(periods=30)
        anomalies = anomaly_detector.detect(df)
        clusters = clusterer.predict(df)
        
        emissions_summary = {
            'total': df['emissions'].sum() if 'emissions' in df.columns else 0,
            'by_category': df.groupby('category')['emissions'].sum().to_dict() if 'category' in df.columns else {}
        }
        
        recommendations = recommender.generate_recommendations(
            emissions_data=emissions_summary,
            limit=5
        )
        
        return {
            'forecast': forecast,
            'anomalies': {
                'count': anomalies['summary']['anomalies_detected'],
                'rate': anomalies['summary']['anomaly_rate'],
                'top_anomalies': anomalies['anomalies'][:5]
            },
            'clusters': {
                'n_clusters': clusters['summary']['n_clusters'],
                'profiles': clusters['summary']['cluster_profiles']
            },
            'recommendations': recommendations[:3],
            'summary': {
                'total_emissions': emissions_summary['total'],
                'forecast_trend': forecast['summary']['trend'],
                'anomalies_detected': anomalies['summary']['anomalies_detected'],
                'clusters_identified': clusters['summary']['n_clusters']
            }
        }
        
    except Exception as e:
        logger.error(f"Error in complete analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ HELPER FUNCTIONS ============

async def fetch_emissions_data() -> List[Dict[str, Any]]:
    """Fetch emissions data from data-core or generate mock data"""
    try:
        # TODO: Fetch from data-core service
        # For now, return mock data
        return generate_mock_data()
    except Exception as e:
        logger.error(f"Error fetching emissions data: {str(e)}")
        return generate_mock_data()


def generate_mock_data() -> List[Dict[str, Any]]:
    """Generate mock emissions data for testing"""
    from datetime import datetime, timedelta
    import random
    
    mock_data = []
    sources = ["Transportation", "Energy", "Waste", "Manufacturing", "Office"]
    categories = ["transportation", "energy", "waste", "production", "general"]
    
    for i in range(100):
        date = datetime.now() - timedelta(days=random.randint(0, 180))
        source = random.choice(sources)
        category = random.choice(categories)
        
        mock_data.append({
            "id": i + 1,
            "timestamp": date.isoformat(),
            "source": source,
            "category": category,
            "emissions": random.uniform(100, 2000),
            "value": random.uniform(50, 1000),
            "distance": random.uniform(10, 500) if category == "transportation" else None,
            "energy_kwh": random.uniform(100, 5000) if category == "energy" else None
        })
    
    return mock_data
