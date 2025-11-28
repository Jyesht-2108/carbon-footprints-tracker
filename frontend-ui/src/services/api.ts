import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const DATA_CORE_URL = import.meta.env.VITE_DATA_CORE_URL || 'http://localhost:8001'

// Orchestration Engine API
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Data Core API
export const dataCoreApi = axios.create({
  baseURL: DATA_CORE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dashboard APIs
export const dashboardApi = {
  getCurrentEmissions: () => api.get('/emissions/current'),
  getForecast: () => api.get('/emissions/forecast'),
  getHotspots: () => api.get('/hotspots'),
  getRecommendations: (status?: string) => 
    api.get('/recommendations', { params: { status } }),
  getAlerts: () => api.get('/alerts'),
  getDataQuality: () => api.get('/data-quality'),
}

// Recommendation APIs
export const recommendationApi = {
  approve: (id: number) => api.post(`/recommendations/${id}/approve`),
  reject: (id: number) => api.post(`/recommendations/${id}/reject`),
}

// Upload APIs
export const uploadApi = {
  uploadCSV: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return dataCoreApi.post('/api/v1/ingest/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  getJobStatus: (jobId: string) => 
    dataCoreApi.get(`/api/v1/ingest/status/${jobId}`),
  getAllJobs: (limit: number = 20) =>
    dataCoreApi.get(`/api/v1/ingest/jobs?limit=${limit}`),
}

// Simulation API
export const simulationApi = {
  simulate: (params: any) => api.post('/simulate', params),
}
