'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { AppHeader } from '@/components/app-header'
import type { SessionUser } from '@/lib/types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('sghd_user')
    if (!stored) {
      router.push('/')
      return
    }
    try {
      setUser(JSON.parse(stored))
    } catch {
      router.push('/')
    }
  }, [router])

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </div>
    )
  }

  const handleLogout = () => {
    sessionStorage.removeItem('sghd_user')
    sessionStorage.removeItem('sghd_environment')
    router.push('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader user={user} onMenuClick={() => setSidebarOpen((o) => !o)} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
