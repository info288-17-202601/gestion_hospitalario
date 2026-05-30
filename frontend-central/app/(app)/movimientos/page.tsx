'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { FormModal } from '@/components/form-modal'
import { getInventoryMovements, getDepartments, getSupplies, getUsers, createMovement } from '@/lib/services'
import type { InventoryMovement, Department, Supply, User, MovementType } from '@/lib/types'

export default function MovimientosPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  // Form state
  const [form, setForm] = useState<{
    type: MovementType
    supply_id: string
    quantity: string
    user_id: string
    source_department_id: string
    destination_department_id: string
    observations: string
  }>({
    type: 'entrada',
    supply_id: '',
    quantity: '',
    user_id: '',
    source_department_id: '',
    destination_department_id: '',
    observations: '',
  })

  useEffect(() => {
    Promise.all([getInventoryMovements(), getDepartments(), getSupplies(), getUsers()]).then(
      ([mv, dp, sp, us]) => {
        setMovements(mv)
        setDepartments(dp)
        setSupplies(sp)
        setUsers(us)
      }
    )
  }, [])

  const getSupplyName = (id: number) => supplies.find((s) => s.id === id)?.name ?? '-'
  const getDeptName = (id: number | null) => id ? departments.find((d) => d.id === id)?.name ?? '-' : '-'
  const getUserName = (id: number) => {
    const u = users.find((u) => u.id === id)
    return u ? `${u.first_name} ${u.last_name}` : '-'
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newMv = await createMovement({
      type: form.type,
      supply_id: Number(form.supply_id),
      quantity: Number(form.quantity),
      user_id: Number(form.user_id),
      source_department_id: form.source_department_id ? Number(form.source_department_id) : null,
      destination_department_id: form.destination_department_id ? Number(form.destination_department_id) : null,
      observations: form.observations,
    })
    setMovements((prev) => [newMv, ...prev])
    setModalOpen(false)
    setForm({ type: 'entrada', supply_id: '', quantity: '', user_id: '', source_department_id: '', destination_department_id: '', observations: '' })
  }

  const showSource = form.type === 'salida' || form.type === 'transferencia' || form.type === 'ajuste'
  const showDest = form.type === 'entrada' || form.type === 'transferencia'

  const inputClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Movimientos de Inventario</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registro de entradas, salidas, transferencias y ajustes</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo movimiento
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-right font-medium">Cantidad</th>
                <th className="px-4 py-3 text-left font-medium">Insumo</th>
                <th className="px-4 py-3 text-left font-medium">Usuario</th>
                <th className="px-4 py-3 text-left font-medium">Origen</th>
                <th className="px-4 py-3 text-left font-medium">Destino</th>
                <th className="px-4 py-3 text-left font-medium">Observaciones</th>
                <th className="px-4 py-3 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Sin movimientos</td></tr>
              )}
              {movements.map((mv) => (
                <tr key={mv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                  <td className="px-4 py-3 font-mono text-muted-foreground">#{mv.id}</td>
                  <td className="px-4 py-3"><StatusBadge variant={mv.type} /></td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{mv.quantity}</td>
                  <td className="px-4 py-3">{getSupplyName(mv.supply_id)}</td>
                  <td className="px-4 py-3">{getUserName(mv.user_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{getDeptName(mv.source_department_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{getDeptName(mv.destination_department_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{mv.observations || '-'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(mv.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {movements.length} movimiento(s)
        </div>
      </div>

      {/* Modal */}
      <FormModal title="Nuevo Movimiento" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Tipo de movimiento</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MovementType })} className={inputClass} required>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="transferencia">Transferencia</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Insumo</label>
              <select value={form.supply_id} onChange={(e) => setForm({ ...form, supply_id: e.target.value })} className={inputClass} required>
                <option value="">Seleccionar...</option>
                {supplies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Cantidad</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={inputClass} required />
            </div>
          </div>

          <div>
            <label className={labelClass}>Usuario responsable</label>
            <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className={inputClass} required>
              <option value="">Seleccionar...</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {showSource && (
              <div>
                <label className={labelClass}>Departamento origen</label>
                <select value={form.source_department_id} onChange={(e) => setForm({ ...form, source_department_id: e.target.value })} className={inputClass}>
                  <option value="">Ninguno</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
            {showDest && (
              <div>
                <label className={labelClass}>Departamento destino</label>
                <select value={form.destination_department_id} onChange={(e) => setForm({ ...form, destination_department_id: e.target.value })} className={inputClass}>
                  <option value="">Ninguno</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="Notas opcionales..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
              Registrar
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}
