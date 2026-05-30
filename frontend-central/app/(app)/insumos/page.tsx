'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Power } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { FormModal } from '@/components/form-modal'
import { getSupplies, createSupply, updateSupply } from '@/lib/services'
import { categories } from '@/lib/mock-data'
import type { Supply } from '@/lib/types'

type FormState = Omit<Supply, 'id'>

const emptyForm: FormState = {
  internal_code: '',
  name: '',
  description: '',
  unit_of_measure: '',
  minimum_stock: 0,
  category_id: 1,
  is_active: true,
}

export default function InsumosPage() {
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Supply | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => { getSupplies().then(setSupplies) }, [])

  const getCategoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? '-'

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (s: Supply) => { setEditing(s); setForm({ ...s }); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      const updated = await updateSupply(editing.id, form)
      setSupplies((prev) => prev.map((s) => (s.id === editing.id ? updated : s)))
    } else {
      const created = await createSupply(form)
      setSupplies((prev) => [...prev, created])
    }
    setModalOpen(false)
  }

  const handleToggle = async (s: Supply) => {
    const updated = await updateSupply(s.id, { is_active: !s.is_active })
    setSupplies((prev) => prev.map((x) => (x.id === s.id ? updated : x)))
  }

  const inputClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Insumos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Catálogo de insumos del sistema</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo insumo
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Código</th>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Descripción</th>
                <th className="px-4 py-3 text-left font-medium">Unidad</th>
                <th className="px-4 py-3 text-right font-medium">Stock mín.</th>
                <th className="px-4 py-3 text-left font-medium">Categoría</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {supplies.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Sin insumos</td></tr>
              )}
              {supplies.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{s.internal_code}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{s.description}</td>
                  <td className="px-4 py-3">{s.unit_of_measure}</td>
                  <td className="px-4 py-3 text-right font-mono">{s.minimum_stock}</td>
                  <td className="px-4 py-3">{getCategoryName(s.category_id)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={s.is_active ? 'activo' : 'inactivo'} label={s.is_active ? 'Activo' : 'Inactivo'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(s)}
                        className={`flex items-center gap-1 rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                          s.is_active
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        <Power className="h-3 w-3" />
                        {s.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {supplies.length} insumo(s)
        </div>
      </div>

      <FormModal title={editing ? 'Editar Insumo' : 'Nuevo Insumo'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Código interno</label>
              <input value={form.internal_code} onChange={(e) => setForm({ ...form, internal_code: e.target.value })} className={inputClass} required placeholder="INS-001" />
            </div>
            <div>
              <label className={labelClass}>Nombre</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-16 resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Unidad de medida</label>
              <input value={form.unit_of_measure} onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })} className={inputClass} required placeholder="Unidad / Caja x20" />
            </div>
            <div>
              <label className={labelClass}>Stock mínimo</label>
              <input type="number" min="0" value={form.minimum_stock} onChange={(e) => setForm({ ...form, minimum_stock: Number(e.target.value) })} className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Categoría</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })} className={inputClass}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select value={form.is_active ? 'true' : 'false'} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })} className={inputClass}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
              {editing ? 'Guardar cambios' : 'Crear insumo'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}
