'use client'

import { usePathname } from 'next/navigation'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isProjectRoute = pathname.startsWith('/projects/') && pathname !== '/projects/'
  
  // For project routes, constrain height to viewport to prevent scrolling
  // For homepage, allow natural height with min-h-screen
  const wrapperClassName = isProjectRoute
    ? "flex flex-col h-screen"
    : "flex flex-col min-h-screen"
  
  return <div className={wrapperClassName}>{children}</div>
}
