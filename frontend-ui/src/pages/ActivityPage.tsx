import { Activity } from 'lucide-react'

export default function ActivityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Activity</h1>
        <p className="text-slate-400 mt-1">Recent system activity and events</p>
      </div>

      <div className="glass-card p-6">
        <div className="text-center py-12">
          <Activity className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Activity feed coming soon</p>
        </div>
      </div>
    </div>
  )
}
