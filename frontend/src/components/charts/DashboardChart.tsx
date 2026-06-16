'use client'
{/* Componente: DashboardChart
   Propósito: Gráfico de dashboard: barras, líneas para evolución mensual */}
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatMonth } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

interface DashboardChartProps {
  data: any[]
  type?: 'area' | 'bar' | 'pie'
  xKey?: string
  series?: { key: string; name: string; color: string }[]
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        {typeof label === 'number' ? formatMonth(label) : label}
      </p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function DashboardChart({ data, type = 'bar', xKey = 'name', series }: DashboardChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Sin datos disponibles</div>
  }

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            formatter={(value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            {series?.map((s) => (
              <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey={xKey}
            tickFormatter={(v) => formatMonth(v)}
            className="text-xs text-gray-500"
          />
          <YAxis className="text-xs text-gray-500" tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          {series?.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              fill={`url(#gradient-${s.key})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis dataKey={xKey} className="text-xs text-gray-500" />
        <YAxis className="text-xs text-gray-500" tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        {series?.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
