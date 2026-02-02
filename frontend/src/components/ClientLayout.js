'use client'

import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import ConsentManager to prevent SSR issues with Klaro
const ConsentManager = dynamic(() => import('./ConsentManager'), {
  ssr: false,
})

export default function ClientLayout({ children }) {
  const pathname = usePathname()

  // Don't load ConsentManager on admin pages (prevents Klaro SSR issues)
  const isAdminPage = pathname?.startsWith('/admin')

  return (
    <>
      {!isAdminPage && <ConsentManager />}
      {children}
    </>
  )
}
