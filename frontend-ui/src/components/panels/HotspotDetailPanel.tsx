import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface HotspotDetailPanelProps {
  hotspot: {
    id: number
    entity: string
    entity_type: string
    predicted_co2: number
    baseline_co2: number
    percent_above: number
    severity: 'info' | 'warn' | 'critical'
    status: string
    created_at: string
  } | null
  onClose: () => void
}

const severityColors = {
  critical: {
    bg: 'from-red-500 to-pink-600',
    border: 'border-red-500/50',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  warn: {
    bg: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  info: {
    bg: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500/50',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  }
}

export default function HotspotDetailPanel({ hotspot, onClose }: HotspotDetailPanelProps) {
  if (!hotspot) return null

  const colors = severityColors[hotspot.severity]

  // Generate mock historical data for trend
  const historicalData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    baseline: hotspot.baseline_co2,
    actual: hotspot.baseline_co2 * (1 + (Math.random() * 0.5 + (hotspot.percent_above / 100)))
  }))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-2xl h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`sticky top-0 z-10 bg-gradient-to-r ${colors.bg} p-6 border-b-2 ${colors.border}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-white" size={28} />
                  <h2 className="text-2xl font-bold text-white">Hotspot Details</h2>
                </div>
                <p className="text-white/80 text-sm">Detailed analysis and recommendations</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Entity Info */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className={colors.text} size={20} />
                    <h3 className="text-xl font-bold text-white">{hotspot.entity}</h3>
                  </div>
                  <p className="text-white/60 text-sm capitalize">{hotspot.entity_type}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg border ${colors.badge} font-bold uppercase text-sm`}>
                  {hotspot.severity}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-xs mb-1">Current CO₂</div>
                  <div className="text-2xl font-bold text-white">{hotspot.predicted_co2.toFixed(1)}</div>
                  <div className="text-white/40 text-xs">kg CO₂</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-xs mb-1">Baseline</div>
                  <div className="text-2xl font-bold text-white">{hotspot.baseline_co2.toFixed(1)}</div>
                  <div className="text-white/40 text-xs">kg CO₂</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-xs mb-1">Above Baseline</div>
                  <div className={`text-2xl font-bold ${colors.text}`}>+{hotspot.percent_above.toFixed(1)}%</div>
                  <div className="text-white/40 text-xs">increase</div>
                </div>
              </div>
            </div>

            {/* Historical Trend */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-cyan-400" size={20} />
                <h3 className="text-lg font-bold text-white">7-Day Trend</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="day"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      label={{ value: 'CO₂ (kg)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.98)',
                        border: '2px solid rgba(6, 182, 212, 0.5)',
                        borderRadius: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Baseline"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', r: 4 }}
                      name="Actual"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Root Cause Analysis */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Possible Root Causes</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                  <div>
                    <div className="text-white font-semibold text-sm">Increased Load Factor</div>
                    <div className="text-white/60 text-xs mt-1">Vehicles carrying heavier loads than usual</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-2"></div>
                  <div>
                    <div className="text-white font-semibold text-sm">Route Inefficiency</div>
                    <div className="text-white/60 text-xs mt-1">Longer routes or traffic congestion detected</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2"></div>
                  <div>
                    <div className="text-white font-semibold text-sm">Vehicle Type Change</div>
                    <div className="text-white/60 text-xs mt-1">Shift to less efficient vehicle types</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recommended Actions</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <div className="text-white font-semibold text-sm">Optimize Route Planning</div>
                    <div className="text-white/60 text-xs mt-1">Review and optimize delivery routes to reduce distance</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <div className="text-white font-semibold text-sm">Consider Alternative Vehicles</div>
                    <div className="text-white/60 text-xs mt-1">Evaluate switching to electric or hybrid vehicles</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <div className="text-white font-semibold text-sm">Consolidate Shipments</div>
                    <div className="text-white/60 text-xs mt-1">Combine multiple small deliveries to improve efficiency</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Timeline */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-cyan-400" size={20} />
                <h3 className="text-lg font-bold text-white">Status & Timeline</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Status</span>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-semibold capitalize">
                    {hotspot.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Detected</span>
                  <span className="text-white text-sm font-semibold">
                    {new Date(hotspot.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Duration</span>
                  <span className="text-white text-sm font-semibold">
                    {Math.floor((Date.now() - new Date(hotspot.created_at).getTime()) / (1000 * 60 * 60))} hours
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  alert(`Hotspot #${hotspot.id} marked as resolved!`)
                  onClose()
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                Mark as Resolved
              </button>
              <button 
                onClick={() => {
                  const note = prompt('Add a note for this hotspot:')
                  if (note) {
                    alert(`Note added: "${note}"`)
                  }
                }}
                className="flex-1 px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all"
              >
                Add Note
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
