'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle, ArrowLeftRight, RefreshCw, Clock } from 'lucide-react'
import { SummaryCard } from '@/components/summary-card'
import { StatusBadge } from '@/components/status-badge'
import { departments, departmentInventory, supplies, alerts, inventoryMovements, users } from '@/lib/mock-data'

export default function NodeDashboardPage() {
  const [deptId, setDeptId] = useState(1)
  const [dept, setDept] = useState(departments[0])

  useEffect(() => {
    const storedDeptId = parseInt(sessionStorage.getItem('sghd_nodo_department') || '1', 10)
    setDeptId(storedDeptId)
    const found = departments.find(d => d.id === storedDeptId)
    if (found) setDept(found)
  }, [])

  // Filter data for this department
  const localInventory = departmentInventory.filter(inv => inv.department_id === deptId)
  const localAlerts = alerts.filter(a => a.department_id === deptId && a.status === 'pendiente')
  const localMovements = inventoryMovements.filter(
    m => m.source_department_id === deptId || m.destination_department_id === deptId
  ).slice(0, 5)

  const totalItems = localInventory.reduce((acc, inv) => acc + inv.quantity, 0)
  const lowStockCount = localInventory.filter(inv => inv.quantity < inv.minimum_stock).length

  // Simulated sync status
  const lastSync = new Date(Date.now() - 1000 * 60 * 15).toLocaleString('es-CL')
  const pendingMovements = 2
  const pendingAlerts = 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Local</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vista del departamento de {dept.name}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Ítems en Stock"
          value={totalItems}
          icon={Package}
          subtitle={`${localInventory.length} tipos de insumos`}
        />
        <SummaryCard
          title="Stock Bajo"
          value={lowStockCount}
          icon={AlertTriangle}
          variant={lowStockCount > 0 ? 'warning' : 'default'}
          subtitle="Bajo mínimo requerido"
        />
        <SummaryCard
          title="Alertas Pendientes"
          value={localAlerts.length}
          icon={AlertTriangle}
          variant={localAlerts.length > 0 ? 'destructive' : 'default'}
          subtitle="Requieren atención"
        />
        <SummaryCard
          title="Movimientos Hoy"
          value={localMovements.length}
          icon={ArrowLeftRight}
          subtitle="Entradas y salidas"
        />
      </div>

      {/* Sync Status Card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Estado de Sincronización
          </h2>
          <StatusBadge variant="activo" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Última sincronización</p>
              <p className="text-sm font-medium text-foreground">{lastSync}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Movimientos pendientes</p>
              <p className="text-sm font-medium text-foreground">{pendingMovements}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Alertas por enviar</p>
              <p className="text-sm font-medium text-foreground">{pendingAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Local Inventory Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Inventario Local</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Insumo</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Cantidad</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Mínimo</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {localInventory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    No hay insumos registrados en este departamento
                  </td>
                </tr>
              ) : (
                localInventory.map((inv) => {
                  const supply = supplies.find(s => s.id === inv.supply_id)
                  const isLow = inv.quantity < inv.minimum_stock
                  return (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-5 py-3 font-medium text-foreground">
                        {supply?.name || 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-foreground">{inv.quantity}</td>
                      <td className="px-5 py-3 text-muted-foreground">{inv.minimum_stock}</td>
                      <td className="px-5 py-3">
                        <StatusBadge variant={isLow ? 'bajo_stock' : 'disponible'} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Local Movements */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Últimos Movimientos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Fecha</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Insumo</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Cantidad</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {localMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No hay movimientos recientes
                  </td>
                </tr>
              ) : (
                localMovements.map((mov) => {
                  const supply = supplies.find(s => s.id === mov.supply_id)
                  const user = users.find(u => u.id === mov.user_id)
                  return (
                    <tr key={mov.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(mov.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge variant={mov.type as 'entrada' | 'salida' | 'transferencia' | 'ajuste'} />
                      </td>
                      <td className="px-5 py-3 text-foreground">{supply?.name || 'N/A'}</td>
                      <td className="px-5 py-3 text-foreground">{mov.quantity}</td>
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
