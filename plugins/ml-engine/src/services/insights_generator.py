"""
Insights Generator Service
Analyzes emissions data and generates actionable insights
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from loguru import logger
import pandas as pd
import numpy as np


class InsightType:
    WARNING = "warning"
    OPPORTUNITY = "opportunity"
    ACHIEVEMENT = "achievement"
    TREND = "trend"


class InsightCategory:
    ENERGY = "energy"
    TRANSPORT = "transport"
    WASTE = "waste"
    SUPPLY_CHAIN = "supply_chain"
    GENERAL = "general"


class Insight:
    def __init__(
        self,
        insight_type: str,
        title: str,
        description: str,
        impact: str,
        category: str,
        recommendation: str,
        estimated_reduction: float,
        priority: int,
        cost_estimate: Optional[float] = None,
        implementation_time: Optional[str] = None
    ):
        self.id = f"{insight_type}_{category}_{datetime.now().timestamp()}"
        self.type = insight_type
        self.title = title
        self.description = description
        self.impact = impact
        self.category = category
        self.recommendation = recommendation
        self.estimated_reduction = estimated_reduction
        self.priority = priority
        self.cost_estimate = cost_estimate
        self.implementation_time = implementation_time
        self.created_at = datetime.now().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "description": self.description,
            "impact": self.impact,
            "category": self.category,
            "recommendation": self.recommendation,
            "estimatedReduction": self.estimated_reduction,
            "priority": self.priority,
            "costEstimate": self.cost_estimate,
            "implementationTime": self.implementation_time,
            "createdAt": self.created_at
        }


class InsightsGenerator:
    """Generate actionable insights from emissions data"""

    def __init__(self):
        self.industry_benchmarks = {
            "transport_per_km": 0.12,  # kg CO2 per km
            "energy_per_kwh": 0.45,    # kg CO2 per kWh
            "waste_per_kg": 0.5,       # kg CO2 per kg waste
        }

    def generate_insights(self, emissions_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate all insights from emissions data"""
        if not emissions_data:
            return []

        df = pd.DataFrame(emissions_data)
        insights = []

        # Generate different types of insights
        insights.extend(self._generate_hotspot_insights(df))
        insights.extend(self._generate_trend_insights(df))
        insights.extend(self._generate_opportunity_insights(df))
        insights.extend(self._generate_benchmark_insights(df))

        # Sort by priority
        insights.sort(key=lambda x: x["priority"], reverse=True)

        logger.info(f"Generated {len(insights)} insights")
        return insights

    def _generate_hotspot_insights(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Identify emission hotspots"""
        insights = []

        if "source" not in df.columns or "emissions" not in df.columns:
            return insights

        # Find top emitters
        source_emissions = df.groupby("source")["emissions"].sum().sort_values(ascending=False)
        total_emissions = source_emissions.sum()

        if len(source_emissions) > 0:
            top_source = source_emissions.index[0]
            top_percentage = (source_emissions.iloc[0] / total_emissions) * 100

            if top_percentage > 40:
                insight = Insight(
                    insight_type=InsightType.WARNING,
                    title=f"High Concentration: {top_source}",
                    description=f"{top_source} accounts for {top_percentage:.1f}% of total emissions",
                    impact="high",
                    category=self._categorize_source(top_source),
                    recommendation=f"Focus reduction efforts on {top_source} for maximum impact",
                    estimated_reduction=source_emissions.iloc[0] * 0.2,  # 20% reduction potential
                    priority=9,
                    implementation_time="1-3 months"
                )
                insights.append(insight.to_dict())

        # Check for multiple high emitters
        high_emitters = source_emissions[source_emissions > (total_emissions * 0.15)]
        if len(high_emitters) > 1:
            insight = Insight(
                insight_type=InsightType.WARNING,
                title=f"Multiple Emission Hotspots Detected",
                description=f"{len(high_emitters)} sources each contribute over 15% of total emissions",
                impact="high",
                category=InsightCategory.GENERAL,
                recommendation="Implement parallel reduction strategies across multiple high-impact sources",
                estimated_reduction=high_emitters.sum() * 0.15,
                priority=8,
                implementation_time="2-4 months"
            )
            insights.append(insight.to_dict())

        return insights

    def _generate_trend_insights(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze emission trends"""
        insights = []

        if "timestamp" not in df.columns or "emissions" not in df.columns:
            return insights

        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

        # Calculate monthly trends
        df["month"] = df["timestamp"].dt.to_period("M")
        monthly_emissions = df.groupby("month")["emissions"].sum()

        if len(monthly_emissions) >= 2:
            recent_month = monthly_emissions.iloc[-1]
            previous_month = monthly_emissions.iloc[-2]
            change_pct = ((recent_month - previous_month) / previous_month) * 100

            if change_pct > 10:
                insight = Insight(
                    insight_type=InsightType.WARNING,
                    title="Emissions Increasing",
                    description=f"Emissions increased by {change_pct:.1f}% compared to last month",
                    impact="high",
                    category=InsightCategory.GENERAL,
                    recommendation="Investigate recent changes in operations or processes",
                    estimated_reduction=recent_month - previous_month,
                    priority=9,
                    implementation_time="Immediate"
                )
                insights.append(insight.to_dict())
            elif change_pct < -10:
                insight = Insight(
                    insight_type=InsightType.ACHIEVEMENT,
                    title="Emissions Decreasing",
                    description=f"Emissions decreased by {abs(change_pct):.1f}% compared to last month",
                    impact="high",
                    category=InsightCategory.GENERAL,
                    recommendation="Continue current practices and identify what's working",
                    estimated_reduction=0,
                    priority=7
                )
                insights.append(insight.to_dict())

        return insights

    def _generate_opportunity_insights(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Identify reduction opportunities"""
        insights = []

        if "category" in df.columns and "emissions" in df.columns:
            category_emissions = df.groupby("category")["emissions"].sum()

            # Transportation opportunities
            if "transportation" in category_emissions.index:
                transport_emissions = category_emissions["transportation"]
                potential_reduction = transport_emissions * 0.25  # 25% reduction potential

                insight = Insight(
                    insight_type=InsightType.OPPORTUNITY,
                    title="Transportation Optimization Opportunity",
                    description=f"Transportation accounts for {transport_emissions:.0f} kg CO2",
                    impact="high",
                    category=InsightCategory.TRANSPORT,
                    recommendation="Consider route optimization, vehicle efficiency upgrades, or electric vehicles",
                    estimated_reduction=potential_reduction,
                    priority=8,
                    cost_estimate=5000,
                    implementation_time="3-6 months"
                )
                insights.append(insight.to_dict())

            # Energy opportunities
            if "energy" in category_emissions.index:
                energy_emissions = category_emissions["energy"]
                potential_reduction = energy_emissions * 0.30  # 30% reduction potential

                insight = Insight(
                    insight_type=InsightType.OPPORTUNITY,
                    title="Energy Efficiency Opportunity",
                    description=f"Energy consumption generates {energy_emissions:.0f} kg CO2",
                    impact="high",
                    category=InsightCategory.ENERGY,
                    recommendation="Implement LED lighting, optimize HVAC, or install solar panels",
                    estimated_reduction=potential_reduction,
                    priority=8,
                    cost_estimate=10000,
                    implementation_time="2-4 months"
                )
                insights.append(insight.to_dict())

        return insights

    def _generate_benchmark_insights(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Compare against industry benchmarks"""
        insights = []

        if "category" in df.columns and "emissions" in df.columns and "value" in df.columns:
            # Transportation benchmark
            transport_data = df[df["category"] == "transportation"]
            if len(transport_data) > 0 and "distance" in transport_data.columns:
                avg_emissions_per_km = transport_data["emissions"].sum() / transport_data["distance"].sum()
                benchmark = self.industry_benchmarks["transport_per_km"]

                if avg_emissions_per_km > benchmark * 1.3:  # 30% above benchmark
                    excess_pct = ((avg_emissions_per_km - benchmark) / benchmark) * 100
                    insight = Insight(
                        insight_type=InsightType.WARNING,
                        title="Above Industry Benchmark",
                        description=f"Transportation emissions are {excess_pct:.0f}% above industry average",
                        impact="medium",
                        category=InsightCategory.TRANSPORT,
                        recommendation="Review fleet efficiency and consider modern, fuel-efficient vehicles",
                        estimated_reduction=transport_data["emissions"].sum() * 0.2,
                        priority=7,
                        implementation_time="3-6 months"
                    )
                    insights.append(insight.to_dict())

        return insights

    def _categorize_source(self, source: str) -> str:
        """Categorize emission source"""
        source_lower = source.lower()
        if any(word in source_lower for word in ["transport", "vehicle", "delivery", "logistics"]):
            return InsightCategory.TRANSPORT
        elif any(word in source_lower for word in ["energy", "electricity", "power", "fuel"]):
            return InsightCategory.ENERGY
        elif any(word in source_lower for word in ["waste", "disposal", "recycling"]):
            return InsightCategory.WASTE
        elif any(word in source_lower for word in ["supply", "supplier", "procurement"]):
            return InsightCategory.SUPPLY_CHAIN
        else:
            return InsightCategory.GENERAL

    def generate_recommendations(self, insights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate detailed recommendations based on insights"""
        recommendations = []

        for insight in insights:
            if insight["type"] in [InsightType.WARNING, InsightType.OPPORTUNITY]:
                rec = self._create_recommendation(insight)
                if rec:
                    recommendations.append(rec)

        return recommendations

    def _create_recommendation(self, insight: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create detailed recommendation from insight"""
        category = insight["category"]
        
        recommendation_templates = {
            InsightCategory.TRANSPORT: {
                "title": "Optimize Transportation & Logistics",
                "steps": [
                    "Conduct route optimization analysis",
                    "Evaluate electric or hybrid vehicle options",
                    "Implement load optimization strategies",
                    "Consider alternative transportation modes"
                ],
                "difficulty": "medium"
            },
            InsightCategory.ENERGY: {
                "title": "Improve Energy Efficiency",
                "steps": [
                    "Conduct energy audit",
                    "Upgrade to LED lighting",
                    "Optimize HVAC systems",
                    "Install renewable energy sources"
                ],
                "difficulty": "medium"
            },
            InsightCategory.WASTE: {
                "title": "Reduce Waste & Improve Recycling",
                "steps": [
                    "Implement waste segregation",
                    "Partner with recycling facilities",
                    "Reduce single-use materials",
                    "Implement circular economy practices"
                ],
                "difficulty": "easy"
            }
        }

        template = recommendation_templates.get(category)
        if not template:
            return None

        return {
            "id": f"rec_{insight['id']}",
            "title": template["title"],
            "description": insight["recommendation"],
            "category": category,
            "impact": {
                "co2Reduction": insight["estimatedReduction"],
                "percentageReduction": (insight["estimatedReduction"] / 10000) * 100,  # Assuming 10000 kg baseline
                "costSavings": insight.get("costEstimate", 0) * 0.1  # Estimated savings
            },
            "implementation": {
                "difficulty": template["difficulty"],
                "timeframe": insight.get("implementationTime", "3-6 months"),
                "steps": template["steps"],
                "estimatedCost": insight.get("costEstimate", 5000)
            },
            "priority": insight["priority"],
            "applicability": 85  # Default applicability score
        }
