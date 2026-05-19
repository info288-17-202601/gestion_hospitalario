'use client'

import { useEffect, useState, useMemo } from 'react'
import { StatusBadge } from '@/components/status-badge'
import { getAuthLogs, getUsers } from '@/lib/services'
import type { AuthLog, AuthMethod, AuthResult, User } from '@/lib/types'

export default function LogsAccesoPage() {
  const [logs, setLogs] = useState<AuthLog[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userFilter, setUserFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState<AuthMethod | ''>('')
  const [resultFilter, setResultFilter] = useState<AuthResult | ''>('')

  useEffect(() => {
    Promise.all([getAuthLogs(), getUsers()]).then(([lg, us]) => {
      setLogs(lg)
      setUsers(us)
    })
  }, [])

  const getUserName = (id: number | null) => {
    if (!id) return 'Desconocido'
    const u = users.find((u) => u.id === id)
    return u ? `${u.first_name} ${u.last_name}` : 'Desconocido'
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (userFilter && !getUserName(log.user_id).toLowerCase().includes(userFilter.toLowerCase())) return false
      if (methodFilter && log.method !== methodFilter) return false
      if (resultFilter && log.result !== resultFilter) return false
      return true
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, users, userFilter, methodFilter, resultFilter])

  const successCount = logs.filter((l) => l.result === 'exitoso').length
  const failedCount = logs.filter((l) => l.result === 'fallido').length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Logs de Acceso</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Historial de autenticaciones &mdash;{' '}
          <span className="text-emerald-600 font-medium">{successCount} exitosos</span>
          {' / '}
          <span className="text-red-600 font-medium">{failedCount} fallidos</span>
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por usuario..."
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="flex-1 min-w-[180px] rounded-md border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value as AuthMethod | '')}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos los métodos</option>
          <option value="password">Contraseña</option>
          <option value="rfid_pin">RFID/PIN</option>
        </select>
        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value as AuthResult | '')}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos los resultados</option>
          <option value="exitoso">Exitoso</option>
          <option value="fallido">Fallido</option>
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Usuario</th>
                <th className="px-4 py-3 text-left font-medium">Método</th>
                <th className="px-4 py-3 text-left font-medium">UID utilizado</th>
                <th className="px-4 py-3 text-left font-medium">Resultado</th>
                <th className="px-4 py-3 text-left font-medium">Razón</th>
                <th className="px-4 py-3 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Sin registros</td></tr>
              )}
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                  <td className="px-4 py-3 font-medium">{getUserName(log.user_id)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={log.method}
                      label={log.method === 'password' ? 'Contraseña' : 'RFID/PIN'}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{log.uid_used ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={log.result} label={log.result === 'exitoso' ? 'Exitoso' : 'Fallido'} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.reason ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {filtered.length} de {logs.length} registro(s)
        </div>
      </div>
    </div>
  )
}
