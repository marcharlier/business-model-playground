'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './footer'

export function FooterWrapper() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  
  if (!isHomepage) {
    return null
  }
  
  return <Footer />
}
