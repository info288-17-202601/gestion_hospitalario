'use client'

import { useEffect, useState } from 'react'
import {
  Package,
  Building2,
  Bell,
  ArrowLeftRight,
  Users,
} from 'lucide-react'
import { SummaryCard } from '@/components/summary-card'
import { StatusBadge } from '@/components/status-badge'
import {
  getDepartments,
  getAlerts,
  getInventoryMovements,
  getUsers,
  getSupplies,
  getDepartmentInventory,
} from '@/lib/services'
import { departments as depts, supplies as supplyList, categories as cats } from '@/lib/mock-data'
import type { Alert, InventoryMovement, DepartmentInventory } from '@/lib/types'

export default function DashboardPage() {
  const [alertCount, setAlertCount] = useState(0)
  const [movementsRecent, setMovementsRecent] = useState<InventoryMovement[]>([])
  const [alertsRecent, setAlertsRecent] = useState<Alert[]>([])
  const [inventory, setInventory] = useState<DepartmentInventory[]>([])
  const [userCount, setUserCount] = useState(0)
  const [deptCount, setDeptCount] = useState(0)
  const [supplyCount, setSupplyCount] = useState(0)

  useEffect(() => {
    Promise.all([
      getAlerts(),
      getInventoryMovements(),
      getUsers(),
      getDepartments(),
      getSupplies(),
      getDepartmentInventory(),
    ]).then(([al, mv, us, dp, sp, inv]) => {
      setAlertCount(al.filter((a) => a.status === 'pendiente').length)
      setMovementsRecent(mv.slice(0, 5))
      setAlertsRecent(al.slice(0, 4))
      setUserCount(us.filter((u) => u.is_active).length)
      setDeptCount(dp.filter((d) => d.is_active).length)
      setSupplyCount(sp.filter((s) => s.is_active).length)
      setInventory(inv)
    })
  }, [])

  const getSupplyName = (id: number) => supplyList.find((s) => s.id === id)?.name ?? '-'
  const getDeptName = (id: number) => depts.find((d) => d.id === id)?.name ?? '-'
  const getCategoryName = (supplyId: number) => {
    const sup = supplyList.find((s) => s.id === supplyId)
    return cats.find((c) => c.id === sup?.category_id)?.name ?? '-'
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Resumen general del sistema</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard title="Insumos activos"       value={supplyCount} icon={Package}        accent="blue" />
        <SummaryCard title="Departamentos activos" value={deptCount}   icon={Building2}      accent="green" />
        <SummaryCard title="Alertas pendientes"    value={alertCount}  icon={Bell}           accent="amber" />
        <SummaryCard title="Movimientos totales"   value={movementsRecent.length} icon={ArrowLeftRight} accent="blue" />
        <SummaryCard title="Usuarios activos"      value={userCount}   icon={Users}          accent="green" />
      </div>

      {/* Tables row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent movements */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Últimos movimientos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">Tipo</th>
                  <th className="px-4 py-2.5 text-left font-medium">Insumo</th>
                  <th className="px-4 py-2.5 text-right font-medium">Cantidad</th>
                  <th className="px-4 py-2.5 text-left font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movementsRecent.map((mv) => (
                  <tr key={mv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                    <td className="px-4 py-2.5">
                      <StatusBadge variant={mv.type} />
                    </td>
                    <td className="px-4 py-2.5 text-foreground">{getSupplyName(mv.supply_id)}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{mv.quantity}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{formatDate(mv.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent alerts */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Alertas recientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">Tipo</th>
                  <th className="px-4 py-2.5 text-left font-medium">Mensaje</th>
                  <th className="px-4 py-2.5 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {alertsRecent.map((al) => (
                  <tr key={al.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                    <td className="px-4 py-2.5">
                      <StatusBadge variant={`${al.type}` as 'bajo_stock_type' | 'autenticacion' | 'inventario' | 'error_sistema'} label={al.type.replace('_', ' ')} />
                    </td>
                    <td className="px-4 py-2.5 text-foreground max-w-[200px] truncate">{al.message}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge variant={al.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inventory summary by dept */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Inventario resumido por departamento</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium">Departamento</th>
                <th className="px-4 py-2.5 text-left font-medium">Insumo</th>
                <th className="px-4 py-2.5 text-left font-medium">Categoría</th>
                <th className="px-4 py-2.5 text-right font-medium">Cantidad</th>
                <th className="px-4 py-2.5 text-right font-medium">Stock mín.</th>
                <th className="px-4 py-2.5 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const isLow = item.quantity <= item.minimum_stock
                return (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                    <td className="px-4 py-2.5 font-medium">{getDeptName(item.department_id)}</td>
                    <td className="px-4 py-2.5">{getSupplyName(item.supply_id)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{getCategoryName(item.supply_id)}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{item.quantity}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{item.minimum_stock}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge variant={isLow ? 'bajo_stock' : 'disponible'} label={isLow ? 'Bajo stock' : 'Disponible'} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
