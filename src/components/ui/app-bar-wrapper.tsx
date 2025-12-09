'use client'

import { usePathname } from 'next/navigation'
import { AppBar } from './app-bar'
import { ProjectControls } from '@/components/project/ProjectControls'

export function AppBarWrapper() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const isProjectRoute = pathname.startsWith('/projects/') && pathname !== '/projects/'
  
  return (
    <AppBar 
      variant={isHomepage ? 'hero' : 'default'} 
      projectControls={isProjectRoute ? <ProjectControls /> : undefined}
    />
  )
}

