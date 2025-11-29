import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface EmissionsHeatmapProps {
  data?: {
    categories: Record<string, number>
  }
}

export default function EmissionsHeatmap({ data }: EmissionsHeatmapProps) {
  if (!data?.categories) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-gray-600 dark:text-white/50">No emission data available</p>
      </div>
    )
  }

  // Convert to array and calculate intensity
  const items = Object.entries(data.categories)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (items.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-gray-600 dark:text-white/50">No emissions recorded yet</p>
      </div>
    )
  }

  const maxValue = Math.max(...items.map(i => i.value))
  const avgValue = items.reduce((sum, i) => sum + i.value, 0) / items.length

  // Get color based on intensity
  const getColor = (value: number) => {
    const intensity = value / maxValue
    // Align with new thresholds
    if (intensity > 0.9) return 'from-red-500 to-pink-600'
    if (intensity > 0.7) return 'from-amber-500 to-orange-600'
    if (intensity > 0.4) return 'from-yellow-500 to-amber-500'
    return 'from-emerald-500 to-teal-600'
  }

  const getIcon = (value: number) => {
    if (value > avgValue * 1.2) return <TrendingUp size={16} className="text-red-400" />
    if (value < avgValue * 0.8) return <TrendingDown size={16} className="text-emerald-400" />
    return <Minus size={16} className="text-yellow-400" />
  }

  const getIntensityLabel = (value: number) => {
    const intensity = value / maxValue
    // More reasonable thresholds - only top 10% is critical
    if (intensity > 0.9) return 'Critical'
    if (intensity > 0.7) return 'High'
    if (intensity > 0.4) return 'Medium'
    return 'Low'
  }

  return (
    <div className="w-full space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm font-semibold">Intensity:</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded"></div>
            <span className="text-xs text-white/50">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded"></div>
            <span className="text-xs text-white/50">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded"></div>
            <span className="text-xs text-white/50">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-3 bg-gradient-to-r from-red-500 to-pink-600 rounded"></div>
            <span className="text-xs text-white/50">Critical</span>
          </div>
        </div>
        <div className="text-white/60 text-sm">
          Average: <span className="text-white font-bold">{avgValue.toFixed(1)} kg CO₂</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item, index) => {
          const intensity = item.value / maxValue
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="relative group"
            >
              <div
                className={`
                  relative overflow-hidden rounded-xl border-2 border-white/10
                  bg-gradient-to-br ${getColor(item.value)}
                  hover:scale-105 hover:border-white/30 hover:z-10 transition-all duration-300
                  cursor-pointer h-36
                `}
                style={{ 
                  boxShadow: `0 0 ${intensity * 30}px rgba(${intensity > 0.7 ? '239, 68, 68' : intensity > 0.4 ? '251, 146, 60' : '16, 185, 129'}, ${intensity * 0.5})`
                }}
              >
                {/* Animated pulse effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Content */}
                <div className="relative h-full p-3 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wide leading-tight">
                      {getIntensityLabel(item.value)}
                    </span>
                    {getIcon(item.value)}
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold text-white mb-1.5 leading-none">
                      {item.value.toFixed(1)}
                    </div>
                    <div className="text-xs text-white font-bold truncate leading-tight mb-1">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-white/80 font-semibold">kg CO₂</div>
                  </div>
                </div>

                {/* Hover tooltip */}
                <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 rounded-xl">
                  <div className="text-center">
                    <div className="text-white font-bold text-sm mb-2 leading-tight">{item.name}</div>
                    <div className="text-3xl font-bold text-white mb-2">{item.value.toFixed(2)}</div>
                    <div className="text-xs text-white/90 font-semibold mb-2">kg CO₂</div>
                    <div className="text-xs text-white/70 leading-relaxed">
                      {((item.value / maxValue) * 100).toFixed(1)}% of max
                    </div>
                    <div className="text-xs text-white/70 leading-relaxed">
                      {item.value > avgValue ? '+' : ''}{((item.value - avgValue) / avgValue * 100).toFixed(1)}% vs avg
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="glass-card p-4">
          <div className="text-white/60 text-xs mb-1">Total Suppliers</div>
          <div className="text-2xl font-bold text-white">{items.length}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-white/60 text-xs mb-1">Highest Emitter</div>
          <div className="text-2xl font-bold text-red-400">{maxValue.toFixed(1)} kg</div>
          <div className="text-xs text-white/50 truncate">{items[0]?.name}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-white/60 text-xs mb-1">Total Emissions</div>
          <div className="text-2xl font-bold text-cyan-400">
            {items.reduce((sum, i) => sum + i.value, 0).toFixed(1)} kg
          </div>
        </div>
      </div>
    </div>
  )
}
