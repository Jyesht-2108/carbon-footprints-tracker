import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`
        relative p-3 rounded-xl transition-all duration-300 group overflow-hidden
        ${isDark 
          ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
          : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
        }
      `}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Background glow effect */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${isDark 
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20' 
          : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20'
        }
      `} />
      
      {/* Icon container */}
      <div className="relative">
        {isDark ? (
          <motion.div
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Moon 
              size={20} 
              className="text-cyan-400 group-hover:text-cyan-300 transition-colors" 
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Sun 
              size={20} 
              className="text-amber-500 group-hover:text-amber-600 transition-colors" 
            />
          </motion.div>
        )}
      </div>
      
      {/* Tooltip */}
      <div className={`
        absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
        ${isDark 
          ? 'bg-gray-800 text-white' 
          : 'bg-gray-700 text-white'
        }
      `}>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </div>
    </motion.button>
  )
}
