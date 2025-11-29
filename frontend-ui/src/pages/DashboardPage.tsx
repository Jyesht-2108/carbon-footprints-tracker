import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardApi } from '@/services/api'
import EmissionsCard from '@/components/cards/EmissionsCard'
import HotspotsCard from '@/components/cards/HotspotsCard'
import RecommendationsCard from '@/components/cards/RecommendationsCard'
import ForecastChart from '@/components/charts/ForecastChart'
import AlertsCard from '@/components/cards/AlertsCard'
import DataQualityCard from '@/components/cards/DataQualityCard'
import EmissionsPieChart from '@/components/charts/EmissionsPieChart'
import EmissionsBarChart from '@/components/charts/EmissionsBarChart'
import EmissionsHeatmap from '@/components/charts/EmissionsHeatmap'
import { ToastContainer } from '@/components/notifications/ToastNotification'
import { motion } from 'framer-motion'
import { Activity, PieChart, BarChart3, Grid3x3 } from 'lucide-react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useToast } from '@/hooks/useToast'
import { useEffect } from 'react'

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const { subscribe } = useWebSocket()
  const { toasts, removeToast, warning, info, error: showError } = useToast()

  // WebSocket event listeners
  useEffect(() => {
    const unsubscribeAlert = subscribe('new_alert', (data) => {
      console.log('🔔 New alert received:', data)
      warning('New Alert', data.message || 'A new alert has been detected', 8000)
    })

    const unsubscribeHotspot = subscribe('hotspot_detected', (data) => {
      console.log('🔥 Hotspot detected:', data)
      showError('Hotspot Detected', `${data.entity}: ${data.percent_above}% above baseline`, 10000)
    })

    const unsubscribeRecommendation = subscribe('recommendation_generated', (data) => {
      console.log('💡 New recommendation:', data)
      info('New Recommendation', data.title || 'A new AI recommendation is available', 8000)
    })

    const unsubscribeEmissionsUpdate = subscribe('emissions_update', (data) => {
      console.log('📊 Emissions data updated:', data)
      // Refetch all dashboard data when analysis completes
      queryClient.invalidateQueries({ queryKey: ['emissions'] })
      queryClient.invalidateQueries({ queryKey: ['hotspots'] })
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['forecast'] })
      queryClient.invalidateQueries({ queryKey: ['dataQuality'] })
      info('Dashboard Updated', 'New emissions data available', 5000)
    })

    return () => {
      unsubscribeAlert()
      unsubscribeHotspot()
      unsubscribeRecommendation()
      unsubscribeEmissionsUpdate()
    }
  }, [subscribe, warning, info, showError])

  const { data: emissions } = useQuery({
    queryKey: ['emissions'],
    queryFn: () => dashboardApi.getCurrentEmissions().then(res => {
      console.log('✅ Emissions:', res.data)
      return res.data
    }),
    refetchInterval: 30000,
  })

  const { data: hotspots } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => dashboardApi.getHotspots().then(res => res.data),
    refetchInterval: 30000,
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => dashboardApi.getRecommendations('pending').then(res => res.data),
    refetchInterval: 30000,
  })

  const { data: forecast } = useQuery({
    queryKey: ['forecast'],
    queryFn: () => dashboardApi.getForecast().then(res => {
      console.log('✅ Forecast:', res.data)
      return res.data
    }),
  })

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => dashboardApi.getAlerts().then(res => res.data),
    refetchInterval: 30000,
  })

  const { data: dataQuality } = useQuery({
    queryKey: ['dataQuality'],
    queryFn: () => dashboardApi.getDataQuality().then(res => {
      console.log('✅ Data Quality:', res.data)
      return res.data
    }),
  })

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="space-y-8 pb-12">
        {/* Header */}
        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Carbon Intelligence Dashboard
          </h1>
          <p className="text-gray-600 dark:text-white/60 mt-2 flex items-center gap-2">
            <Activity size={16} className="text-cyan-500" />
            Real-time emissions monitoring and AI-powered insights
          </p>
        </div>
        <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl">
          <div className="text-xs text-gray-600 dark:text-white/60 font-medium">Last Updated</div>
          <div className="text-sm text-gray-900 dark:text-white font-semibold">{new Date().toLocaleTimeString()}</div>
        </div>
      </motion.div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EmissionsCard data={emissions} />
        <AlertsCard data={alerts} />
        <DataQualityCard data={dataQuality} />
      </div>

      {/* Middle Row - Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 mt-8 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7-Day Emissions Forecast</h2>
            <p className="text-gray-600 dark:text-white/50 text-sm mt-1">AI-powered predictions for the next week</p>
          </div>
        </div>
        <ForecastChart data={forecast} />
      </motion.div>

      {/* Emission Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <PieChart className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Emissions by Supplier</h2>
              <p className="text-gray-600 dark:text-white/50 text-sm mt-1">Distribution of CO₂ across suppliers</p>
            </div>
          </div>
          <EmissionsPieChart data={emissions} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Emitters</h2>
              <p className="text-gray-600 dark:text-white/50 text-sm mt-1">Highest CO₂ producers ranked</p>
            </div>
          </div>
          <EmissionsBarChart data={emissions} />
        </motion.div>
      </div>

      {/* Heatmap Visualization - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 mt-8 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
            <Grid3x3 className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Emissions Heatmap</h2>
            <p className="text-gray-600 dark:text-white/50 text-sm mt-1">Visual intensity map of CO₂ by supplier</p>
          </div>
        </div>
        <EmissionsHeatmap data={emissions} />
      </motion.div>

      {/* Bottom Row - Hotspots & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <HotspotsCard data={hotspots} />
        <RecommendationsCard data={recommendations} />
      </div>
      </div>
    </>
  )
}
