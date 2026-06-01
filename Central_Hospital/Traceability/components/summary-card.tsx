import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface SummaryCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  accent?: 'blue' | 'green' | 'amber' | 'red'
  className?: string
}

const accentClasses = {
  blue:  'text-blue-600 bg-blue-50',
  green: 'text-emerald-600 bg-emerald-50',
  amber: 'text-amber-600 bg-amber-50',
  red:   'text-red-600 bg-red-50',
}

export function SummaryCard({ title, value, icon: Icon, description, accent = 'blue', className }: SummaryCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', accentClasses[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
