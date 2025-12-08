'use client'

import Link from "next/link"
import { cn } from "@/lib/utils"
import { UserAvatarPopover } from "@/components/ui/user-avatar-popover"

interface AppBarProps {
  variant?: 'default' | 'hero'
}

export function AppBar({ variant = 'default' }: AppBarProps) {
  const isHero = variant === 'hero'

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-[#E4E4E4]/50 backdrop-blur-xl",
      !isHero && "border-b-[1px] border-white shadow-[inset_0px_-1px_0px_#CCCCCC]"
    )}>
      <div className={cn(
        "container px-4 md:px-8 flex items-center",
        isHero ? "h-32" : "h-14",
        isHero ? "max-w-7xl" : ""
      )}>
        <div className="mr-4 flex">
          <Link className="flex items-center space-x-2" href="/">
            <span className={cn(
              "font-hero font-medium text-blue-700",
              isHero ? "text-xl sm:text-xl" : "text-md sm:text-base"
            )}>Business Model Playground</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserAvatarPopover />
        </div>
      </div>
    </header>
  )
}
