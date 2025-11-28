import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'

interface EmissionsBarChartProps {
  data?: {
    categories: Record<string, number>
  }
}

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#6366f1']

export default function EmissionsBarChart({ data }: EmissionsBarChartProps) {
  if (!data?.categories) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-gray-600 dark:text-white/50">No emission data available</p>
      </div>
    )
  }

  // Convert categories to array and sort by value
  const chartData = Object.entries(data.categories)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      fullName: name,
      value: Math.round(value * 10) / 10,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 only

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-gray-600 dark:text-white/50">No emissions recorded yet</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-96"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient key={`gradient-${index}`} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }}
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}
            label={{ 
              value: 'CO₂ (kg)', 
              angle: -90, 
              position: 'insideLeft', 
              fill: 'rgba(255,255,255,0.7)', 
              fontSize: 13, 
              fontWeight: 700,
              offset: 10
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.98)',
              border: '2px solid rgba(6, 182, 212, 0.5)',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
            labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}
            itemStyle={{ color: '#06b6d4', fontWeight: 700, fontSize: 13 }}
            formatter={(value: number) => [`${value} kg CO₂`, 'Emissions']}
            labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
            cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
          />
          <Bar 
            dataKey="value" 
            radius={[12, 12, 0, 0]} 
            animationDuration={1000}
            maxBarSize={60}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#barGradient${index % COLORS.length})`}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
