'use client'

import { usePathname } from 'next/navigation'
import { AppBar } from './app-bar'

export function AppBarWrapper() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  
  return <AppBar variant={isHomepage ? 'hero' : 'default'} />
}

