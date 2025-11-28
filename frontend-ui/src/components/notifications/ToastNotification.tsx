import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastNotificationProps {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  onClose: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'from-emerald-500 to-teal-600',
  error: 'from-red-500 to-pink-600',
  warning: 'from-amber-500 to-orange-600',
  info: 'from-cyan-500 to-blue-600',
}

const borderColors = {
  success: 'border-emerald-500/50',
  error: 'border-red-500/50',
  warning: 'border-amber-500/50',
  info: 'border-cyan-500/50',
}

export default function ToastNotification({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastNotificationProps) {
  const Icon = icons[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-4 min-w-[320px] max-w-md border-2 ${borderColors[type]} shadow-2xl`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[type]} flex-shrink-0`}>
          <Icon className="text-white" size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm mb-1">{title}</h4>
          <p className="text-white/70 text-xs leading-relaxed">{message}</p>
        </div>

        <button
          onClick={() => onClose(id)}
          className="text-white/50 hover:text-white transition-colors flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`h-1 mt-3 rounded-full bg-gradient-to-r ${colors[type]}`}
        />
      )}
    </motion.div>
  )
}

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: ToastType
    title: string
    message: string
    duration?: number
  }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastNotification {...toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
