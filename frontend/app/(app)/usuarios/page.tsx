'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Power, CreditCard, KeyRound } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { FormModal } from '@/components/form-modal'
import { getUsers, createUser, updateUser, getDepartments, getRfidCards } from '@/lib/services'
import { userPinCredentials } from '@/lib/mock-data'
import type { User, UserRole, Department, RfidCard } from '@/lib/types'

const ROLES: UserRole[] = ['Administrador', 'Enfermero', 'Farmacéutico', 'Bodega', 'Jefatura']

type FormState = Omit<User, 'id'> & { password: string }

const emptyForm: FormState = {
  rut: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'Enfermero',
  department_id: 1,
  is_active: true,
  password: '',
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [rfidCards, setRfidCards] = useState<RfidCard[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [rfidModalOpen, setRfidModalOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [rfidUser, setRfidUser] = useState<User | null>(null)

  useEffect(() => {
    Promise.all([getUsers(), getDepartments(), getRfidCards()]).then(([us, dp, rc]) => {
      setUsers(us)
      setDepartments(dp)
      setRfidCards(rc)
    })
  }, [])

  const getDeptName = (id: number) => departments.find((d) => d.id === id)?.name ?? '-'
  const getUserCard = (userId: number) => rfidCards.find((c) => c.user_id === userId)
  const getUserPin = (userId: number) => userPinCredentials.find((p) => p.user_id === userId)

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, department_id: departments[0]?.id ?? 1 }); setModalOpen(true) }
  const openEdit = (u: User) => { setEditing(u); setForm({ ...u, password: '' }); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = form
    if (editing) {
      const updated = await updateUser(editing.id, userData)
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? updated : u)))
    } else {
      const created = await createUser(userData)
      setUsers((prev) => [...prev, created])
    }
    setModalOpen(false)
  }

  const handleToggle = async (u: User) => {
    const updated = await updateUser(u.id, { is_active: !u.is_active })
    setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)))
  }

  const inputClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Personal registrado en el sistema</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">RUT</th>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                <th className="px-4 py-3 text-left font-medium">Rol</th>
                <th className="px-4 py-3 text-left font-medium">Departamento</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Sin usuarios</td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{u.rut}</td>
                  <td className="px-4 py-3 font-medium">{u.first_name} {u.last_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{getDeptName(u.department_id)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={u.is_active ? 'activo' : 'inactivo'} label={u.is_active ? 'Activo' : 'Inactivo'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => openEdit(u)} className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-secondary transition-colors">
                        <Pencil className="h-3 w-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(u)}
                        className={`flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors ${u.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                      >
                        <Power className="h-3 w-3" />
                        {u.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => { setRfidUser(u); setRfidModalOpen(true) }}
                        className="flex items-center gap-1 rounded border border-indigo-200 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50 transition-colors"
                      >
                        <CreditCard className="h-3 w-3" />
                        RFID
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {users.length} usuario(s)
        </div>
      </div>

      {/* Create / Edit modal */}
      <FormModal title={editing ? 'Editar Usuario' : 'Nuevo Usuario'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>RUT</label>
              <input value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} className={inputClass} required placeholder="12.345.678-9" />
            </div>
            <div>
              <label className={labelClass}>Rol</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className={inputClass}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Apellido</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Departamento</label>
              <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: Number(e.target.value) })} className={inputClass}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
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
          <div>
            <label className={labelClass}>Contraseña {editing && <span className="text-muted-foreground font-normal">(dejar vacío para no cambiar)</span>}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} required={!editing} placeholder="••••••••" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
              {editing ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* RFID / PIN modal */}
      <FormModal title={`Autenticación clínica — ${rfidUser?.first_name ?? ''} ${rfidUser?.last_name ?? ''}`} open={rfidModalOpen} onClose={() => setRfidModalOpen(false)}>
        {rfidUser && (
          <div className="flex flex-col gap-5">
            {/* RFID */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Tarjeta RFID
              </h3>
              {(() => {
                const card = getUserCard(rfidUser.id)
                if (!card) return (
                  <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground text-center">
                    No hay tarjeta RFID registrada para este usuario
                  </div>
                )
                return (
                  <div className="rounded-md border border-border p-4 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UID</span>
                      <span className="font-mono font-medium">{card.uid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado</span>
                      <StatusBadge variant={card.is_active ? 'activo' : 'inactivo'} label={card.is_active ? 'Activo' : 'Inactivo'} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registrada</span>
                      <span>{new Date(card.created_at).toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* PIN */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                PIN de acceso
              </h3>
              {(() => {
                const pin = getUserPin(rfidUser.id)
                return (
                  <div className="rounded-md border border-border p-4 flex flex-col gap-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estado del PIN</span>
                      {pin?.is_configured ? (
                        <StatusBadge variant="activo" label="PIN configurado" />
                      ) : (
                        <StatusBadge variant="inactivo" label="Sin PIN" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors">
                        {pin?.is_configured ? 'Actualizar PIN' : 'Configurar PIN'}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El hash del PIN nunca se muestra por seguridad.
                    </p>
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}
