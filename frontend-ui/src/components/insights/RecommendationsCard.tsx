import React, { useEffect, useState } from 'react';
import { Zap, DollarSign, Clock, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  estimated_impact: {
    co2_reduction_kg: number;
    co2_reduction_percentage: number;
    annual_cost_savings: number;
    roi_percentage: number;
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    timeframe: string;
    steps: string[];
    estimatedCost: number;
  };
  priority_score: number;
  applicability_score: number;
}

const RecommendationsCard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/ml/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5 })
      });
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      transportation: '🚗',
      energy: '⚡',
      waste: '♻️',
      supply_chain: '📦',
      process: '⚙️',
      behavioral: '👥'
    };
    return icons[category] || '💡';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recommended Actions
        </h2>
        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No recommendations available yet.
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-3xl">{getCategoryIcon(rec.category)}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(rec.implementation.difficulty)}`}>
                    {rec.implementation.difficulty.toUpperCase()}
                  </span>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">CO₂ Reduction</span>
                    </div>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {rec.estimated_impact.co2_reduction_kg.toFixed(0)} kg
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ({rec.estimated_impact.co2_reduction_percentage}%)
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Annual Savings</span>
                    </div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ${rec.estimated_impact.annual_cost_savings.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Timeframe</span>
                    </div>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {rec.implementation.timeframe}
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">ROI</span>
                    </div>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {rec.estimated_impact.roi_percentage}%
                    </p>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  {expandedId === rec.id ? (
                    <>
                      <span>Hide Implementation Steps</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>View Implementation Steps</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Content */}
              {expandedId === rec.id && (
                <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Implementation Steps:
                  </h4>
                  <ol className="space-y-2">
                    {rec.implementation.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Estimated Cost:</span> ${rec.implementation.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendationsCard;
