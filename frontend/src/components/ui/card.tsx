'use client'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm',
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}>{children}</div>
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
    <Card className="animate-fade-in">
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className={cn('text-2xl font-bold mt-1', {
              'text-gray-900 dark:text-white': variant === 'default',
              'text-success': variant === 'success',
              'text-warning': variant === 'warning',
              'text-danger': variant === 'danger',
            })}>{value}</p>
          </div>
          <div className={cn('p-3 rounded-lg', {
            'bg-primary-100 dark:bg-primary-900/30': variant === 'default',
            'bg-green-100 dark:bg-green-900/30': variant === 'success',
            'bg-yellow-100 dark:bg-yellow-900/30': variant === 'warning',
            'bg-red-100 dark:bg-red-900/30': variant === 'danger',
          })}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-sm">
            <span className={trend.positive ? 'text-success' : 'text-danger'}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-gray-500 dark:text-gray-400">vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
