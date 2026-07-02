'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hospital, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { loginWithPassword } from '@/lib/services'

type MessageType = 'error' | 'success' | null

export default function LoginPage() {
  const router = useRouter()

  // Form states
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState<{ type: MessageType; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const result = await loginWithPassword(rut.trim(), password)
    setLoading(false)
    if (result.success && result.user) {
      setMessage({ type: 'success', text: 'Acceso exitoso. Redirigiendo...' })
      sessionStorage.setItem('sghd_user', JSON.stringify(result.user))
      if (result.token) {
        sessionStorage.setItem('sghd_token', result.token)
      }
      setTimeout(() => router.push('/inventario'), 800)
    } else {
      setMessage({ type: 'error', text: result.reason ?? 'Credenciales inválidas' })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md">
            <Hospital className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            Sistema de Gestión Hospitalario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Servidor Central</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Tabs - Access Header */}
          <div className="flex border-b border-border bg-secondary/50">
            <div className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold text-primary">
              <User className="h-4 w-4" />
              Acceso
            </div>
          </div>

          <div className="p-6">
            {/* Message */}
            {message && (
              <div
                className={`mb-5 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm ${message.type === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                role="alert"
              >
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                )}
                {message.text}
              </div>
            )}

            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
              <div>
                <label htmlFor="rut" className="mb-1.5 block text-sm font-medium text-foreground">
                  RUT
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="rut"
                    type="text"
                    placeholder="12.345.678-9"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    className="w-full rounded-md border border-input bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-input bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? 'Verificando...' : 'Ingresar'}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Demo: RUT <span className="font-mono">12345678-9</span> / contraseña <span className="font-mono">admin1234</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
