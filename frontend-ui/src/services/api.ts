import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const DATA_CORE_URL = import.meta.env.VITE_DATA_CORE_URL || 'http://localhost:8001'
const ML_ENGINE_URL = import.meta.env.VITE_ML_ENGINE_URL || 'http://localhost:8001'

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

// ML Engine API
export const mlEngineApi = axios.create({
  baseURL: ML_ENGINE_URL,
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

// ML Prediction APIs
export interface LogisticsPredictionInput {
  distance_km: number
  load_kg: number
  vehicle_type: string
  fuel_type: string
  avg_speed: number
  stop_events: number
}

export interface FactoryPredictionInput {
  energy_kwh: number
  shift_hours: number
  machine_runtime_hours: number
  furnace_usage: number
  cooling_load: number
}

export interface WarehousePredictionInput {
  temperature: number
  energy_kwh: number
  refrigeration_load: number
  inventory_volume: number
}

export interface DeliveryPredictionInput {
  route_length: number
  vehicle_type: string
  traffic_score: number
  delivery_count: number
}

export interface PredictionResponse {
  co2_kg: number
  model_version: string
  confidence: number
}

export const mlPredictionApi = {
  predictLogistics: (input: LogisticsPredictionInput): Promise<{ data: PredictionResponse }> =>
    mlEngineApi.post('/api/v1/predict/logistics', input),
  
  predictFactory: (input: FactoryPredictionInput): Promise<{ data: PredictionResponse }> =>
    mlEngineApi.post('/api/v1/predict/factory', input),
  
  predictWarehouse: (input: WarehousePredictionInput): Promise<{ data: PredictionResponse }> =>
    mlEngineApi.post('/api/v1/predict/warehouse', input),
  
  predictDelivery: (input: DeliveryPredictionInput): Promise<{ data: PredictionResponse }> =>
    mlEngineApi.post('/api/v1/predict/delivery', input),
  
  // Batch prediction for all models
  predictAll: async (inputs: {
    logistics?: LogisticsPredictionInput
    factory?: FactoryPredictionInput
    warehouse?: WarehousePredictionInput
    delivery?: DeliveryPredictionInput
  }) => {
    const predictions: any = {}
    
    if (inputs.logistics) {
      try {
        const result = await mlEngineApi.post('/api/v1/predict/logistics', inputs.logistics)
        predictions.logistics = result.data
      } catch (error) {
        console.error('Logistics prediction failed:', error)
        predictions.logistics = { error: 'Prediction failed' }
      }
    }
    
    if (inputs.factory) {
      try {
        const result = await mlEngineApi.post('/api/v1/predict/factory', inputs.factory)
        predictions.factory = result.data
      } catch (error) {
        console.error('Factory prediction failed:', error)
        predictions.factory = { error: 'Prediction failed' }
      }
    }
    
    if (inputs.warehouse) {
      try {
        const result = await mlEngineApi.post('/api/v1/predict/warehouse', inputs.warehouse)
        predictions.warehouse = result.data
      } catch (error) {
        console.error('Warehouse prediction failed:', error)
        predictions.warehouse = { error: 'Prediction failed' }
      }
    }
    
    if (inputs.delivery) {
      try {
        const result = await mlEngineApi.post('/api/v1/predict/delivery', inputs.delivery)
        predictions.delivery = result.data
      } catch (error) {
        console.error('Delivery prediction failed:', error)
        predictions.delivery = { error: 'Prediction failed' }
      }
    }
    
    return predictions
  }
}
