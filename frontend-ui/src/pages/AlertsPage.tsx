import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/services/api'
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function AlertsPage() {
  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => dashboardApi.getAlerts().then(res => res.data),
    refetchInterval: 30000,
  })

  const getAlertStyles = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-pink-500/20',
          border: 'border-red-500/40',
          icon: <AlertTriangle className="text-red-400" size={28} />,
          badge: 'bg-red-500/30 text-red-300 border-red-500/50'
        }
      case 'warn':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-500/40',
          icon: <AlertCircle className="text-yellow-400" size={28} />,
          badge: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-500/40',
          icon: <Info className="text-blue-400" size={28} />,
          badge: 'bg-blue-500/30 text-blue-300 border-blue-500/50'
        }
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
          System Alerts
        </h1>
        <p className="text-white/60 mt-2">Real-time system alerts and notifications</p>
      </motion.div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl">
        <div className="space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert: any, index: number) => {
              const styles = getAlertStyles(alert.level)
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-5 rounded-xl border ${styles.bg} ${styles.border} hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {styles.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-lg mb-2">{alert.message}</div>
                      <div className="text-sm text-white/60 font-medium">
                        {formatDate(alert.created_at)}
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${styles.badge} uppercase tracking-wide flex-shrink-0`}>
                      {alert.level}
                    </span>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="text-center py-16">
              <CheckCircle className="mx-auto text-green-500/30 mb-4" size={64} />
              <p className="text-white text-lg font-semibold">No alerts at this time</p>
              <p className="text-white/50 text-sm mt-2">System is running smoothly</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
