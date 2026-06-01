'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormModalProps {
  title: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function FormModal({ title, open, onClose, children, className }: FormModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-card shadow-xl border border-border',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
