import { Bell, Settings, Search, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../theme/ThemeToggle'
import { useTheme } from '../../contexts/ThemeContext'

interface TopbarProps {
  unreadAlerts?: number
  onClearAlerts?: () => void
}

export default function Topbar({ unreadAlerts = 0, onClearAlerts }: TopbarProps) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const handleNotificationClick = () => {
    // Navigate to alerts page
    navigate('/alerts')
    
    // Clear unread count
    if (onClearAlerts) {
      onClearAlerts()
    }
  }
  
  return (
    <div className={`
      h-20 backdrop-blur-xl border-b flex items-center justify-between px-8 relative overflow-hidden transition-all duration-300
      ${isDark 
        ? 'bg-gradient-to-r from-slate-900/95 to-slate-950/95 border-white/10' 
        : 'bg-gradient-to-r from-white/95 to-gray-50/95 border-gray-200/50'
      }
    `}>
      {/* Subtle gradient overlay */}
      <div className={`
        absolute inset-0 transition-opacity duration-300
        ${isDark 
          ? 'bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5' 
          : 'bg-gradient-to-r from-cyan-500/3 via-transparent to-blue-500/3'
        }
      `}></div>
      
      <div className="flex items-center gap-6 relative z-10">
        {/* Date and Time */}
        <div>
          <div className={`text-sm font-medium transition-colors ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className={`text-lg font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className={`
          hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[300px]
          ${isDark 
            ? 'bg-white/5 border border-white/10 hover:bg-white/10' 
            : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
          }
        `}>
          <Search size={18} className={isDark ? 'text-white/40' : 'text-gray-400'} />
          <input
            type="text"
            placeholder="Search emissions, hotspots..."
            className={`
              bg-transparent border-none outline-none text-sm flex-1 transition-colors
              ${isDark 
                ? 'text-white placeholder-white/40' 
                : 'text-gray-900 placeholder-gray-400'
              }
            `}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 relative z-10">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Notifications with Badge */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNotificationClick}
          className={`
            relative p-3 rounded-xl transition-all duration-300 group
            ${isDark 
              ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white' 
              : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 hover:text-gray-900'
            }
          `}
          title="View Alerts"
        >
          <Bell size={20} className={unreadAlerts > 0 ? 'text-yellow-500' : ''} />
          
          {unreadAlerts > 0 && (
            <>
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse z-10">
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </span>
              {/* Pulsing Ring Animation */}
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 animate-ping opacity-75"></span>
            </>
          )}
          
          <div className={`
            absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity
            ${isDark 
              ? 'bg-gradient-to-r from-cyan-500/0 to-cyan-500/20' 
              : 'bg-gradient-to-r from-cyan-500/0 to-cyan-500/10'
            }
          `}></div>
        </motion.button>
        
        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/settings')}
          className={`
            p-3 rounded-xl transition-all duration-300 group relative overflow-hidden
            ${isDark 
              ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white' 
              : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 hover:text-gray-900'
            }
          `}
          title="Settings"
        >
          <Settings size={20} />
          <div className={`
            absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity
            ${isDark 
              ? 'bg-gradient-to-r from-purple-500/0 to-purple-500/20' 
              : 'bg-gradient-to-r from-purple-500/0 to-purple-500/10'
            }
          `}></div>
        </motion.button>
        
        {/* User Profile */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profile')}
          className={`
            flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
            ${isDark 
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/50' 
              : 'bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 hover:border-cyan-300'
            }
          `}
          title="Profile"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="hidden lg:block text-left">
            <div className={`text-sm font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Admin User
            </div>
            <div className={`text-xs transition-colors ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              System Manager
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}
