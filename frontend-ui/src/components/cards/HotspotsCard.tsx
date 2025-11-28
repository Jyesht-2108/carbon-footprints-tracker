import { Flame, TrendingUp, AlertCircle } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import HotspotDetailPanel from '../panels/HotspotDetailPanel'

interface HotspotsCardProps {
  data?: Array<{
    id: number
    entity: string
    entity_type: string
    predicted_co2: number
    baseline_co2: number
    percent_above: number
    severity: string
    status: string
    created_at: string
  }>
}

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-gradient-to-r from-red-500/20 to-pink-500/20',
        border: 'border-red-500/40',
        text: 'text-red-400',
        badge: 'bg-red-500/30 text-red-300 border-red-500/50',
        icon: <AlertCircle size={16} className="text-red-400" />
      }
    case 'warn':
      return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
        border: 'border-yellow-500/40',
        text: 'text-yellow-400',
        badge: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50',
        icon: <TrendingUp size={16} className="text-yellow-400" />
      }
    default:
      return {
        bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/40',
        text: 'text-blue-400',
        badge: 'bg-blue-500/30 text-blue-300 border-blue-500/50',
        icon: <TrendingUp size={16} className="text-blue-400" />
      }
  }
}

export default function HotspotsCard({ data }: HotspotsCardProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotsCardProps['data'] extends Array<infer T> ? T : never | null>(null)

  return (
    <>
      <HotspotDetailPanel
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
      />
      
      <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 h-full rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
            <Flame className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Critical Hotspots</h2>
        </div>
        <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-sm font-medium text-red-400">
          {data?.length || 0} Active
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {data && data.length > 0 ? (
          data.slice(0, 5).map((hotspot, index) => {
            const styles = getSeverityStyles(hotspot.severity)
            return (
              <motion.div
                key={hotspot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${styles.bg} ${styles.border} hover:scale-102 transition-all duration-300 cursor-pointer group`}
                onClick={() => setSelectedHotspot(hotspot)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {styles.icon}
                      <div className="font-semibold text-gray-900 dark:text-white">{hotspot.entity}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-2xl font-bold ${styles.text}`}>
                        +{formatNumber(hotspot.percent_above)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-white/60">above baseline</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles.badge} uppercase tracking-wide`}>
                    {hotspot.severity}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(hotspot.percent_above, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                    className={`h-full rounded-full ${
                      hotspot.severity === 'critical' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                      hotspot.severity === 'warn' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}
                  />
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-12">
            <Flame className="mx-auto text-gray-300 dark:text-white/20 mb-4" size={48} />
            <p className="text-gray-600 dark:text-white/60">No hotspots detected</p>
            <p className="text-gray-500 dark:text-white/40 text-sm mt-1">System is running smoothly</p>
          </div>
        )}
      </div>
      </motion.div>
    </>
  )
}
