import React, { useEffect, useState } from 'react';
import { AlertTriangle, Activity, Shield, Info } from 'lucide-react';

interface Anomaly {
  index: number;
  timestamp: string;
  source: string;
  emissions: number;
  anomaly_score: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  features: { [key: string]: number };
}

interface AnomalyResponse {
  anomalies: Anomaly[];
  summary: {
    total_samples: number;
    anomalies_detected: number;
    anomaly_rate: number;
    severity_breakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
}

const AnomalyDetection: React.FC = () => {
  const [anomalyData, setAnomalyData] = useState<AnomalyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/v1/ml/anomalies/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ realtime: false })
      });
      
      const data = await response.json();
      setAnomalyData(data);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <Activity className="w-5 h-5" />;
      case 'low':
        return <Info className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAnomalies = selectedSeverity === 'all'
    ? anomalyData?.anomalies || []
    : anomalyData?.anomalies.filter(a => a.severity === selectedSeverity) || [];

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Anomaly Detection
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Unusual emission patterns and spikes
          </p>
        </div>
        <button
          onClick={fetchAnomalies}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {anomalyData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Samples
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {anomalyData.summary.total_samples}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Anomalies
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {anomalyData.summary.anomalies_detected}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {anomalyData.summary.anomaly_rate.toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Critical/High
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {anomalyData.summary.severity_breakdown.critical + anomalyData.summary.severity_breakdown.high}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Require immediate attention
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Medium/Low
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {anomalyData.summary.severity_breakdown.medium + anomalyData.summary.severity_breakdown.low}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Monitor closely
            </p>
          </div>
        </div>
      )}

      {/* Severity Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
          <button
            key={severity}
            onClick={() => setSelectedSeverity(severity)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSeverity === severity
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
            {severity !== 'all' && anomalyData && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {anomalyData.summary.severity_breakdown[severity as keyof typeof anomalyData.summary.severity_breakdown]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        {filteredAnomalies.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Anomalies Detected
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All emissions are within normal ranges
            </p>
          </div>
        ) : (
          filteredAnomalies.map((anomaly, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getSeverityColor(anomaly.severity)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(anomaly.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {anomaly.source}
                      </h3>
                      <p className="text-sm opacity-75">
                        {formatDate(anomaly.timestamp)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs opacity-75 mb-1">Emissions</p>
                      <p className="text-lg font-bold">
                        {anomaly.emissions.toFixed(2)} kg CO₂
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75 mb-1">Anomaly Score</p>
                      <p className="text-lg font-bold">
                        {anomaly.anomaly_score.toFixed(1)}/100
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs font-semibold mb-2">⚠️ Recommendation:</p>
                    <p className="text-sm">
                      {anomaly.severity === 'critical' || anomaly.severity === 'high'
                        ? 'Immediate investigation required. This emission level is significantly above normal patterns.'
                        : 'Monitor this source closely. Consider investigating if pattern continues.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnomalyDetection;
