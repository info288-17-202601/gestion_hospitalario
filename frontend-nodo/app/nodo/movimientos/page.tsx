'use client'

import { useState, useEffect } from 'react'
import { StatusBadge } from '@/components/status-badge'
import { departments, inventoryMovements, supplies, users } from '@/lib/mock-data'

export default function NodeMovimientosPage() {
  const [deptId, setDeptId] = useState(1)
  const [dept, setDept] = useState(departments[0])
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    const storedDeptId = parseInt(sessionStorage.getItem('sghd_nodo_department') || '1', 10)
    setDeptId(storedDeptId)
    const found = departments.find(d => d.id === storedDeptId)
    if (found) setDept(found)
  }, [])

  const localMovements = inventoryMovements.filter(
    m => m.source_department_id === deptId || m.destination_department_id === deptId
  )

  const filteredMovements = filterType === 'all'
    ? localMovements
    : localMovements.filter(m => m.type === filterType)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Movimientos Locales</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historial de movimientos del departamento de {dept.name}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'entrada', 'salida', 'transferencia'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filterType === t
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {t === 'all' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1)}
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
                <th className="px-5 py-3 font-medium text-muted-foreground">Insumo</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Cantidad</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Origen</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Destino</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const supply = supplies.find(s => s.id === mov.supply_id)
                  const user = users.find(u => u.id === mov.user_id)
                  const srcDept = departments.find(d => d.id === mov.source_department_id)
                  const dstDept = departments.find(d => d.id === mov.destination_department_id)
                  return (
                    <tr key={mov.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(mov.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge variant={mov.type as 'entrada' | 'salida' | 'transferencia' | 'ajuste'} />
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {supply?.name || 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-foreground">{mov.quantity}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {srcDept?.name || '-'}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {dstDept?.name || '-'}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {user ? `${user.first_name} ${user.last_name}` : 'N/A'}
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
