import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Upload, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Clock,
  Filter,
  Search
} from 'lucide-react'

interface ActivityEvent {
  id: string
  type: 'upload' | 'hotspot' | 'recommendation' | 'alert' | 'approval' | 'rejection'
  title: string
  description: string
  timestamp: Date
  user?: string
  metadata?: any
}

// Mock activity data - in production, this would come from an API
const generateMockActivities = (): ActivityEvent[] => {
  const now = new Date()
  return [
    {
      id: '1',
      type: 'upload',
      title: 'CSV Data Uploaded',
      description: 'test_data_realistic.csv uploaded successfully with 150 records',
      timestamp: new Date(now.getTime() - 5 * 60000),
      user: 'Current User',
      metadata: { rows: 150, filename: 'test_data_realistic.csv' }
    },
    {
      id: '2',
      type: 'hotspot',
      title: 'Critical Hotspot Detected',
      description: 'Heavy_Load_Supplier emissions 47.9% above baseline',
      timestamp: new Date(now.getTime() - 15 * 60000),
      metadata: { supplier: 'Heavy_Load_Supplier', percent: 47.9 }
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'AI Recommendation Generated',
      description: 'Switch to electric vehicles for urban routes',
      timestamp: new Date(now.getTime() - 25 * 60000),
      metadata: { impact: 125.5, confidence: 8.5 }
    },
    {
      id: '4',
      type: 'alert',
      title: 'Emissions Alert Triggered',
      description: 'Daily emissions exceeded target by 15%',
      timestamp: new Date(now.getTime() - 45 * 60000),
    },
    {
      id: '5',
      type: 'approval',
      title: 'Recommendation Approved',
      description: 'Route optimization recommendation approved',
      timestamp: new Date(now.getTime() - 60 * 60000),
      user: 'Current User',
    },
    {
      id: '6',
      type: 'upload',
      title: 'CSV Data Uploaded',
      description: 'monthly_emissions.csv uploaded with 500 records',
      timestamp: new Date(now.getTime() - 120 * 60000),
      user: 'Current User',
      metadata: { rows: 500, filename: 'monthly_emissions.csv' }
    },
    {
      id: '7',
      type: 'hotspot',
      title: 'Warning Hotspot Detected',
      description: 'Long_Distance_Supplier emissions 16.8% above baseline',
      timestamp: new Date(now.getTime() - 180 * 60000),
      metadata: { supplier: 'Long_Distance_Supplier', percent: 16.8 }
    },
    {
      id: '8',
      type: 'rejection',
      title: 'Recommendation Rejected',
      description: 'Alternative fuel recommendation rejected',
      timestamp: new Date(now.getTime() - 240 * 60000),
      user: 'Current User',
    },
  ]
}

const getActivityIcon = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'upload':
      return <Upload className="text-blue-400" size={20} />
    case 'hotspot':
      return <AlertTriangle className="text-red-400" size={20} />
    case 'recommendation':
      return <Lightbulb className="text-yellow-400" size={20} />
    case 'alert':
      return <TrendingUp className="text-orange-400" size={20} />
    case 'approval':
      return <CheckCircle className="text-green-400" size={20} />
    case 'rejection':
      return <XCircle className="text-gray-400" size={20} />
  }
}

const getActivityColor = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'upload':
      return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
    case 'hotspot':
      return 'from-red-500/20 to-pink-500/20 border-red-500/30'
    case 'recommendation':
      return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    case 'alert':
      return 'from-orange-500/20 to-red-500/20 border-orange-500/30'
    case 'approval':
      return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
    case 'rejection':
      return 'from-gray-500/20 to-slate-500/20 border-gray-500/30'
  }
}

const formatTimestamp = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function ActivityPage() {
  const [activities] = useState<ActivityEvent[]>(generateMockActivities())
  const [filter, setFilter] = useState<'all' | ActivityEvent['type']>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Activity size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Activity Feed
            </h1>
            <p className="text-white/60 mt-1">Real-time system events and user actions</p>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Filter size={16} className="inline mr-2" />
              All
            </button>
            <button
              onClick={() => setFilter('upload')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'upload'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Uploads
            </button>
            <button
              onClick={() => setFilter('hotspot')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'hotspot'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Hotspots
            </button>
            <button
              onClick={() => setFilter('recommendation')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'recommendation'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              AI
            </button>
          </div>
        </div>
      </motion.div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-12 rounded-xl text-center"
          >
            <Activity className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No activities found</p>
          </motion.div>
        ) : (
          filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-r ${getActivityColor(activity.type)} border rounded-xl p-6 hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-2">
                        {activity.description}
                      </p>
                      
                      {activity.metadata && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {activity.metadata.rows && (
                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                              {activity.metadata.rows} rows
                            </span>
                          )}
                          {activity.metadata.supplier && (
                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                              {activity.metadata.supplier}
                            </span>
                          )}
                          {activity.metadata.impact && (
                            <span className="px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">
                              -{activity.metadata.impact} kg CO₂
                            </span>
                          )}
                          {activity.metadata.confidence && (
                            <span className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-400">
                              {activity.metadata.confidence}/10 confidence
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                        <Clock size={14} />
                        {formatTimestamp(activity.timestamp)}
                      </div>
                      {activity.user && (
                        <div className="text-xs text-white/40">
                          by {activity.user}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
