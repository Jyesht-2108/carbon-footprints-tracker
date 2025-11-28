import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Download, RefreshCw, FileText, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { uploadApi } from '@/services/api'

interface UploadJob {
  id: string
  job_id: string
  filename: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  rows_total: number
  rows_processed: number
  errors: any
  created_at: string
  updated_at: string
}

export default function UploadHistory() {
  // Fetch real upload history from Data Core API
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['uploadHistory'],
    queryFn: async () => {
      try {
        // Fetch from Data Core ingest_jobs table
        const response = await uploadApi.getAllJobs(20)
        return response.data as UploadJob[]
      } catch (error) {
        console.warn('Failed to fetch upload history, showing empty state:', error)
        return [] as UploadJob[]
      }
    },
    refetchInterval: 5000, // Refresh every 5 seconds for processing jobs
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-emerald-400" size={20} />
      case 'failed':
        return <XCircle className="text-red-400" size={20} />
      case 'processing':
        return <Clock className="text-cyan-400 animate-spin" size={20} />
      default:
        return <Clock className="text-yellow-400" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'processing':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProgress = (job: UploadJob) => {
    if (job.rows_total === 0) return 0
    return Math.round((job.rows_processed / job.rows_total) * 100)
  }

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-white/5 rounded-lg"></div>
          <div className="h-16 bg-white/5 rounded-lg"></div>
          <div className="h-16 bg-white/5 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="text-cyan-400" size={24} />
          <h3 className="text-xl font-bold text-white">Upload History</h3>
        </div>
        <div className="text-sm text-white/60">
          {jobs?.length || 0} uploads
        </div>
      </div>

      <div className="space-y-3">
        {jobs && jobs.length > 0 ? (
          jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(job.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold truncate">{job.filename}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border uppercase ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="text-sm text-white/60">
                      {formatDate(job.created_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === 'completed' && (
                    <button
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={16} className="text-white/70" />
                    </button>
                  )}
                  {job.status === 'failed' && (
                    <button
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Retry"
                    >
                      <RefreshCw size={16} className="text-white/70" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {(job.status === 'processing' || job.status === 'completed') && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>{job.rows_processed.toLocaleString()} / {job.rows_total.toLocaleString()} rows</span>
                    <span>{getProgress(job)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgress(job)}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${
                        job.status === 'completed' 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {job.status === 'failed' && job.errors && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-300">
                    {job.errors.message || 'Upload failed'}
                  </div>
                </div>
              )}

              {/* Success Stats */}
              {job.status === 'completed' && (
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <div className="flex items-center gap-1">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span>{job.rows_processed.toLocaleString()} rows processed</span>
                  </div>
                  <div>
                    Duration: {Math.round((new Date(job.updated_at).getTime() - new Date(job.created_at).getTime()) / 1000)}s
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto text-white/20 mb-4" size={48} />
            <p className="text-white/60">No upload history yet</p>
            <p className="text-white/40 text-sm mt-1">Upload your first file to see it here</p>
          </div>
        )}
      </div>
    </div>
  )
}
