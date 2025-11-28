import { motion, AnimatePresence } from 'framer-motion'
import { X, Lightbulb, TrendingDown, DollarSign, Clock, CheckCircle, Target, Zap } from 'lucide-react'

interface RecommendationDetailModalProps {
  recommendation: {
    id: number
    title: string
    description: string
    impact_co2_kg?: number
    co2_reduction?: number
    confidence_score?: number
    confidence?: number
    feasibility?: number
    status: string
    created_at: string
  } | null
  onClose: () => void
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
}

export default function RecommendationDetailModal({
  recommendation,
  onClose,
  onApprove,
  onReject,
}: RecommendationDetailModalProps) {
  if (!recommendation) return null

  // Handle different field names from API
  const co2Reduction = Math.abs(recommendation.impact_co2_kg || recommendation.co2_reduction || 0)
  const confidence = recommendation.confidence_score || recommendation.confidence || recommendation.feasibility || 0
  const confidencePercent = Math.round(confidence * 10)
  
  // Get cost impact from API (e.g., "-2%", "+3%", "0%")
  const costImpact = (recommendation as any).cost_impact || "0%"
  const costImpactNum = parseFloat(costImpact.replace('%', ''))
  
  // Calculate estimated costs based on CO2 reduction and cost impact
  // These are estimates - in production, these would come from a cost database
  const estimatedImplementationCost = Math.round(co2Reduction * 50 + 500) // $50 per kg CO2 + base cost
  const estimatedAnnualSavings = Math.round(co2Reduction * 300) // $300 per kg CO2 annually
  const roiMonths = estimatedAnnualSavings > 0 
    ? Math.round((estimatedImplementationCost / estimatedAnnualSavings) * 12)
    : 12

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-t-2xl border-b-2 border-cyan-400/50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Lightbulb className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">AI Recommendation</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wide">
                      {recommendation.status}
                    </span>
                    <span className="text-white/80 text-sm">
                      {new Date(recommendation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
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
          <div className="p-8 space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-3">{recommendation.title}</h3>
              <p className="text-white/70 text-lg leading-relaxed">{recommendation.description}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-6 border-2 border-emerald-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                    <TrendingDown className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">CO₂ Reduction</div>
                    <div className="text-3xl font-bold text-emerald-400">
                      {co2Reduction.toFixed(1)} kg
                    </div>
                  </div>
                </div>
                <div className="text-white/50 text-xs">Per implementation</div>
              </div>

              <div className="glass-card p-6 border-2 border-cyan-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                    <Target className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">Confidence</div>
                    <div className="text-3xl font-bold text-cyan-400">{confidencePercent}%</div>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidencePercent}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Cost-Benefit Analysis */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-amber-400" size={24} />
                  <h4 className="text-xl font-bold text-white">Cost-Benefit Analysis</h4>
                </div>
                <span className="text-xs text-white/40 italic">Estimated values</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span className="text-white/70">Implementation Cost (est.)</span>
                  <span className="text-white font-bold">
                    ${(estimatedImplementationCost * 0.8).toLocaleString()} - ${(estimatedImplementationCost * 1.2).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span className="text-white/70">Annual Savings (est.)</span>
                  <span className="text-emerald-400 font-bold">
                    ${(estimatedAnnualSavings * 0.8).toLocaleString()} - ${(estimatedAnnualSavings * 1.2).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span className="text-white/70">Cost Impact (from API)</span>
                  <span className={`font-bold ${costImpactNum < 0 ? 'text-emerald-400' : costImpactNum > 0 ? 'text-red-400' : 'text-white'}`}>
                    {costImpact}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <span className="text-white/70">ROI Timeline (est.)</span>
                  <span className="text-emerald-400 font-bold">
                    {roiMonths < 12 ? `${roiMonths} months` : `${Math.round(roiMonths / 12)} years`}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-300">
                  💡 <strong>Note:</strong> Cost estimates are calculated based on industry averages ($50/kg CO₂ implementation, $300/kg CO₂ annual savings). 
                  Actual costs may vary based on your specific operations.
                </p>
              </div>
            </div>

            {/* Implementation Steps */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="text-cyan-400" size={24} />
                <h4 className="text-xl font-bold text-white">Implementation Steps</h4>
              </div>
              <div className="space-y-3">
                {[
                  'Conduct initial assessment of current operations',
                  'Identify key stakeholders and get buy-in',
                  'Develop detailed implementation plan',
                  'Pilot test with small subset of operations',
                  'Monitor results and adjust as needed',
                  'Scale to full implementation',
                  'Track and report on CO₂ reduction'
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-white/80 text-sm pt-1">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Expected Timeline */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-purple-400" size={24} />
                  <h4 className="text-xl font-bold text-white">Expected Timeline</h4>
                </div>
                <span className="text-xs text-white/40 italic">Based on complexity</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-white/60 text-sm">Planning</div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-1/4 bg-gradient-to-r from-purple-500 to-pink-600"></div>
                  </div>
                  <div className="w-24 text-white text-sm font-semibold">
                    {confidencePercent >= 80 ? '1 week' : confidencePercent >= 60 ? '1-2 weeks' : '2-3 weeks'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-white/60 text-sm">Implementation</div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                  </div>
                  <div className="w-24 text-white text-sm font-semibold">
                    {confidencePercent >= 80 ? '2-3 weeks' : confidencePercent >= 60 ? '3-4 weeks' : '4-6 weeks'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-white/60 text-sm">Monitoring</div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                  </div>
                  <div className="w-24 text-white text-sm font-semibold">Ongoing</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-xs text-purple-300">
                  ⏱️ <strong>Timeline varies by confidence:</strong> Higher confidence ({confidencePercent}%) = faster implementation. 
                  Lower confidence requires more planning and testing.
                </p>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="glass-card p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-emerald-400" size={24} />
                <h4 className="text-xl font-bold text-white">Key Benefits</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Reduced carbon footprint',
                  'Lower operational costs',
                  'Improved efficiency',
                  'Better sustainability metrics',
                  'Enhanced brand reputation',
                  'Regulatory compliance'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                    <CheckCircle className="text-emerald-400 flex-shrink-0" size={16} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm p-6 border-t border-white/10 rounded-b-2xl">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  onApprove?.(recommendation.id)
                  onClose()
                }}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Approve & Implement
              </button>
              <button
                onClick={() => {
                  onReject?.(recommendation.id)
                  onClose()
                }}
                className="flex-1 px-6 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <X size={20} />
                Reject
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
