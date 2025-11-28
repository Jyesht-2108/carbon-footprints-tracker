import { useState } from 'react'
import { Upload, FileText, CheckCircle, XCircle, FileUp } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { uploadApi } from '@/services/api'
import { motion } from 'framer-motion'
import UploadHistory from '@/components/upload/UploadHistory'

export default function IngestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadApi.uploadCSV(file),
    onSuccess: () => {
      setFile(null)
    },
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Data Upload Center
        </h1>
        <p className="text-white/60 mt-2">Upload CSV or XLSX files to feed the emissions pipeline</p>
      </motion.div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl">
        <div
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02]' 
              : 'border-white/20 hover:border-cyan-500/50 hover:bg-white/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto text-cyan-400 mb-6" size={64} />
          <p className="text-2xl font-bold text-white mb-3">
            Drag and drop your file here
          </p>
          <p className="text-white/60 mb-6">
            or click to browse
          </p>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl cursor-pointer hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
          >
            Select File
          </label>
        </div>

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <FileText className="text-white" size={28} />
              </div>
              <div>
                <div className="font-semibold text-white text-lg">{file.name}</div>
                <div className="text-sm text-white/60 font-medium">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/50"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Now'}
            </button>
          </motion.div>
        )}

        {uploadMutation.isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-xl flex items-center gap-4"
          >
            <CheckCircle className="text-green-400 flex-shrink-0" size={32} />
            <div>
              <div className="font-bold text-green-300 text-lg">Upload successful!</div>
              <div className="text-sm text-green-400/80 font-medium mt-1">
                Your data is being processed. Check the dashboard in a few minutes.
              </div>
            </div>
          </motion.div>
        )}

        {uploadMutation.isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-5 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-500/40 rounded-xl flex items-center gap-4"
          >
            <XCircle className="text-red-400 flex-shrink-0" size={32} />
            <div>
              <div className="font-bold text-red-300 text-lg">Upload failed</div>
              <div className="text-sm text-red-400/80 font-medium mt-1">
                {uploadMutation.error?.message || 'Please try again'}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Upload History */}
      <UploadHistory />

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
            <FileUp className="text-white" size={20} />
          </div>
          <h3 className="text-xl font-bold text-white">File Requirements</h3>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2 text-white/80">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span className="font-medium">Supported formats: CSV, XLSX</span>
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span className="font-medium">Maximum file size: 50MB</span>
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span className="font-medium">Required columns: supplier_id, timestamp, distance_km, load_kg, vehicle_type</span>
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span className="font-medium">Optional columns: fuel_type, speed, route_id</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
