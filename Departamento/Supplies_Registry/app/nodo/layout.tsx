import React from 'react'
import { ClientLayout } from './client-layout'

export const dynamic = 'force-dynamic'

export default function NodeLayout({ children }: { children: React.ReactNode }) {
  const departmentId = process.env.DEPARTMENT_ID || '1'
  
  return <ClientLayout defaultDeptId={departmentId}>{children}</ClientLayout>
}
