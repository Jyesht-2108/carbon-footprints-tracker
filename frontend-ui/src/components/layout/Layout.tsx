import { ReactNode, useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { wsService } from '../../services/websocket'
import ToastNotification from '../notifications/ToastNotification'
import { useToast } from '../../hooks/useToast'
import { useTheme } from '../../contexts/ThemeContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { toasts, removeToast, addToast } = useToast()
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect()
    
    // Listen for new alerts
    const handleNewAlert = (alertData: any) => {
      console.log('🚨 New alert received:', alertData)
      
      // Show popup notification
      addToast({
        id: Date.now().toString(),
        type: alertData.level === 'critical' ? 'error' : alertData.level === 'warn' ? 'warning' : 'info',
        title: `${alertData.level?.toUpperCase() || 'ALERT'}`,
        message: alertData.message || `New ${alertData.level} alert detected`,
        duration: alertData.level === 'critical' ? 10000 : 5000
      })
      
      // Increment unread count
      setUnreadAlerts(prev => prev + 1)
      
      // Browser notification (if permission granted)
      if (Notification.permission === 'granted') {
        new Notification(`Carbon Nexus - ${alertData.level?.toUpperCase() || 'ALERT'}`, {
          body: alertData.message || `New ${alertData.level} alert detected`,
          icon: '/favicon.ico',
          tag: 'carbon-alert'
        })
      }
    }
    
    // Listen for new hotspots
    const handleNewHotspot = (hotspotData: any) => {
      console.log('🔥 New hotspot detected:', hotspotData)
      
      // Show popup notification for hotspots
      addToast({
        id: Date.now().toString(),
        type: hotspotData.severity === 'critical' ? 'error' : 'warning',
        title: `${hotspotData.severity?.toUpperCase() || 'HOTSPOT'} Hotspot`,
        message: `${hotspotData.entity}: ${hotspotData.predicted_co2?.toFixed(1)} kg CO₂ (${hotspotData.percent_above?.toFixed(1)}% above baseline)`,
        duration: 7000
      })
      
      // Increment unread count
      setUnreadAlerts(prev => prev + 1)
    }
    
    wsService.on('new_alert', handleNewAlert)
    wsService.on('new_hotspot', handleNewHotspot)
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    return () => {
      wsService.off('new_alert', handleNewAlert)
      wsService.off('new_hotspot', handleNewHotspot)
      wsService.disconnect()
    }
  }, [addToast])
  
  // Function to clear unread count
  const clearUnreadAlerts = () => {
    setUnreadAlerts(0)
  }

  return (
    <div className={`
      flex h-screen relative overflow-hidden transition-colors duration-300
      ${isDark 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
      }
    `}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`
          absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse
          ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-400/20'}
        `}></div>
        <div className={`
          absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse
          ${isDark ? 'bg-purple-500/10' : 'bg-purple-400/20'}
        `} style={{ animationDelay: '1s' }}></div>
        <div className={`
          absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse
          ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/20'}
        `} style={{ animationDelay: '2s' }}></div>
      </div>
      
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-20">
        <Topbar unreadAlerts={unreadAlerts} onClearAlerts={clearUnreadAlerts} />
        <main className="flex-1 overflow-y-auto p-8 relative z-20">
          {children}
        </main>
      </div>
      
      {/* Toast Notifications */}
      <div className="fixed top-24 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}
