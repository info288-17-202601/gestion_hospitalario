'use client'

import { useState, useEffect } from 'react'
import { StatusBadge } from '@/components/status-badge'
import { departments, alerts, supplies } from '@/lib/mock-data'

export default function NodeAlertasPage() {
  const [deptId, setDeptId] = useState(1)
  const [dept, setDept] = useState(departments[0])
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    const storedDeptId = parseInt(sessionStorage.getItem('sghd_nodo_department') || '1', 10)
    setDeptId(storedDeptId)
    const found = departments.find(d => d.id === storedDeptId)
    if (found) setDept(found)
  }, [])

  const localAlerts = alerts.filter(a => a.department_id === deptId)
  const filteredAlerts = filterStatus === 'all'
    ? localAlerts
    : localAlerts.filter(a => a.status === filterStatus)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alertas Locales</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Alertas del departamento de {dept.name}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pendiente', 'revisada', 'resuelta'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {s === 'all' ? 'Todas' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Fecha</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Mensaje</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Insumo</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No hay alertas para mostrar
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const supply = supplies.find(s => s.id === alert.supply_id)
                  return (
                    <tr key={alert.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(alert.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge variant={alert.type as 'bajo_stock_type' | 'error_sistema'} />
                      </td>
                      <td className="px-5 py-3 text-foreground max-w-xs truncate">
                        {alert.message}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {supply?.name || '-'}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge variant={alert.status as 'pendiente' | 'revisada' | 'resuelta'} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
