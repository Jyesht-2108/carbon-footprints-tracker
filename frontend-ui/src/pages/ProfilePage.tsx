import { useState } from 'react'
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit2, Save, Camera, Award, TrendingUp, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

export default function ProfilePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@carbonnexus.com',
    phone: '+1 (555) 123-4567',
    role: 'System Manager',
    department: 'Sustainability',
    location: 'San Francisco, CA',
    joinDate: 'January 2024',
    bio: 'Passionate about sustainability and reducing carbon emissions. Leading the charge towards a greener future.'
  })

  const stats = [
    { label: 'Reports Generated', value: '127', icon: TrendingUp, color: 'from-cyan-500 to-blue-600' },
    { label: 'Emissions Reduced', value: '2.5T', icon: Target, color: 'from-green-500 to-emerald-600' },
    { label: 'Recommendations', value: '43', icon: Award, color: 'from-purple-500 to-pink-600' },
    { label: 'Days Active', value: '328', icon: Calendar, color: 'from-amber-500 to-orange-600' }
  ]

  const recentActivity = [
    { action: 'Generated emissions forecast', time: '2 hours ago', type: 'forecast' },
    { action: 'Uploaded new data file', time: '5 hours ago', type: 'upload' },
    { action: 'Approved recommendation', time: '1 day ago', type: 'recommendation' },
    { action: 'Viewed anomaly alert', time: '2 days ago', type: 'alert' },
    { action: 'Ran What-If simulation', time: '3 days ago', type: 'simulation' }
  ]

  const handleSave = () => {
    setIsEditing(false)
    // Save profile logic here
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Profile
            </h1>
            <p className={`mt-1 transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Manage your personal information and preferences
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className={`
          lg:col-span-1 rounded-xl border p-6 transition-colors
          ${isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-purple-500 rounded-full text-white hover:bg-purple-600 transition-colors shadow-lg">
                <Camera size={18} />
              </button>
            </div>

            {/* Name and Role */}
            <h2 className={`mt-4 text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {profile.name}
            </h2>
            <p className={`text-sm transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              {profile.role}
            </p>

            {/* Edit Button */}
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {isEditing ? (
                <>
                  <Save size={18} />
                  Save Profile
                </>
              ) : (
                <>
                  <Edit2 size={18} />
                  Edit Profile
                </>
              )}
            </button>

            {/* Stats */}
            <div className="w-full mt-6 space-y-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={index}
                    className={`
                      p-3 rounded-lg border transition-colors
                      ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <span className={`text-sm transition-colors ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                          {stat.label}
                        </span>
                      </div>
                      <span className={`text-lg font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stat.value}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className={`
          lg:col-span-2 rounded-xl border p-6 transition-colors
          ${isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-200'
          }
        `}>
          <h3 className={`text-xl font-bold mb-6 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
                className={`
                  w-full px-4 py-2 rounded-lg border transition-colors
                  ${isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
            </div>

            {/* Email */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
                className={`
                  w-full px-4 py-2 rounded-lg border transition-colors
                  ${isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
            </div>

            {/* Phone */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                <Phone size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
                className={`
                  w-full px-4 py-2 rounded-lg border transition-colors
                  ${isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
            </div>

            {/* Location */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                <MapPin size={16} />
                Location
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                disabled={!isEditing}
                className={`
                  w-full px-4 py-2 rounded-lg border transition-colors
                  ${isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
            </div>

            {/* Department */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                <Briefcase size={16} />
                Department
              </label>
              <input
                type="text"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                disabled={!isEditing}
                className={`
                  w-full px-4 py-2 rounded-lg border transition-colors
                  ${isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
            </div>

            {/* Join Date */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                <Calendar size={16} />
                Member Since
              </label>
              <input
                type="text"
                value={profile.joinDate}
                disabled
                className={`
                  w-full px-4 py-2 rounded-lg border transition-colors
                  ${isDark
                    ? 'bg-white/5 border-white/10 text-white/50'
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                  } cursor-not-allowed
                `}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
              className={`
                w-full px-4 py-2 rounded-lg border transition-colors resize-none
                ${isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-cyan-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h3 className={`text-xl font-bold mb-4 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-colors
                    ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'alert' ? 'bg-red-500' :
                      activity.type === 'forecast' ? 'bg-blue-500' :
                      activity.type === 'upload' ? 'bg-green-500' :
                      activity.type === 'recommendation' ? 'bg-purple-500' :
                      'bg-amber-500'
                    }`}></div>
                    <span className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {activity.action}
                    </span>
                  </div>
                  <span className={`text-sm transition-colors ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
