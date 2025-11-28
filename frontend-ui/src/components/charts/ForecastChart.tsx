import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface ForecastChartProps {
  data?: {
    forecast?: Array<{
      date: string
      predicted_co2: number
    }> | number[]
    dates?: string[]
    confidence_low?: number[]
    confidence_high?: number[]
  }
}

export default function ForecastChart({ data }: ForecastChartProps) {
  // Handle different API response formats
  let chartData: any[] = []
  
  if (!data) {
    return (
      <div className="h-80 flex flex-col items-center justify-center">
        <TrendingUp className="text-cyan-500/30 mb-4" size={64} />
        <p className="text-gray-900 dark:text-white text-lg font-semibold">No forecast data available</p>
        <p className="text-gray-600 dark:text-white/50 text-sm mt-2">Upload data to see 7-day predictions</p>
      </div>
    )
  }

  // Check if data has dates and forecast arrays (backend format)
  if ((data as any).dates && (data as any).forecast) {
    const dates = (data as any).dates
    const forecast = (data as any).forecast
    
    if (Array.isArray(dates) && Array.isArray(forecast) && dates.length === forecast.length) {
      chartData = dates.map((date: string, index: number) => {
        try {
          const dateObj = new Date(date)
          return {
            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.round(forecast[index]),
            fullDate: dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          }
        } catch {
          return {
            date: date,
            value: Math.round(forecast[index]),
            fullDate: date
          }
        }
      })
    }
  }
  // Check if data has forecast array with objects (alternative format)
  else if (data.forecast && Array.isArray(data.forecast) && data.forecast.length > 0) {
    if (typeof data.forecast[0] === 'object') {
      chartData = data.forecast.map((item: any) => {
        try {
          const dateObj = new Date(item.date || item.timestamp)
          return {
            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.round(item.predicted_co2 || item.value || item.forecast || 0),
            fullDate: dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          }
        } catch {
          return {
            date: item.date || item.timestamp || 'Unknown',
            value: Math.round(item.predicted_co2 || item.value || item.forecast || 0),
            fullDate: item.date || item.timestamp || 'Unknown'
          }
        }
      })
    }
  }

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center">
        <TrendingUp className="text-cyan-500/30 mb-4" size={64} />
        <p className="text-gray-900 dark:text-white text-lg font-semibold">No forecast data available</p>
        <p className="text-gray-600 dark:text-white/50 text-sm mt-2">Upload data to see 7-day predictions</p>
      </div>
    )
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.5)" 
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)" 
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            label={{ value: 'CO₂ (kg)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.98)', 
              border: '2px solid rgba(6, 182, 212, 0.5)',
              borderRadius: '16px',
              backdropFilter: 'blur(20px)',
              padding: '12px 16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
            labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}
            itemStyle={{ color: '#06b6d4', fontWeight: 700, fontSize: 15 }}
            formatter={(value: any) => [`${value} kg CO₂`, 'Predicted']}
            labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#06b6d4" 
            strokeWidth={4}
            fill="url(#colorValue)"
            dot={{ fill: '#06b6d4', r: 6, strokeWidth: 3, stroke: '#0f172a' }}
            activeDot={{ r: 8, fill: '#06b6d4', stroke: '#fff', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
