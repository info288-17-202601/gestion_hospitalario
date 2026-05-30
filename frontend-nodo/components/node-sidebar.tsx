'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ArrowLeftRight,
  Bell,
  Building2,
  RefreshCw,
  Cpu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/nodo/dashboard',          label: 'Dashboard Local',     icon: LayoutDashboard },
  { href: '/nodo/inventario',         label: 'Mi Inventario',       icon: Package },
  { href: '/nodo/registrar-movimiento', label: 'Registrar Movimiento', icon: PlusCircle },
  { href: '/nodo/movimientos',        label: 'Movimientos Locales', icon: ArrowLeftRight },
  { href: '/nodo/alertas',            label: 'Alertas Locales',     icon: Bell },
  { href: '/nodo/departamento',       label: 'Mi Departamento',     icon: Building2 },
  { href: '/nodo/sincronizacion',     label: 'Sincronización',      icon: RefreshCw },
]

interface NodeSidebarProps {
  open: boolean
  onClose: () => void
  departmentName: string
}

export function NodeSidebar({ open, onClose, departmentName }: NodeSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-sidebar transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground leading-none">Nodo Local</p>
            <p className="text-[10px] text-sidebar-foreground/60 mt-0.5 leading-none truncate">
              {departmentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Navegación local">
          <ul className="flex flex-col gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-5 py-3">
          <p className="text-[10px] text-sidebar-foreground/40">Nodo Departamental v1.0</p>
        </div>
      </aside>
    </>
  )
}
