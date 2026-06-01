'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    sessionStorage.setItem('sghd_environment', 'nodo')
    
    router.replace('/login')
  }, [router])

  return null
}
