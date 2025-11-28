import { useState } from 'react'
import { Settings, Bell, Shield, Database, Save, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

export default function SettingsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'data' | 'security'>('general')
  const [saved, setSaved] = useState(false)
  
  // Settings state
  const [settings, setSettings] = useState({
    // General
    companyName: 'Carbon Nexus Corp',
    industry: 'Manufacturing',
    location: 'United States',
    timezone: 'America/New_York',
    language: 'English',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    alertThreshold: 'medium',
    weeklyReports: true,
    monthlyReports: true,
    anomalyAlerts: true,
    
    // Data
    dataRetention: '12',
    autoBackup: true,
    exportFormat: 'csv',
    apiAccess: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
    ipWhitelist: false,
    auditLog: true
  })

  const handleSave = () => {
    // Save settings logic here
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Settings size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className={`mt-1 transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Manage your account and application preferences
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className={`
          lg:col-span-1 rounded-xl border p-4 space-y-2 transition-colors
          ${isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-200'
          }
        `}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${activeTab === tab.id
                    ? isDark
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 text-white'
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 text-gray-900'
                    : isDark
                      ? 'text-white/60 hover:bg-white/5 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Settings Content */}
        <div className={`
          lg:col-span-3 rounded-xl border p-6 transition-colors
          ${isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-200'
          }
        `}>
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                General Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className={`
                      w-full px-4 py-2 rounded-lg border transition-colors
                      ${isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20
                    `}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Industry
                  </label>
                  <select
                    value={settings.industry}
                    onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                    className={`
                      w-full px-4 py-2 rounded-lg border transition-colors
                      ${isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20
                    `}
                  >
                    <option>Manufacturing</option>
                    <option>Transportation</option>
                    <option>Energy</option>
                    <option>Retail</option>
                    <option>Technology</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={settings.location}
                    onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                    className={`
                      w-full px-4 py-2 rounded-lg border transition-colors
                      ${isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20
                    `}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className={`
                      w-full px-4 py-2 rounded-lg border transition-colors
                      ${isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20
                    `}
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className={`
                      w-full px-4 py-2 rounded-lg border transition-colors
                      ${isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20
                    `}
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                    <option>Japanese</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notification Preferences
              </h2>

              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive alerts via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly emissions summary' },
                  { key: 'monthlyReports', label: 'Monthly Reports', desc: 'Receive monthly analytics report' },
                  { key: 'anomalyAlerts', label: 'Anomaly Alerts', desc: 'Get notified of unusual patterns' }
                ].map((item) => (
                  <div key={item.key} className={`
                    flex items-center justify-between p-4 rounded-lg border transition-colors
                    ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}
                  `}>
                    <div>
                      <div className={`font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className={`text-sm transition-colors ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        {item.desc}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[item.key as keyof typeof settings] as boolean}
                        onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                ))}

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Alert Threshold
                  </label>
                  <select
                    value={settings.alertThreshold}
                    onChange={(e) => setSettings({ ...settings, alertThreshold: e.target.value })}
                    className={`
                      w-full px-4 py-2 rounded-lg border transition-colors
                      ${isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20
                    `}
                  >
                    <option value="low">Low - All alerts</option>
                    <option value="medium">Medium - Important alerts only</option>
                    <option value="high">High - Critical alerts only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Data & Privacy Settings */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Data & Privacy
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Data Retention Period (months)
                  </label>
                  <select
                    value={settings.dataRetention}
                    onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
                    className={`
                      w-full px-4 py-2 rounded-lg border transition-colors
                      ${isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20
                    `}
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Export Format
                  </label>
                  <select
                    value={settings.exportFormat}
                    onChange={(e) => setSettings({ ...settings, exportFormat: e.target.value })}
                    className={`
                      w-full px-4 py-2 rounded-lg border transition-colors
                      ${isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20
                    `}
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                {[
                  { key: 'autoBackup', label: 'Automatic Backups', desc: 'Daily automated data backups' },
                  { key: 'apiAccess', label: 'API Access', desc: 'Enable API access for integrations' }
                ].map((item) => (
                  <div key={item.key} className={`
                    flex items-center justify-between p-4 rounded-lg border transition-colors
                    ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}
                  `}>
                    <div>
                      <div className={`font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className={`text-sm transition-colors ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        {item.desc}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[item.key as keyof typeof settings] as boolean}
                        onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Security Settings
              </h2>

              <div className="space-y-4">
                {[
                  { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Add an extra layer of security' },
                  { key: 'ipWhitelist', label: 'IP Whitelist', desc: 'Restrict access to specific IP addresses' },
                  { key: 'auditLog', label: 'Audit Logging', desc: 'Track all system activities' }
                ].map((item) => (
                  <div key={item.key} className={`
                    flex items-center justify-between p-4 rounded-lg border transition-colors
                    ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}
                  `}>
                    <div>
                      <div className={`font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className={`text-sm transition-colors ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        {item.desc}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[item.key as keyof typeof settings] as boolean}
                        onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                ))}

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                    className={`
                      w-full px-4 py-2 rounded-lg border transition-colors
                      ${isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20
                    `}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex items-center justify-end gap-4">
            {saved && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-green-500"
              >
                <Check size={20} />
                <span className="font-medium">Settings saved!</span>
              </motion.div>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/50"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
