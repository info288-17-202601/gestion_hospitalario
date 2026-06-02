'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hospital, CreditCard, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { loginWithPassword } from '@/lib/services'
import { runRfidBridge } from '../../components/ui/rfid-actions'

type Tab = 'password' | 'rfid'
type MessageType = 'error' | 'success' | null

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('password')

  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState<{ type: MessageType; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [retryRfid, setRetryRfid] = useState(false)

  const shouldRetryRfid = (text: string) => {
    return (
      text.includes('lector RFID/NFC no está conectado') ||
      text.includes('no se pudo leer') ||
      text.includes('No se pudo ejecutar el lector') ||
      text.includes('Tiempo agotado') ||
      text.includes('No se detectó') ||
      text.includes('permisos del puerto')
    )
  }

  const handleRfidLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()

    setLoading(true)
    setRetryRfid(false)
    setMessage({
      type: 'success',
      text: 'Acerque su tarjeta al lector e ingrese su contraseña.',
    })

    try {
      const result = await runRfidBridge()

      if (result.success) {
        const sessionUser = result.user
          ? {
              id: result.user.id,
              name: result.user.name,
              role: result.user.role as any,
              department: `Departamento ${result.user.department_id}`,
              rut: '',
            }
          : {
              id: 0,
              name: 'Usuario RFID',
              role: 'Farmacéutico',
              department: 'RFID',
              rut: '',
            }

        sessionStorage.setItem('sghd_user', JSON.stringify(sessionUser))

        if (result.token) {
          sessionStorage.setItem('sghd_token', result.token)
        }

        setMessage({
          type: 'success',
          text: 'Acceso exitoso. Redirigiendo...',
        })

        setTimeout(() => {
          router.push('/nodo/inventario')
        }, 700)

        return
      }

      const text = result.message || 'No se pudo iniciar sesión con la tarjeta RFID/NFC.'

      setMessage({
        type: 'error',
        text,
      })

      setRetryRfid(shouldRetryRfid(text))
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Autenticación con RFID no disponible en estos momentos.',
      })

      setRetryRfid(true)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setMessage(null)
    setRetryRfid(false)

    const result = await loginWithPassword(rut.trim(), password)

    setLoading(false)

    if (result.success && result.user) {
      setMessage({
        type: 'success',
        text: 'Acceso exitoso. Redirigiendo...',
      })

      sessionStorage.setItem('sghd_user', JSON.stringify(result.user))

      setTimeout(() => {
        router.push('/nodo/inventario')
      }, 800)
    } else {
      setMessage({
        type: 'error',
        text: result.reason ?? 'Credenciales inválidas',
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md">
            <Hospital className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-foreground text-balance">
            Sistema de Gestión Hospitalario
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Distribuido &mdash; Proyecto Semestral
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex border-b border-border">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setTab('password')
                setMessage(null)
                setRetryRfid(false)
              }}
              className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                tab === 'password'
                  ? 'border-b-2 border-primary text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <User className="h-4 w-4" />
              Acceso Tradicional
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setTab('rfid')
                setMessage(null)
                setRetryRfid(false)
              }}
              className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                tab === 'rfid'
                  ? 'border-b-2 border-primary text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              RFID / NFC
            </button>
          </div>

          <div className="p-6">
            {message && (
              <div
                className={`mb-5 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm ${
                  message.type === 'error'
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

            {tab === 'password' ? (
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
                  Demo: RUT <span className="font-mono">12.345.678-9</span> / contraseña{' '}
                  <span className="font-mono">1234</span>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRfidLogin} className="flex flex-col gap-4">
                <div className="rounded-lg border border-border bg-muted/40 px-4 py-4 text-center">
                  <CreditCard className="mx-auto mb-2 h-8 w-8 text-primary" />

                  <p className="text-sm font-medium text-foreground">
                    Autenticación con tarjeta RFID/NFC
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Presiona el botón, acerca tu tarjeta al lector e ingresa tu contraseña.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? 'Esperando tarjeta y contraseña...' : 'Logearse con tarjeta'}
                </button>

                {retryRfid && (
                  <button
                    type="button"
                    onClick={handleRfidLogin}
                    disabled={loading}
                    className="mt-2 w-full rounded-md border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
                  >
                    Reintentar conexión
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}