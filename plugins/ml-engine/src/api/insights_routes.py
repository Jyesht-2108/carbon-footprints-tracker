"""
Insights API Routes
Endpoints for generating and retrieving insights
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from loguru import logger
import httpx

from src.services.insights_generator import InsightsGenerator

router = APIRouter()
insights_generator = InsightsGenerator()


class InsightsRequest(BaseModel):
    """Request model for insights generation"""
    start_date: str = None
    end_date: str = None
    source_filter: List[str] = None
    category_filter: List[str] = None


class InsightsResponse(BaseModel):
    """Response model for insights"""
    insights: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    summary: Dict[str, Any]


@router.post("/generate", response_model=InsightsResponse)
async def generate_insights(request: InsightsRequest = None):
    """
    Generate insights from emissions data
    
    Analyzes emissions data and returns:
    - Actionable insights
    - Recommendations
    - Summary statistics
    """
    try:
        # Fetch emissions data from data-core service
        emissions_data = await fetch_emissions_data(request)
        
        if not emissions_data:
            return InsightsResponse(
                insights=[],
                recommendations=[],
                summary={"message": "No emissions data available"}
            )
        
        # Generate insights
        insights = insights_generator.generate_insights(emissions_data)
        
        # Generate recommendations
        recommendations = insights_generator.generate_recommendations(insights)
        
        # Calculate summary
        summary = calculate_summary(emissions_data, insights, recommendations)
        
        logger.info(f"Generated {len(insights)} insights and {len(recommendations)} recommendations")
        
        return InsightsResponse(
            insights=insights,
            recommendations=recommendations,
            summary=summary
        )
        
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")


@router.get("/insights", response_model=List[Dict[str, Any]])
async def get_insights(
    limit: int = 10,
    insight_type: str = None,
    category: str = None
):
    """
    Get recent insights with optional filtering
    """
    try:
        # Fetch emissions data
        emissions_data = await fetch_emissions_data(None)
        
        if not emissions_data:
            return []
        
        # Generate insights
        insights = insights_generator.generate_insights(emissions_data)
        
        # Apply filters
        if insight_type:
            insights = [i for i in insights if i["type"] == insight_type]
        
        if category:
            insights = [i for i in insights if i["category"] == category]
        
        # Limit results
        insights = insights[:limit]
        
        return insights
        
    except Exception as e:
        logger.error(f"Error fetching insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch insights: {str(e)}")


@router.get("/recommendations", response_model=List[Dict[str, Any]])
async def get_recommendations(
    limit: int = 5,
    category: str = None,
    min_priority: int = 5
):
    """
    Get recommendations with optional filtering
    """
    try:
        # Fetch emissions data
        emissions_data = await fetch_emissions_data(None)
        
        if not emissions_data:
            return []
        
        # Generate insights first
        insights = insights_generator.generate_insights(emissions_data)
        
        # Generate recommendations
        recommendations = insights_generator.generate_recommendations(insights)
        
        # Apply filters
        if category:
            recommendations = [r for r in recommendations if r["category"] == category]
        
        recommendations = [r for r in recommendations if r["priority"] >= min_priority]
        
        # Limit results
        recommendations = recommendations[:limit]
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error fetching recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch recommendations: {str(e)}")


@router.get("/summary")
async def get_insights_summary():
    """
    Get summary of insights and recommendations
    """
    try:
        # Fetch emissions data
        emissions_data = await fetch_emissions_data(None)
        
        if not emissions_data:
            return {
                "totalInsights": 0,
                "totalRecommendations": 0,
                "potentialReduction": 0,
                "message": "No data available"
            }
        
        # Generate insights
        insights = insights_generator.generate_insights(emissions_data)
        recommendations = insights_generator.generate_recommendations(insights)
        
        # Calculate totals
        total_reduction = sum(i.get("estimatedReduction", 0) for i in insights)
        high_priority_count = len([i for i in insights if i["priority"] >= 8])
        
        return {
            "totalInsights": len(insights),
            "totalRecommendations": len(recommendations),
            "highPriorityInsights": high_priority_count,
            "potentialReduction": round(total_reduction, 2),
            "categories": get_category_breakdown(insights),
            "topRecommendation": recommendations[0] if recommendations else None
        }
        
    except Exception as e:
        logger.error(f"Error fetching summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch summary: {str(e)}")


async def fetch_emissions_data(request: InsightsRequest = None) -> List[Dict[str, Any]]:
    """Fetch emissions data from data-core service"""
    try:
        # TODO: Replace with actual data-core service URL from config
        data_core_url = "http://localhost:8002/api/v1"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{data_core_url}/emissions")
            
            if response.status_code == 200:
                data = response.json()
                return data.get("emissions", [])
            else:
                logger.warning(f"Failed to fetch emissions data: {response.status_code}")
                return []
                
    except Exception as e:
        logger.error(f"Error fetching emissions data: {str(e)}")
        # Return mock data for development
        return generate_mock_emissions_data()


def generate_mock_emissions_data() -> List[Dict[str, Any]]:
    """Generate mock emissions data for testing"""
    from datetime import datetime, timedelta
    import random
    
    mock_data = []
    sources = ["Transportation", "Energy", "Waste", "Manufacturing"]
    categories = ["transportation", "energy", "waste", "production"]
    
    for i in range(50):
        date = datetime.now() - timedelta(days=random.randint(0, 90))
        source = random.choice(sources)
        category = random.choice(categories)
        
        mock_data.append({
            "id": i + 1,
            "timestamp": date.isoformat(),
            "source": source,
            "category": category,
            "emissions": random.uniform(100, 1000),
            "value": random.uniform(50, 500),
            "distance": random.uniform(10, 200) if category == "transportation" else None
        })
    
    return mock_data


def calculate_summary(
    emissions_data: List[Dict[str, Any]],
    insights: List[Dict[str, Any]],
    recommendations: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Calculate summary statistics"""
    import pandas as pd
    
    df = pd.DataFrame(emissions_data)
    total_emissions = df["emissions"].sum() if "emissions" in df.columns else 0
    
    return {
        "totalEmissions": round(total_emissions, 2),
        "totalInsights": len(insights),
        "totalRecommendations": len(recommendations),
        "potentialReduction": round(sum(i.get("estimatedReduction", 0) for i in insights), 2),
        "potentialReductionPercentage": round((sum(i.get("estimatedReduction", 0) for i in insights) / total_emissions * 100), 1) if total_emissions > 0 else 0,
        "highPriorityCount": len([i for i in insights if i["priority"] >= 8]),
        "categories": get_category_breakdown(insights)
    }


def get_category_breakdown(insights: List[Dict[str, Any]]) -> Dict[str, int]:
    """Get breakdown of insights by category"""
    breakdown = {}
    for insight in insights:
        category = insight.get("category", "general")
        breakdown[category] = breakdown.get(category, 0) + 1
    return breakdown
