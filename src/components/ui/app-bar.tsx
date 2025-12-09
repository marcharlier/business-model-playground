'use client'

import Link from "next/link"
import { cn } from "@/lib/utils"
import { UserAvatarPopover } from "@/components/ui/user-avatar-popover"
import type { ReactNode } from "react"

interface AppBarProps {
  variant?: 'default' | 'hero'
  projectControls?: ReactNode
}

export function AppBar({ variant = 'default', projectControls }: AppBarProps) {
  const isHero = variant === 'hero'

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-[#E4E4E4]/50 backdrop-blur-xl",
      !isHero && "border-b-[1px] border-white shadow-[inset_0px_-1px_0px_#CCCCCC]"
    )}>
      <div className={cn(
        "container px-4 md:px-8 flex flex-wrap items-center",
        isHero ? "h-32" : projectControls ? "h-auto py-2 md:h-14 md:py-0" : "h-14",
        isHero ? "max-w-7xl" : ""
      )}>
        {/* First row: Logo and Avatar */}
        <div className="mr-4 flex shrink-0">
          <Link className="flex items-center space-x-2" href="/">
            <span className={cn(
              "font-hero font-medium text-blue-700",
              isHero ? "text-xl sm:text-xl" : "text-md sm:text-base"
            )}>Business Model Playground</span>
          </Link>
        </div>
        {/* Project controls - hidden on mobile first row, shown inline on md+ */}
        {projectControls && (
          <div className="hidden md:flex flex-1 items-center justify-start overflow-hidden">
            {projectControls}
          </div>
        )}
        <div className={cn(
          "flex items-center justify-end space-x-4 shrink-0",
          !projectControls && "flex-1",
          projectControls && "flex-1 md:flex-none"
        )}>
          <UserAvatarPopover />
        </div>
        {/* Second row: Project controls on mobile only */}
        {projectControls && (
          <div className="flex md:hidden w-full items-center pt-2">
            {projectControls}
          </div>
        )}
      </div>
    </header>
  )
}
