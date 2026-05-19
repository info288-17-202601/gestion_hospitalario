'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Power, ChevronRight, X } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { FormModal } from '@/components/form-modal'
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  getUsers,
  getAlerts,
  getDepartmentInventory,
  getSupplies,
} from '@/lib/services'
import type { Department, User, Alert, DepartmentInventory, Supply } from '@/lib/types'

const emptyForm = { name: '', location: '', is_active: true }

export default function DepartamentosPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [inventory, setInventory] = useState<DepartmentInventory[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)

  useEffect(() => {
    Promise.all([getDepartments(), getUsers(), getAlerts(), getDepartmentInventory(), getSupplies()]).then(
      ([dp, us, al, inv, sp]) => {
        setDepartments(dp)
        setUsers(us)
        setAlerts(al)
        setInventory(inv)
        setSupplies(sp)
      }
    )
  }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (d: Department) => { setEditing(d); setForm({ name: d.name, location: d.location, is_active: d.is_active }); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      const updated = await updateDepartment(editing.id, form)
      setDepartments((prev) => prev.map((d) => (d.id === editing.id ? updated : d)))
    } else {
      const created = await createDepartment(form)
      setDepartments((prev) => [...prev, created])
    }
    setModalOpen(false)
  }

  const handleToggle = async (d: Department) => {
    const updated = await updateDepartment(d.id, { is_active: !d.is_active })
    setDepartments((prev) => prev.map((x) => (x.id === d.id ? updated : x)))
  }

  const getSupplyName = (id: number) => supplies.find((s) => s.id === id)?.name ?? '-'

  const inputClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Departamentos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Unidades y servicios hospitalarios</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo departamento
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Table */}
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">Ubicación</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr
                    key={d.id}
                    className={`border-b border-border/50 transition-colors last:border-0 cursor-pointer ${selectedDept?.id === d.id ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                    onClick={() => setSelectedDept(d)}
                  >
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-1">
                        {d.name}
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.location}</td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={d.is_active ? 'activo' : 'inactivo'} label={d.is_active ? 'Activo' : 'Inactivo'} />
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(d)} className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-secondary transition-colors">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleToggle(d)}
                          className={`flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors ${d.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                        >
                          <Power className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selectedDept ? (
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">{selectedDept.name} — Detalle</h2>
              <button onClick={() => setSelectedDept(null)} className="rounded p-1 text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-5 p-5">
              {/* Inventory */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Inventario</h3>
                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-muted-foreground">
                        <th className="px-3 py-2 text-left font-medium">Insumo</th>
                        <th className="px-3 py-2 text-right font-medium">Qty</th>
                        <th className="px-3 py-2 text-right font-medium">Mín.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.filter((i) => i.department_id === selectedDept.id).map((i) => (
                        <tr key={i.id} className="border-b border-border/50 last:border-0">
                          <td className="px-3 py-2">{getSupplyName(i.supply_id)}</td>
                          <td className={`px-3 py-2 text-right font-mono ${i.quantity <= i.minimum_stock ? 'text-red-600 font-semibold' : ''}`}>{i.quantity}</td>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground">{i.minimum_stock}</td>
                        </tr>
                      ))}
                      {inventory.filter((i) => i.department_id === selectedDept.id).length === 0 && (
                        <tr><td colSpan={3} className="px-3 py-3 text-center text-muted-foreground">Sin inventario</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Users */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Usuarios</h3>
                <div className="flex flex-col gap-1.5">
                  {users.filter((u) => u.department_id === selectedDept.id).map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-xs">
                      <span className="font-medium">{u.first_name} {u.last_name}</span>
                      <span className="text-muted-foreground">{u.role}</span>
                    </div>
                  ))}
                  {users.filter((u) => u.department_id === selectedDept.id).length === 0 && (
                    <p className="text-xs text-muted-foreground">Sin usuarios asignados</p>
                  )}
                </div>
              </div>

              {/* Alerts */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Alertas asociadas</h3>
                <div className="flex flex-col gap-1.5">
                  {alerts.filter((a) => a.department_id === selectedDept.id).map((a) => (
                    <div key={a.id} className="rounded-md border border-border px-3 py-2 text-xs">
                      <p className="text-foreground">{a.message}</p>
                      <div className="mt-1 flex gap-2">
                        <StatusBadge variant={a.status} />
                      </div>
                    </div>
                  ))}
                  {alerts.filter((a) => a.department_id === selectedDept.id).length === 0 && (
                    <p className="text-xs text-muted-foreground">Sin alertas</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card/50 flex items-center justify-center p-10">
            <p className="text-sm text-muted-foreground">Selecciona un departamento para ver el detalle</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <FormModal title={editing ? 'Editar Departamento' : 'Nuevo Departamento'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Nombre</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required placeholder="Ej: Urgencias" />
          </div>
          <div>
            <label className={labelClass}>Ubicación</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} required placeholder="Ej: Piso 1 - Ala A" />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select value={form.is_active ? 'true' : 'false'} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })} className={inputClass}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
              {editing ? 'Guardar cambios' : 'Crear departamento'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}
