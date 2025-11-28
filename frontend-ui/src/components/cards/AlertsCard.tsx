import { AlertTriangle, Bell } from 'lucide-react'
import { motion } from 'framer-motion'

interface AlertsCardProps {
  data?: Array<{
    id: number
    level: string
    message: string
  }>
}

export default function AlertsCard({ data }: AlertsCardProps) {
  const criticalCount = data?.filter(a => a.level === 'critical').length || 0
  const warnCount = data?.filter(a => a.level === 'warn').length || 0
  const totalCount = data?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg relative">
              <Bell className="text-white" size={20} />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900">
                  {totalCount}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/90">Active Alerts</h3>
          </div>
          {totalCount > 0 && (
            <AlertTriangle className="text-orange-400 animate-pulse" size={24} />
          )}
        </div>
        
        <div className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
          {totalCount}
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
            <div className="text-xs text-red-400/80 font-medium">Critical</div>
          </div>
          <div className="flex-1 px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-400">{warnCount}</div>
            <div className="text-xs text-yellow-400/80 font-medium">Warning</div>
          </div>
        </div>
      </div>
      
      {/* Glow effect for critical alerts */}
      {criticalCount > 0 && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
      )}
    </motion.div>
  )
}
