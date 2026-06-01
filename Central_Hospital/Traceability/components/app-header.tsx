'use client'

import { Menu, LogOut, User, Cpu, Server } from 'lucide-react'
import type { SessionUser } from '@/lib/types'

interface AppHeaderProps {
  user: SessionUser
  onMenuClick: () => void
  onLogout: () => void
  isNode?: boolean
  departmentName?: string
}

export function AppHeader({ user, onMenuClick, onLogout, isNode, departmentName }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6 shadow-sm">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Environment badge */}
      {isNode ? (
        <div className="hidden items-center gap-2 rounded-md bg-accent/10 px-3 py-1.5 sm:flex">
          <Cpu className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium text-accent">Nodo: {departmentName}</span>
        </div>
      ) : (
        <div className="hidden items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 sm:flex">
          <Server className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">Sistema Central</span>
        </div>
      )}

      <div className="flex-1" />

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold text-foreground leading-none">{user.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user.role} &middot; {user.department}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User className="h-4 w-4" />
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
