'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { departmentInventory, supplies, categories, departments } from '@/lib/mock-data'

export default function NodeInventarioPage() {
  const [deptId, setDeptId] = useState(1)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState(departments[0])

  useEffect(() => {
    const storedDeptId = parseInt(sessionStorage.getItem('sghd_nodo_department') || '1', 10)
    setDeptId(storedDeptId)
    const found = departments.find(d => d.id === storedDeptId)
    if (found) setDept(found)
  }, [])

  const localInventory = departmentInventory.filter(inv => inv.department_id === deptId)

  const filteredInventory = localInventory.filter((inv) => {
    const supply = supplies.find(s => s.id === inv.supply_id)
    if (!supply) return false
    const term = search.toLowerCase()
    return (
      supply.name.toLowerCase().includes(term) ||
      supply.internal_code.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Inventario</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inventario del departamento de {dept.name}
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar insumo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Código</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Insumo</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Categoría</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Cantidad</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Mínimo</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Unidad</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                    No se encontraron insumos
                  </td>
                </tr>
              ) : (
                filteredInventory.map((inv) => {
                  const supply = supplies.find(s => s.id === inv.supply_id)
                  const category = supply ? categories.find(c => c.id === supply.category_id) : null
                  const isLow = inv.quantity < inv.minimum_stock
                  return (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {supply?.internal_code}
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {supply?.name}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {category?.name || 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-foreground">{inv.quantity}</td>
                      <td className="px-5 py-3 text-muted-foreground">{inv.minimum_stock}</td>
                      <td className="px-5 py-3 text-muted-foreground">{supply?.unit_of_measure}</td>
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
    </div>
  )
}
