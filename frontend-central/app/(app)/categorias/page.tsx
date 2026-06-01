'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { FormModal } from '@/components/form-modal'
import type { SupplyCategory } from '@/lib/types'

const emptyForm = { name: '', description: '' }

export default function CategoriasPage() {
  const [cats, setCats] = useState<SupplyCategory[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SupplyCategory | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  useEffect(() => {
    fetch('http://localhost:7020/api/reports/categories')
      .then(res => res.json())
      .then(setCats)
      .catch(console.error)
  }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (c: SupplyCategory) => { setEditing(c); setForm({ name: c.name, description: c.description }); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        const res = await fetch(`http://localhost:7020/api/reports/categories/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        if (!res.ok) throw new Error('Error updating')
        const updated = await res.json()
        setCats((prev) => prev.map((c) => (c.id === editing.id ? updated : c)))
      } else {
        const res = await fetch('http://localhost:7020/api/reports/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        if (!res.ok) throw new Error('Error creating')
        const created = await res.json()
        setCats((prev) => [...prev, created])
      }
      setModalOpen(false)
    } catch (err) {
      console.error(err)
      alert('Error al guardar la categoría')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:7020/api/reports/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error deleting')
      setCats((prev) => prev.filter((c) => c.id !== id))
      setConfirmDelete(null)
    } catch (err) {
      console.error(err)
      alert('Error al eliminar la categoría')
    }
  }

  const inputClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Categorías de Insumos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Clasificación de insumos del inventario</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {cats.length === 0 && (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">Sin categorías</td></tr>
            )}
            {cats.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.description}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {cats.length} categoría(s)
        </div>
      </div>

      {/* Create / Edit modal */}
      <FormModal title={editing ? 'Editar Categoría' : 'Nueva Categoría'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Nombre</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required placeholder="Ej: Insumos Quirúrgicos" />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="Descripción breve de la categoría" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
              {editing ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Confirm delete modal */}
      <FormModal title="Confirmar eliminación" open={confirmDelete !== null} onClose={() => setConfirmDelete(null)}>
        <p className="text-sm text-muted-foreground mb-6">
          ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => confirmDelete !== null && handleDelete(confirmDelete)}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </FormModal>
    </div>
  )
}
