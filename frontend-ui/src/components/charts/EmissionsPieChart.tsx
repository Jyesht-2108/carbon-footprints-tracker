import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface EmissionsPieChartProps {
  data?: {
    categories: Record<string, number>
  }
}

const COLORS = [
  { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2' }, // cyan
  { main: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed' }, // purple
  { main: '#ec4899', light: '#f472b6', dark: '#db2777' }, // pink
  { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' }, // amber
  { main: '#10b981', light: '#34d399', dark: '#059669' }, // emerald
  { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' }, // blue
  { main: '#f97316', light: '#fb923c', dark: '#ea580c' }, // orange
  { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' }, // indigo
]

// Custom active shape for 3D effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 15}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={3}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 15}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.8}
      />
      <text
        x={cx}
        y={cy - 20}
        textAnchor="middle"
        fill="#fff"
        fontSize={16}
        fontWeight={700}
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fill="#06b6d4"
        fontSize={24}
        fontWeight={900}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <text
        x={cx}
        y={cy + 25}
        textAnchor="middle"
        fill="rgba(255,255,255,0.6)"
        fontSize={13}
        fontWeight={600}
      >
        {`${payload.value} kg CO₂`}
      </text>
    </g>
  )
}

export default function EmissionsPieChart({ data }: EmissionsPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0)

  if (!data?.categories) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-gray-600 dark:text-white/50">No emission data available</p>
      </div>
    )
  }

  // Convert categories object to array and filter out zero values
  const chartData = Object.entries(data.categories)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.length > 18 ? name.substring(0, 18) + '...' : name,
      fullName: name,
      value: Math.round(value * 10) / 10,
      percentage: 0
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  if (chartData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-gray-600 dark:text-white/50">No emissions recorded yet</p>
      </div>
    )
  }

  // Calculate percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  chartData.forEach(item => {
    item.percentage = Math.round((item.value / total) * 100)
  })

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-96 relative"
    >
      {/* 3D Shadow layers */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"></div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.light} stopOpacity={1} />
                <stop offset="50%" stopColor={color.main} stopOpacity={1} />
                <stop offset="100%" stopColor={color.dark} stopOpacity={1} />
              </linearGradient>
            ))}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
              <feOffset dx="0" dy="4" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="42%"
            innerRadius={70}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            animationBegin={0}
            animationDuration={1200}
            paddingAngle={3}
            style={{ filter: 'url(#shadow)' }}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#pieGradient${index % COLORS.length})`}
                stroke="rgba(15, 23, 42, 0.95)"
                strokeWidth={4}
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Pie>
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
            formatter={(value: number, name: string, props: any) => [
              `${value} kg CO₂ (${props.payload.percentage}%)`,
              props.payload.fullName
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={70}
            iconType="circle"
            wrapperStyle={{
              paddingTop: '28px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.8)',
            }}
            formatter={(value, entry: any) => {
              const item = chartData.find(d => d.name === value)
              return `${value} (${item?.percentage}%)`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
