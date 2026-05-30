'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, PlusCircle, List } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { getDepartmentInventory, getDepartments, getSupplies } from '@/lib/services'
import { categories } from '@/lib/mock-data'
import type { DepartmentInventory, Department, Supply } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function InventarioPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<DepartmentInventory[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    Promise.all([getDepartmentInventory(), getDepartments(), getSupplies()]).then(
      ([inv, deps, sups]) => {
        setInventory(inv)
        setDepartments(deps)
        setSupplies(sups)
      }
    )
  }, [])

  const getSupply = (id: number) => supplies.find((s) => s.id === id)
  const getDept = (id: number) => departments.find((d) => d.id === id)
  const getCategory = (supplyId: number) => {
    const sup = getSupply(supplyId)
    return categories.find((c) => c.id === sup?.category_id)
  }

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const supply = getSupply(item.supply_id)
      const dept = getDept(item.department_id)
      const isLow = item.quantity <= item.minimum_stock

      if (searchTerm && !supply?.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (deptFilter && String(item.department_id) !== deptFilter) return false
      if (statusFilter === 'bajo_stock' && !isLow) return false
      if (statusFilter === 'disponible' && isLow) return false
      return true
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, supplies, departments, searchTerm, deptFilter, statusFilter])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">Inventario por Departamento</h1>
        <p className="text-sm text-muted-foreground">Stock actual de insumos en cada departamento</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-input bg-card py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos los departamentos</option>
          {departments.map((d) => (
            <option key={d.id} value={String(d.id)}>{d.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="bajo_stock">Bajo stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Departamento</th>
                <th className="px-4 py-3 text-left font-medium">Insumo</th>
                <th className="px-4 py-3 text-left font-medium">Código</th>
                <th className="px-4 py-3 text-left font-medium">Categoría</th>
                <th className="px-4 py-3 text-right font-medium">Cantidad</th>
                <th className="px-4 py-3 text-left font-medium">Unidad</th>
                <th className="px-4 py-3 text-right font-medium">Stock mín.</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No se encontraron registros
                  </td>
                </tr>
              )}
              {filtered.map((item) => {
                const supply = getSupply(item.supply_id)
                const dept = getDept(item.department_id)
                const cat = getCategory(item.supply_id)
                const isLow = item.quantity <= item.minimum_stock
                return (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                    <td className="px-4 py-3 font-medium">{dept?.name ?? '-'}</td>
                    <td className="px-4 py-3">{supply?.name ?? '-'}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{supply?.internal_code ?? '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cat?.name ?? '-'}</td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${isLow ? 'text-red-600' : 'text-foreground'}`}>
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{supply?.unit_of_measure ?? '-'}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{item.minimum_stock}</td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={isLow ? 'bajo_stock' : 'disponible'} label={isLow ? 'Bajo stock' : 'Disponible'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push('/movimientos')}
                          className="flex items-center gap-1 rounded border border-primary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          <PlusCircle className="h-3 w-3" />
                          Movimiento
                        </button>
                        <button
                          onClick={() => router.push('/movimientos')}
                          className="flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
                        >
                          <List className="h-3 w-3" />
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {filtered.length} registro(s) encontrado(s)
        </div>
      </div>
    </div>
  )
}
