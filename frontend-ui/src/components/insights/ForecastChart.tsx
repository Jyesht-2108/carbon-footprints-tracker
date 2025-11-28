import React, { useEffect, useState } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface ForecastData {
  date: string;
  forecast: number;
  lower_bound?: number;
  upper_bound?: number;
}

interface ForecastResponse {
  forecasts: ForecastData[];
  summary: {
    periods: number;
    frequency: string;
    total_forecast: number;
    average_forecast: number;
    trend: string;
  };
}

const ForecastChart: React.FC = () => {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState(30);
  const [frequency, setFrequency] = useState('D');

  useEffect(() => {
    fetchForecast();
  }, [periods, frequency]);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/v1/ml/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periods,
          frequency,
          include_confidence: true
        })
      });
      
      const data = await response.json();
      setForecastData(data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = forecastData?.forecasts.map(f => ({
    date: formatDate(f.date),
    forecast: f.forecast,
    lowerBound: f.lower_bound,
    upperBound: f.upper_bound
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Emissions Forecast
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Predicted emissions based on historical trends
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <select
            value={periods}
            onChange={(e) => setPeriods(Number(e.target.value))}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>

          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="D">Daily</option>
            <option value="W">Weekly</option>
            <option value="M">Monthly</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {forecastData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Forecast
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {forecastData.summary.total_forecast.toFixed(0)} kg CO₂
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Next {periods} {frequency === 'D' ? 'days' : frequency === 'W' ? 'weeks' : 'months'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Average Daily
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {forecastData.summary.average_forecast.toFixed(0)} kg CO₂
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Per period average
            </p>
          </div>

          <div className={`bg-gradient-to-br rounded-lg p-4 border-2 ${
            forecastData.summary.trend === 'increasing'
              ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800'
              : 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {forecastData.summary.trend === 'increasing' ? (
                <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Trend
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              forecastData.summary.trend === 'increasing'
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}>
              {forecastData.summary.trend === 'increasing' ? 'Increasing' : 'Decreasing'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {forecastData.summary.trend === 'increasing' 
                ? 'Action needed to reduce emissions'
                : 'Keep up the good work!'}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              label={{ value: 'Emissions (kg CO₂)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [`${value.toFixed(2)} kg CO₂`, '']}
            />
            <Legend />
            
            {/* Confidence interval */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="#10b981"
              fillOpacity={0.1}
              name="Upper Bound"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill="#10b981"
              fillOpacity={0.1}
              name="Lower Bound"
            />
            
            {/* Forecast line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              name="Forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">ℹ️ About this forecast:</span> This prediction is based on historical emissions patterns and trends. 
          The shaded area represents the 95% confidence interval. Actual emissions may vary based on operational changes and external factors.
        </p>
      </div>
    </div>
  );
};

export default ForecastChart;
