'use client'

import { useState, useEffect } from 'react'
import { Building2, MapPin, Users, Package, CheckCircle } from 'lucide-react'
import { departments, users, departmentInventory, supplies } from '@/lib/mock-data'

export default function NodeDepartamentoPage() {
  const [deptId, setDeptId] = useState(1)
  const [dept, setDept] = useState(departments[0])

  useEffect(() => {
    const storedDeptId = parseInt(sessionStorage.getItem('sghd_nodo_department') || '1', 10)
    setDeptId(storedDeptId)
    const found = departments.find(d => d.id === storedDeptId)
    if (found) setDept(found)
  }, [])

  const deptUsers = users.filter(u => u.department_id === deptId && u.is_active)
  const localInventory = departmentInventory.filter(inv => inv.department_id === deptId)
  const totalItems = localInventory.reduce((acc, inv) => acc + inv.quantity, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Departamento</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Información del departamento de {dept.name}
        </p>
      </div>

      {/* Department Info Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{dept.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {dept.location}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {dept.is_active ? (
                <span className="inline-flex items-center gap-1 text-sm text-accent">
                  <CheckCircle className="h-4 w-4" />
                  Activo
                </span>
              ) : (
                <span className="text-sm text-destructive">Inactivo</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 mt-6 sm:grid-cols-3">
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Personal</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{deptUsers.length}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="text-xs">Tipos de Insumos</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{localInventory.length}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="text-xs">Ítems en Stock</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{totalItems}</p>
          </div>
        </div>
      </div>

      {/* Personnel */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Personal del Departamento</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Nombre</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">RUT</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Rol</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Correo</th>
              </tr>
            </thead>
            <tbody>
              {deptUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    No hay personal registrado
                  </td>
                </tr>
              ) : (
                deptUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3 font-medium text-foreground">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {user.rut}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{user.role}</td>
                    <td className="px-5 py-3 text-muted-foreground">{user.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Resumen de Inventario</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Insumo</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Código</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Cantidad</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {localInventory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    No hay insumos registrados
                  </td>
                </tr>
              ) : (
                localInventory.map((inv) => {
                  const supply = supplies.find(s => s.id === inv.supply_id)
                  return (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-5 py-3 font-medium text-foreground">
                        {supply?.name || 'N/A'}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {supply?.internal_code}
                      </td>
                      <td className="px-5 py-3 text-foreground">{inv.quantity}</td>
                      <td className="px-5 py-3 text-muted-foreground">{inv.minimum_stock}</td>
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
