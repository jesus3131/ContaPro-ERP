'use client'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('card-premium', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4 border-b border-[var(--border)]', className)}>{children}</div>
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

export function StatCard({ title, value, icon, trend, variant = 'default' }: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}) {
  return (
    <div className="card-premium p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className={cn('text-2xl font-bold font-heading mt-1', {
            'text-gray-900 dark:text-white': variant === 'default',
            'text-success': variant === 'success',
            'text-warning': variant === 'warning',
            'text-danger': variant === 'danger',
          })}>{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl shrink-0', {
          'bg-[#062B5B]/5 dark:bg-[#062B5B]/20': variant === 'default',
          'bg-green-50 dark:bg-green-900/20': variant === 'success',
          'bg-yellow-50 dark:bg-yellow-900/20': variant === 'warning',
          'bg-red-50 dark:bg-red-900/20': variant === 'danger',
        })}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={cn('font-semibold', trend.positive ? 'text-success' : 'text-danger')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-gray-400">vs mes anterior</span>
        </div>
      )}
    </div>
  )
}
