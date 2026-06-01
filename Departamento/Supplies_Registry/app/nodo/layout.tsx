'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NodeSidebar } from '@/components/node-sidebar'
import { AppHeader } from '@/components/app-header'
import type { SessionUser } from '@/lib/types'
import { departments } from '@/lib/mock-data'

export default function NodeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [departmentName, setDepartmentName] = useState('Urgencias')

  useEffect(() => {
    const stored = sessionStorage.getItem('sghd_user')
    const env = sessionStorage.getItem('sghd_environment')
    if (!stored || env !== 'nodo') {
      router.replace('/')
      return
    }
    const parsed = JSON.parse(stored) as SessionUser
    setUser(parsed)
    
    // Get department name
    const deptId = parseInt(sessionStorage.getItem('sghd_nodo_department') || '1', 10)
    const dept = departments.find(d => d.id === deptId)
    if (dept) {
      setDepartmentName(dept.name)
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem('sghd_user')
    sessionStorage.removeItem('sghd_environment')
    sessionStorage.removeItem('sghd_nodo_department')
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <NodeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} departmentName={departmentName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          isNode
          departmentName={departmentName}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
