import { TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { motion } from 'framer-motion'

interface EmissionsCardProps {
  data?: {
    current_rate: number
    trend: number
    categories: Record<string, number>
  }
}

export default function EmissionsCard({ data }: EmissionsCardProps) {
  if (!data) {
    return (
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 animate-pulse rounded-xl shadow-lg dark:shadow-none">
        <div className="h-32 bg-gray-100 dark:bg-white/5 rounded-xl"></div>
      </div>
    )
  }

  const isIncreasing = data.trend > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <Zap className="text-white" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/90">Current Emissions</h3>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            isIncreasing 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}>
            {isIncreasing ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{formatNumber(Math.abs(data.trend))}%</span>
          </div>
        </div>
        
        <div className="text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
          {formatNumber(data.current_rate, 0)}
          <span className="text-2xl text-gray-500 dark:text-white/60 ml-2">kg CO₂</span>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-white/60 font-medium">
          Per hour • Live monitoring
        </div>
      </div>
      
      {/* Pulse indicator */}
      <div className="absolute top-4 right-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
      </div>
    </motion.div>
  )
}
