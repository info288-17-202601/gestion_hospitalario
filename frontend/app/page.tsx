'use client'

import { useRouter } from 'next/navigation'
import { Hospital, Server, Cpu } from 'lucide-react'

export default function EnvironmentSelectionPage() {
  const router = useRouter()

  const handleSelect = (env: 'central' | 'nodo') => {
    sessionStorage.setItem('sghd_environment', env)
    if (env === 'nodo') {
      // Set default department for node (Urgencias)
      sessionStorage.setItem('sghd_nodo_department', '1')
    }
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-md">
            <Hospital className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            Sistema de Gestión Hospitalario Distribuido
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seleccione el entorno de trabajo
          </p>
        </div>

        {/* Environment Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Sistema Central */}
          <button
            onClick={() => handleSelect('central')}
            className="group flex flex-col items-center gap-4 rounded-xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Server className="h-7 w-7" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Sistema Central</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Acceso completo a todas las funcionalidades del hospital
              </p>
            </div>
            <ul className="mt-2 w-full space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                Dashboard global
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                Gestión de departamentos
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                Administración de usuarios
              </li>
            </ul>
          </button>

          {/* Nodo Departamental */}
          <button
            onClick={() => handleSelect('nodo')}
            className="group flex flex-col items-center gap-4 rounded-xl border-2 border-border bg-card p-6 text-left transition-all hover:border-accent hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
              <Cpu className="h-7 w-7" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Nodo Departamental</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vista local filtrada por departamento (Urgencias)
              </p>
            </div>
            <ul className="mt-2 w-full space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-accent" />
                Inventario local
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-accent" />
                Movimientos del departamento
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-accent" />
                Sincronización con central
              </li>
            </ul>
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Proyecto Semestral — Sistemas Distribuidos
        </p>
      </div>
    </div>
  )
}
