'use client'

import { useState, useEffect } from 'react'
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  ArrowLeftRight,
  Bell,
  CheckCircle,
  AlertTriangle,
  Server,
} from 'lucide-react'
import { departments } from '@/lib/mock-data'

type ConnectionStatus = 'connected' | 'disconnected' | 'syncing'

export default function NodeSincronizacionPage() {
  const [deptId, setDeptId] = useState(1)
  const [dept, setDept] = useState(departments[0])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected')
  const [lastSync, setLastSync] = useState<Date>(new Date(Date.now() - 1000 * 60 * 15))
  const [pendingMovements, setPendingMovements] = useState(2)
  const [pendingAlerts, setPendingAlerts] = useState(1)
  const [syncing, setSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)

  useEffect(() => {
    const storedDeptId = parseInt(sessionStorage.getItem('sghd_nodo_department') || '1', 10)
    setDeptId(storedDeptId)
    const found = departments.find(d => d.id === storedDeptId)
    if (found) setDept(found)
  }, [])

  const handleSync = async () => {
    if (connectionStatus === 'disconnected') return
    
    setSyncing(true)
    setConnectionStatus('syncing')
    
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSyncing(false)
    setConnectionStatus('connected')
    setLastSync(new Date())
    setPendingMovements(0)
    setPendingAlerts(0)
    setSyncSuccess(true)
    
    setTimeout(() => setSyncSuccess(false), 3000)
  }

  const toggleConnection = () => {
    setConnectionStatus(prev => prev === 'connected' ? 'disconnected' : 'connected')
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-accent'
      case 'disconnected': return 'text-destructive'
      case 'syncing': return 'text-primary'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return Wifi
      case 'disconnected': return WifiOff
      case 'syncing': return RefreshCw
    }
  }

  const StatusIcon = getStatusIcon()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sincronización</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estado de conexión con el Sistema Central
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Estado de Conexión</h2>
          <button
            onClick={toggleConnection}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Simular {connectionStatus === 'connected' ? 'desconexión' : 'conexión'}
          </button>
        </div>

        <div className="flex flex-col items-center py-6">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-secondary ${getStatusColor()}`}>
            <StatusIcon className={`h-10 w-10 ${connectionStatus === 'syncing' ? 'animate-spin' : ''}`} />
          </div>
          <p className={`mt-4 text-lg font-semibold ${getStatusColor()}`}>
            {connectionStatus === 'connected' && 'Conectado al Sistema Central'}
            {connectionStatus === 'disconnected' && 'Sin conexión'}
            {connectionStatus === 'syncing' && 'Sincronizando...'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Nodo: {dept.name}
          </p>
        </div>

        {/* Connection Info */}
        <div className="grid gap-4 mt-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Server className="h-4 w-4" />
              <span className="text-xs font-medium">Servidor Central</span>
            </div>
            <p className="text-sm font-mono text-foreground">central.hospital.local:8080</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Última Sincronización</span>
            </div>
            <p className="text-sm text-foreground">{lastSync.toLocaleString('es-CL')}</p>
          </div>
        </div>
      </div>

      {/* Pending Items */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Pending Movements */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Movimientos Pendientes</h3>
              <p className="text-xs text-muted-foreground">Por sincronizar con central</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-foreground">{pendingMovements}</span>
            {pendingMovements > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                Pendiente
              </span>
            )}
            {pendingMovements === 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle className="h-3 w-3" />
                Al día
              </span>
            )}
          </div>
        </div>

        {/* Pending Alerts */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Alertas Pendientes</h3>
              <p className="text-xs text-muted-foreground">Por enviar al sistema central</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-foreground">{pendingAlerts}</span>
            {pendingAlerts > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                Pendiente
              </span>
            )}
            {pendingAlerts === 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle className="h-3 w-3" />
                Al día
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sync Button */}
      <div className="rounded-xl border border-border bg-card p-6">
        {syncSuccess ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent mb-3">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Sincronización Exitosa</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Todos los datos han sido sincronizados con el sistema central
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <h3 className="font-semibold text-foreground">Sincronizar Ahora</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Envía los movimientos y alertas pendientes al sistema central
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing || connectionStatus === 'disconnected'}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
            </button>
            {connectionStatus === 'disconnected' && (
              <p className="text-center text-xs text-destructive mt-2">
                No es posible sincronizar sin conexión al sistema central
              </p>
            )}
          </>
        )}
      </div>

      {/* Sync Log */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Registro de Sincronización</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            { time: lastSync, type: 'Sincronización completa', status: 'success' },
            { time: new Date(Date.now() - 1000 * 60 * 60), type: 'Envío de alertas', status: 'success' },
            { time: new Date(Date.now() - 1000 * 60 * 120), type: 'Recepción de catálogos', status: 'success' },
            { time: new Date(Date.now() - 1000 * 60 * 180), type: 'Intento de conexión', status: 'failed' },
          ].map((log, idx) => (
            <div key={idx} className="flex items-center gap-4 px-5 py-3">
              <div className={`h-2 w-2 rounded-full ${log.status === 'success' ? 'bg-accent' : 'bg-destructive'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{log.type}</p>
                <p className="text-xs text-muted-foreground">{log.time.toLocaleString('es-CL')}</p>
              </div>
              <span className={`text-xs ${log.status === 'success' ? 'text-accent' : 'text-destructive'}`}>
                {log.status === 'success' ? 'Exitoso' : 'Fallido'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
