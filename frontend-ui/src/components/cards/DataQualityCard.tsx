import { CheckCircle, AlertCircle, Database } from 'lucide-react'
import { motion } from 'framer-motion'

interface DataQualityCardProps {
  data?: {
    completeness?: number
    completeness_pct?: number
    anomalies?: number
    anomalies_count?: number
    predicted_pct?: number
    total_rows?: number
    last_updated?: string
  }
}

export default function DataQualityCard({ data }: DataQualityCardProps) {
  // Handle API response format: completeness_pct, anomalies_count
  const quality = (data as any)?.completeness_pct || data?.completeness || 0
  const anomalies = (data as any)?.anomalies_count || data?.anomalies || 0
  const isGood = quality >= 90

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isGood ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-yellow-500 to-orange-600'}`}>
              <Database className="text-white" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/90">Data Quality</h3>
          </div>
          {isGood ? (
            <CheckCircle className="text-emerald-400" size={24} />
          ) : (
            <AlertCircle className="text-yellow-400" size={24} />
          )}
        </div>
        
        {/* Progress ring */}
        <div className="flex items-center gap-6 mb-4">
          <div className="relative w-24 h-24">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke={isGood ? '#10b981' : '#f59e0b'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - quality / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{quality.toFixed(0)}%</span>
            </div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {anomalies}
            </div>
            <div className="text-sm text-gray-600 dark:text-white/60">
              Anomalies detected
            </div>
          </div>
        </div>
        
        <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
          isGood 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {isGood ? '✓ Excellent quality' : '⚠ Needs attention'}
        </div>
      </div>
    </motion.div>
  )
}
