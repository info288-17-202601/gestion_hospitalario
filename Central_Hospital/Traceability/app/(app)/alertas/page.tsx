'use client'

import { useEffect, useState } from 'react'
import { CheckCheck, Eye } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { getDepartments, getSupplies } from '@/lib/services'
import type { Alert, AlertStatus, Department, Supply } from '@/lib/types'

const alertTypeLabels: Record<string, string> = {
  bajo_stock: 'Bajo stock',
  error_sistema: 'Error sistema',
  autenticacion: 'Autenticación',
  inventario: 'Inventario',
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])

  const mapStatusToFrontend = (status: string): AlertStatus => {
    switch (status) {
      case 'PENDING': return 'pendiente'
      case 'REVIEWED': return 'revisada'
      case 'RESOLVED': return 'resuelta'
      default: return 'pendiente'
    }
  }

  const mapStatusToBackend = (status: AlertStatus): string => {
    switch (status) {
      case 'pendiente': return 'PENDING'
      case 'revisada': return 'REVIEWED'
      case 'resuelta': return 'RESOLVED'
    }
  }

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://localhost:7030/api/v1/alert')
        if (!res.ok) throw new Error('Error fetching alerts')
        const data = await res.json()
        const mappedAlerts = data.map((d: any) => ({
          ...d,
          status: mapStatusToFrontend(d.status)
        }))
        return mappedAlerts
      } catch (error) {
        console.error(error)
        return []
      }
    }

    Promise.all([fetchAlerts(), getDepartments(), getSupplies()]).then(([al, dp, sp]) => {
      setAlerts(al)
      setDepartments(dp)
      setSupplies(sp)
    })
  }, [])

  const getSupplyName = (id: number | null) => id ? supplies.find((s) => s.id === id)?.name ?? '-' : '-'
  const getDeptName = (id: number | null) => id ? departments.find((d) => d.id === id)?.name ?? '-' : '-'
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const handleUpdateStatus = async (id: number, status: AlertStatus) => {
    try {
      const backendStatus = mapStatusToBackend(status)
      const res = await fetch(`http://localhost:7030/api/v1/alert/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backendStatus })
      })
      if (!res.ok) throw new Error('Failed to update alert')
      const updatedBackend = await res.json()

      const updated: Alert = {
        ...updatedBackend,
        status: mapStatusToFrontend(updatedBackend.status)
      }
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)))
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const pending = alerts.filter((a) => a.status === 'pendiente').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Alertas del Sistema</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pending > 0 ? (
              <span className="text-amber-600 font-medium">{pending} alerta(s) pendiente(s)</span>
            ) : (
              'Sin alertas pendientes'
            )}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Mensaje</th>
                <th className="px-4 py-3 text-left font-medium">Insumo</th>
                <th className="px-4 py-3 text-left font-medium">Departamento</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Fecha</th>
                <th className="px-4 py-3 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No hay alertas</td></tr>
              )}
              {alerts.map((al) => (
                <tr key={al.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={al.type as 'bajo_stock_type' | 'autenticacion' | 'inventario' | 'error_sistema'}
                      label={alertTypeLabels[al.type] ?? al.type}
                    />
                  </td>
                  <td className="px-4 py-3 max-w-[260px] text-foreground">{al.message}</td>
                  <td className="px-4 py-3 text-muted-foreground">{getSupplyName(al.supply_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{getDeptName(al.department_id)}</td>
                  <td className="px-4 py-3"><StatusBadge variant={al.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(al.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {al.status === 'pendiente' && (
                        <button
                          onClick={() => handleUpdateStatus(al.id, 'revisada')}
                          className="flex items-center gap-1 rounded border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          Revisar
                        </button>
                      )}
                      {al.status !== 'resuelta' && (
                        <button
                          onClick={() => handleUpdateStatus(al.id, 'resuelta')}
                          className="flex items-center gap-1 rounded border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <CheckCheck className="h-3 w-3" />
                          Resolver
                        </button>
                      )}
                      {al.status === 'resuelta' && (
                        <span className="text-xs text-muted-foreground italic">Resuelta</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {alerts.length} alerta(s) en total
        </div>
      </div>
    </div>
  )
}
