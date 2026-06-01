'use client'

import { cn } from '@/lib/utils'

type Variant =
  | 'disponible'
  | 'bajo_stock'
  | 'pendiente'
  | 'revisada'
  | 'resuelta'
  | 'activo'
  | 'inactivo'
  | 'exitoso'
  | 'fallido'
  | 'entrada'
  | 'salida'
  | 'transferencia'
  | 'ajuste'
  | 'bajo_stock_type'
  | 'error_sistema'
  | 'autenticacion'
  | 'inventario'
  | 'password'
  | 'rfid_pin'

const variantClasses: Record<Variant, string> = {
  disponible:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  bajo_stock:      'bg-red-50 text-red-700 border-red-200',
  pendiente:       'bg-amber-50 text-amber-700 border-amber-200',
  revisada:        'bg-blue-50 text-blue-700 border-blue-200',
  resuelta:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  activo:          'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactivo:        'bg-gray-100 text-gray-500 border-gray-200',
  exitoso:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  fallido:         'bg-red-50 text-red-700 border-red-200',
  entrada:         'bg-blue-50 text-blue-700 border-blue-200',
  salida:          'bg-orange-50 text-orange-700 border-orange-200',
  transferencia:   'bg-purple-50 text-purple-700 border-purple-200',
  ajuste:          'bg-gray-100 text-gray-600 border-gray-200',
  bajo_stock_type: 'bg-red-50 text-red-700 border-red-200',
  error_sistema:   'bg-orange-50 text-orange-700 border-orange-200',
  autenticacion:   'bg-purple-50 text-purple-700 border-purple-200',
  inventario:      'bg-blue-50 text-blue-700 border-blue-200',
  password:        'bg-gray-100 text-gray-600 border-gray-200',
  rfid_pin:        'bg-indigo-50 text-indigo-700 border-indigo-200',
}

const labels: Partial<Record<Variant, string>> = {
  bajo_stock_type: 'Bajo stock',
  error_sistema:   'Error sistema',
  rfid_pin:        'RFID/PIN',
}

interface StatusBadgeProps {
  variant: Variant
  label?: string
  className?: string
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const displayLabel = label ?? labels[variant] ?? variant.charAt(0).toUpperCase() + variant.slice(1)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {displayLabel}
    </span>
  )
}
