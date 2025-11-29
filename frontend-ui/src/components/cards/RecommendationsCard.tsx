import { Lightbulb, ThumbsUp, ThumbsDown, Sparkles, TrendingDown } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recommendationApi } from '@/services/api'
import { motion } from 'framer-motion'
import { useState } from 'react'
import RecommendationDetailModal from '../modals/RecommendationDetailModal'

interface RecommendationsCardProps {
  data?: Array<{
    id: number
    title: string
    description: string
    impact_co2_kg: number
    confidence_score: number
    status: string
    created_at: string
    co2_reduction?: number
    feasibility?: number
  }>
}

export default function RecommendationsCard({ data }: RecommendationsCardProps) {
  const queryClient = useQueryClient()
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationsCardProps['data'] extends Array<infer T> ? T | null : null>(null)

  const approveMutation = useMutation({
    mutationFn: (id: number) => recommendationApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => recommendationApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })

  return (
    <>
      <RecommendationDetailModal
        recommendation={selectedRecommendation}
        onClose={() => setSelectedRecommendation(null)}
        onApprove={(id) => approveMutation.mutate(id)}
        onReject={(id) => rejectMutation.mutate(id)}
      />
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 h-full rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
      >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg relative">
            <Lightbulb className="text-white" size={24} />
            <Sparkles className="absolute -top-1 -right-1 text-yellow-300" size={12} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Recommendations</h2>
        </div>
        <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-sm font-medium text-yellow-400">
          {data?.length || 0} Pending
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {data && data.length > 0 ? (
          data.slice(0, 5).map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
              onClick={() => setSelectedRecommendation(rec)}
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-3 dark:group-hover:text-purple-300 transition-colors">
                {rec.title}
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <TrendingDown className="text-green-400" size={16} />
                  <span className="text-green-400 font-bold text-sm">
                    -{Math.abs(rec.impact_co2_kg || rec.co2_reduction || 0)} kg CO₂
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-4 rounded-full ${
                        i < (rec.confidence_score || rec.feasibility || 0) 
                          ? 'bg-gradient-to-t from-cyan-500 to-blue-500' 
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 dark:text-white/60 ml-2">
                    {Math.round((rec.confidence_score || rec.feasibility || 0) * 10) / 10}/10
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => approveMutation.mutate(rec.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 text-green-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ThumbsUp size={16} />
                  Approve
                </button>
                <button
                  onClick={() => rejectMutation.mutate(rec.id)}
                  disabled={rejectMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ThumbsDown size={16} />
                  Reject
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <Lightbulb className="mx-auto text-gray-300 dark:text-white/20 mb-4" size={48} />
            <p className="text-gray-600 dark:text-white/60">No recommendations available</p>
            <p className="text-gray-500 dark:text-white/40 text-sm mt-1">AI will generate suggestions soon</p>
          </div>
        )}
      </div>
      </motion.div>
    </>
  )
}
