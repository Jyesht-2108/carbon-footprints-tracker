import React, { useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { InsightsPanel, RecommendationsCard, ForecastChart, AnomalyDetection } from '../components/insights';

const InsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations' | 'forecast' | 'anomalies'>('insights');

  const tabs = [
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'recommendations', label: 'Recommendations', icon: Target },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI-Powered Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get actionable recommendations to reduce your environmental impact
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'insights' && <InsightsPanel />}
          {activeTab === 'recommendations' && <RecommendationsCard />}
          {activeTab === 'forecast' && <ForecastChart />}
          {activeTab === 'anomalies' && <AnomalyDetection />}
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How AI Insights Work
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Our AI analyzes your emissions data using advanced machine learning models to provide:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span><strong>Smart Insights:</strong> Identify hotspots and trends in your emissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span><strong>Personalized Recommendations:</strong> Actionable strategies tailored to your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span><strong>Predictive Forecasting:</strong> Anticipate future emissions and plan ahead</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span><strong>Anomaly Detection:</strong> Catch unusual patterns before they become problems</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
