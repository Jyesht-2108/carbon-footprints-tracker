"""
Recommendation Engine
Generates personalized emission reduction recommendations
"""
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from loguru import logger
import json
import os


class RecommendationEngine:
    """Generate personalized emission reduction recommendations"""
    
    def __init__(self, recommendations_db_path: str = "data/recommendations_db.json"):
        self.recommendations_db_path = recommendations_db_path
        self.recommendations_db = self._load_recommendations_db()
        
    def _load_recommendations_db(self) -> List[Dict[str, Any]]:
        """Load recommendations database"""
        if os.path.exists(self.recommendations_db_path):
            with open(self.recommendations_db_path, 'r') as f:
                return json.load(f)
        else:
            # Create default recommendations database
            return self._create_default_recommendations()
    
    def _create_default_recommendations(self) -> List[Dict[str, Any]]:
        """Create default recommendations database"""
        recommendations = [
            {
                "id": "rec_transport_001",
                "title": "Switch to Electric Vehicles",
                "category": "transportation",
                "description": "Replace diesel/petrol vehicles with electric alternatives",
                "impact": {
                    "co2_reduction_percentage": 60,
                    "annual_savings": 15000,
                    "payback_period_months": 36
                },
                "implementation": {
                    "difficulty": "medium",
                    "timeframe": "6-12 months",
                    "initial_cost": 45000,
                    "steps": [
                        "Assess current fleet composition",
                        "Identify suitable EV models",
                        "Install charging infrastructure",
                        "Train drivers on EV operation",
                        "Phase out old vehicles gradually"
                    ]
                },
                "applicability_criteria": {
                    "min_transport_emissions": 1000,
                    "vehicle_age": 5,
                    "daily_distance": 200
                },
                "priority_score": 9
            },
            {
                "id": "rec_transport_002",
                "title": "Optimize Delivery Routes",
                "category": "transportation",
                "description": "Use route optimization software to reduce travel distance",
                "impact": {
                    "co2_reduction_percentage": 25,
                    "annual_savings": 8000,
                    "payback_period_months": 3
                },
                "implementation": {
                    "difficulty": "easy",
                    "timeframe": "1-3 months",
                    "initial_cost": 2000,
                    "steps": [
                        "Implement route optimization software",
                        "Analyze current routes",
                        "Train logistics team",
                        "Monitor and adjust routes",
                        "Measure fuel savings"
                    ]
                },
                "applicability_criteria": {
                    "min_transport_emissions": 500,
                    "has_delivery_operations": True
                },
                "priority_score": 8
            },
            {
                "id": "rec_energy_001",
                "title": "Install Solar Panels",
                "category": "energy",
                "description": "Generate renewable energy on-site with solar panels",
                "impact": {
                    "co2_reduction_percentage": 40,
                    "annual_savings": 12000,
                    "payback_period_months": 60
                },
                "implementation": {
                    "difficulty": "medium",
                    "timeframe": "3-6 months",
                    "initial_cost": 60000,
                    "steps": [
                        "Conduct site assessment",
                        "Calculate ROI and incentives",
                        "Select solar provider",
                        "Install panels and inverters",
                        "Connect to grid"
                    ]
                },
                "applicability_criteria": {
                    "min_energy_emissions": 2000,
                    "has_roof_space": True
                },
                "priority_score": 8
            },
            {
                "id": "rec_energy_002",
                "title": "Upgrade to LED Lighting",
                "category": "energy",
                "description": "Replace traditional lighting with energy-efficient LEDs",
                "impact": {
                    "co2_reduction_percentage": 15,
                    "annual_savings": 3000,
                    "payback_period_months": 12
                },
                "implementation": {
                    "difficulty": "easy",
                    "timeframe": "1-2 months",
                    "initial_cost": 3000,
                    "steps": [
                        "Audit current lighting",
                        "Calculate LED requirements",
                        "Purchase LED bulbs/fixtures",
                        "Install LEDs",
                        "Dispose of old bulbs properly"
                    ]
                },
                "applicability_criteria": {
                    "min_energy_emissions": 500
                },
                "priority_score": 7
            },
            {
                "id": "rec_energy_003",
                "title": "Optimize HVAC Systems",
                "category": "energy",
                "description": "Upgrade and optimize heating, ventilation, and air conditioning",
                "impact": {
                    "co2_reduction_percentage": 30,
                    "annual_savings": 7000,
                    "payback_period_months": 24
                },
                "implementation": {
                    "difficulty": "medium",
                    "timeframe": "2-4 months",
                    "initial_cost": 14000,
                    "steps": [
                        "Conduct HVAC energy audit",
                        "Install programmable thermostats",
                        "Seal ductwork leaks",
                        "Upgrade to efficient units",
                        "Implement maintenance schedule"
                    ]
                },
                "applicability_criteria": {
                    "min_energy_emissions": 1500,
                    "hvac_age": 10
                },
                "priority_score": 8
            },
            {
                "id": "rec_waste_001",
                "title": "Implement Comprehensive Recycling",
                "category": "waste",
                "description": "Set up recycling program for all waste streams",
                "impact": {
                    "co2_reduction_percentage": 20,
                    "annual_savings": 2000,
                    "payback_period_months": 6
                },
                "implementation": {
                    "difficulty": "easy",
                    "timeframe": "1-2 months",
                    "initial_cost": 1000,
                    "steps": [
                        "Conduct waste audit",
                        "Set up recycling bins",
                        "Partner with recycling facility",
                        "Train employees",
                        "Monitor recycling rates"
                    ]
                },
                "applicability_criteria": {
                    "min_waste_emissions": 300
                },
                "priority_score": 6
            },
            {
                "id": "rec_supply_001",
                "title": "Source from Local Suppliers",
                "category": "supply_chain",
                "description": "Reduce transportation emissions by sourcing locally",
                "impact": {
                    "co2_reduction_percentage": 35,
                    "annual_savings": 5000,
                    "payback_period_months": 12
                },
                "implementation": {
                    "difficulty": "medium",
                    "timeframe": "3-6 months",
                    "initial_cost": 5000,
                    "steps": [
                        "Identify local suppliers",
                        "Compare quality and pricing",
                        "Negotiate contracts",
                        "Transition supply chain",
                        "Monitor performance"
                    ]
                },
                "applicability_criteria": {
                    "min_supply_chain_emissions": 1000
                },
                "priority_score": 7
            },
            {
                "id": "rec_process_001",
                "title": "Implement Energy Management System",
                "category": "process",
                "description": "Install IoT sensors and software to monitor and optimize energy use",
                "impact": {
                    "co2_reduction_percentage": 20,
                    "annual_savings": 10000,
                    "payback_period_months": 18
                },
                "implementation": {
                    "difficulty": "medium",
                    "timeframe": "2-4 months",
                    "initial_cost": 15000,
                    "steps": [
                        "Select EMS platform",
                        "Install sensors",
                        "Configure monitoring",
                        "Set up alerts and automation",
                        "Train staff on system"
                    ]
                },
                "applicability_criteria": {
                    "min_total_emissions": 5000
                },
                "priority_score": 8
            },
            {
                "id": "rec_behavior_001",
                "title": "Employee Sustainability Training",
                "category": "behavioral",
                "description": "Train employees on energy-saving practices and sustainability",
                "impact": {
                    "co2_reduction_percentage": 10,
                    "annual_savings": 2000,
                    "payback_period_months": 3
                },
                "implementation": {
                    "difficulty": "easy",
                    "timeframe": "1 month",
                    "initial_cost": 500,
                    "steps": [
                        "Develop training materials",
                        "Schedule training sessions",
                        "Create sustainability guidelines",
                        "Set up feedback system",
                        "Track behavior changes"
                    ]
                },
                "applicability_criteria": {
                    "min_employees": 10
                },
                "priority_score": 6
            },
            {
                "id": "rec_renewable_001",
                "title": "Purchase Renewable Energy Credits",
                "category": "energy",
                "description": "Offset emissions by purchasing renewable energy certificates",
                "impact": {
                    "co2_reduction_percentage": 50,
                    "annual_savings": 0,
                    "payback_period_months": 0
                },
                "implementation": {
                    "difficulty": "easy",
                    "timeframe": "Immediate",
                    "initial_cost": 5000,
                    "steps": [
                        "Research REC providers",
                        "Calculate energy needs",
                        "Purchase RECs",
                        "Track certificates",
                        "Report on renewable usage"
                    ]
                },
                "applicability_criteria": {
                    "min_energy_emissions": 1000
                },
                "priority_score": 5
            }
        ]
        
        # Save to file
        os.makedirs(os.path.dirname(self.recommendations_db_path), exist_ok=True)
        with open(self.recommendations_db_path, 'w') as f:
            json.dump(recommendations, f, indent=2)
        
        return recommendations
    
    def generate_recommendations(
        self,
        emissions_data: Dict[str, Any],
        company_profile: Optional[Dict[str, Any]] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate personalized recommendations
        
        Args:
            emissions_data: Current emissions breakdown
            company_profile: Company characteristics
            limit: Maximum number of recommendations
            
        Returns:
            List of ranked recommendations
        """
        try:
            # Calculate emissions by category
            category_emissions = self._calculate_category_emissions(emissions_data)
            
            # Score and filter recommendations
            scored_recommendations = []
            for rec in self.recommendations_db:
                score = self._calculate_applicability_score(
                    rec,
                    category_emissions,
                    company_profile
                )
                
                if score > 0:
                    rec_copy = rec.copy()
                    rec_copy['applicability_score'] = score
                    rec_copy['estimated_impact'] = self._calculate_estimated_impact(
                        rec,
                        category_emissions
                    )
                    scored_recommendations.append(rec_copy)
            
            # Sort by combined score (priority + applicability)
            scored_recommendations.sort(
                key=lambda x: (x['priority_score'] * 0.6 + x['applicability_score'] * 0.4),
                reverse=True
            )
            
            # Return top recommendations
            return scored_recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return []
    
    def _calculate_category_emissions(self, emissions_data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate total emissions by category"""
        category_totals = {
            'transportation': 0,
            'energy': 0,
            'waste': 0,
            'supply_chain': 0,
            'total': 0
        }
        
        if isinstance(emissions_data, dict):
            if 'by_category' in emissions_data:
                for category, value in emissions_data['by_category'].items():
                    category_totals[category] = value
            
            if 'total' in emissions_data:
                category_totals['total'] = emissions_data['total']
        
        return category_totals
    
    def _calculate_applicability_score(
        self,
        recommendation: Dict[str, Any],
        category_emissions: Dict[str, float],
        company_profile: Optional[Dict[str, Any]]
    ) -> float:
        """Calculate how applicable a recommendation is (0-100)"""
        score = 50  # Base score
        
        criteria = recommendation.get('applicability_criteria', {})
        category = recommendation.get('category', 'general')
        
        # Check category emissions threshold
        category_key = f"{category}_emissions" if category != 'general' else 'total_emissions'
        min_emissions = criteria.get(f'min_{category}_emissions', 0)
        
        actual_emissions = category_emissions.get(category, 0)
        
        if actual_emissions >= min_emissions:
            score += 30
        elif actual_emissions >= min_emissions * 0.5:
            score += 15
        
        # Check company profile criteria
        if company_profile:
            for key, required_value in criteria.items():
                if key.startswith('min_'):
                    continue
                
                if key in company_profile:
                    if company_profile[key] == required_value:
                        score += 10
        
        return min(100, score)
    
    def _calculate_estimated_impact(
        self,
        recommendation: Dict[str, Any],
        category_emissions: Dict[str, float]
    ) -> Dict[str, float]:
        """Calculate estimated impact for this specific case"""
        category = recommendation.get('category', 'general')
        impact = recommendation.get('impact', {})
        
        reduction_pct = impact.get('co2_reduction_percentage', 0) / 100
        category_emission = category_emissions.get(category, 0)
        
        estimated_reduction = category_emission * reduction_pct
        
        return {
            'co2_reduction_kg': round(estimated_reduction, 2),
            'co2_reduction_percentage': impact.get('co2_reduction_percentage', 0),
            'annual_cost_savings': impact.get('annual_savings', 0),
            'payback_period_months': impact.get('payback_period_months', 0),
            'roi_percentage': self._calculate_roi(impact)
        }
    
    def _calculate_roi(self, impact: Dict[str, Any]) -> float:
        """Calculate return on investment percentage"""
        annual_savings = impact.get('annual_savings', 0)
        payback_months = impact.get('payback_period_months', 1)
        
        if payback_months == 0:
            return 0
        
        initial_cost = (annual_savings / 12) * payback_months
        
        if initial_cost == 0:
            return 0
        
        # 5-year ROI
        total_savings = annual_savings * 5
        roi = ((total_savings - initial_cost) / initial_cost) * 100
        
        return round(roi, 1)
    
    def get_recommendation_by_id(self, rec_id: str) -> Optional[Dict[str, Any]]:
        """Get specific recommendation by ID"""
        for rec in self.recommendations_db:
            if rec['id'] == rec_id:
                return rec
        return None
    
    def get_recommendations_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get all recommendations for a specific category"""
        return [rec for rec in self.recommendations_db if rec.get('category') == category]
