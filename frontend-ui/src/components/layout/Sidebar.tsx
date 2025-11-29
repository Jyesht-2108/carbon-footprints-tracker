import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Upload, Bell, Activity, Zap, MessageCircle, FlaskConical, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', gradient: 'from-cyan-500 to-blue-600' },
  { path: '/ingest', icon: Upload, label: 'Data Upload', gradient: 'from-green-500 to-emerald-600' },
  { path: '/insights', icon: Lightbulb, label: 'AI Insights', gradient: 'from-yellow-500 to-orange-600' },
  { path: '/alerts', icon: Bell, label: 'Alerts', gradient: 'from-orange-500 to-red-600' },
  { path: '/simulator', icon: FlaskConical, label: 'What-If Simulator', gradient: 'from-amber-500 to-orange-600' },
  { path: '/chat', icon: MessageCircle, label: 'AI Assistant', gradient: 'from-purple-500 to-pink-600' },
  { path: '/activity', icon: Activity, label: 'Activity', gradient: 'from-indigo-500 to-purple-600' },
]

export default function Sidebar() {
  const location = useLocation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`
      w-72 backdrop-blur-xl border-r flex flex-col relative overflow-hidden transition-colors duration-300
      ${isDark 
        ? 'bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-white/10' 
        : 'bg-gradient-to-b from-white/95 to-gray-50/95 border-gray-200/50'
      }
    `}>
      {/* Animated background gradient */}
      <div className={`
        absolute inset-0 opacity-50 transition-opacity duration-300
        ${isDark 
          ? 'bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5' 
          : 'bg-gradient-to-br from-cyan-400/10 via-purple-400/10 to-pink-400/10'
        }
      `}></div>
      
      {/* Logo Section */}
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <Zap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Carbon Nexus
            </h1>
          </div>
        </div>
        <p className={`text-sm font-medium ml-14 transition-colors ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          AI-Powered Emissions Intelligence
        </p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 relative z-10">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden',
                  isActive
                    ? isDark
                      ? 'bg-gradient-to-r from-white/20 to-white/10 text-white shadow-lg border border-white/20'
                      : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 shadow-md border border-gray-200'
                    : isDark
                      ? 'text-white/60 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-xl ${
                      isDark 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20' 
                        : 'bg-gradient-to-r from-cyan-100 to-blue-100'
                    }`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Icon with gradient background */}
                <div className={cn(
                  'p-2 rounded-lg transition-all duration-300',
                  isActive 
                    ? `bg-gradient-to-br ${item.gradient}` 
                    : isDark
                      ? 'bg-white/5 group-hover:bg-white/10'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                )}>
                  <Icon size={18} className={
                    isActive 
                      ? 'text-white' 
                      : isDark
                        ? 'text-white/60 group-hover:text-white'
                        : 'text-gray-600 group-hover:text-gray-900'
                  } />
                </div>
                
                <span className={cn(
                  'font-semibold text-sm relative z-10',
                  isActive 
                    ? isDark ? 'text-white' : 'text-gray-900'
                    : isDark
                      ? 'text-white/60 group-hover:text-white'
                      : 'text-gray-600 group-hover:text-gray-900'
                )}>
                  {item.label}
                </span>
                
                {/* Hover glow effect */}
                {!isActive && (
                  <div className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    ${isDark 
                      ? 'bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0' 
                      : 'bg-gradient-to-r from-cyan-500/0 via-cyan-500/3 to-cyan-500/0'
                    }
                  `}></div>
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>
      
      {/* Footer */}
      <div className={`p-4 border-t relative z-10 transition-colors ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className={`
          px-4 py-3 rounded-xl border transition-colors
          ${isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-gray-50 border-gray-200'
          }
        `}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className={`text-xs font-medium transition-colors ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              System Status
            </span>
          </div>
          <div className={`text-sm font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
            All Services Online
          </div>
          <div className={`text-xs mt-1 transition-colors ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
            v1.0.0 • Last sync: Just now
          </div>
        </div>
      </div>
    </div>
  )
}
