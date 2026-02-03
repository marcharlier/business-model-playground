import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface TestimonialCardProps {
  quote: string
  name: string
  title: string
  avatarImage?: string
  avatarFallback?: string
  backgroundColor?: string
  className?: string
  style?: React.CSSProperties
}

export function TestimonialCard({
  quote,
  name,
  title,
  avatarImage,
  avatarFallback,
  backgroundColor = "bg-blue-400",
  className,
  style,
}: TestimonialCardProps) {
  const hasAvatar = avatarImage || avatarFallback

  return (
    <div
      className={cn(
        "rounded-2xl p-4 flex flex-col",
        backgroundColor,
        className
      )}
      style={style}
    >
      {/* Quote */}
      <div className="flex-1 mb-6 flex items-center">
        <p className="text-white text-2xl sm:text-3xl font-bold leading-tight w-full" style={{ fontFamily: 'var(--font-poetsen-one)' }}>
          {quote}
        </p>
      </div>

      {/* Author Info */}
      <div className={cn(
        "flex items-center gap-3",
        hasAvatar ? "" : "justify-start"
      )}>
        {hasAvatar && (
          <Avatar className="h-8 w-8 shrink-0">
            {avatarImage && <AvatarImage src={avatarImage} alt={name} />}
            {avatarFallback && (
              <AvatarFallback className="bg-white text-gray-900 text-xs">
                {avatarFallback}
              </AvatarFallback>
            )}
          </Avatar>
        )}
        <div className="flex flex-col">
          <span className="text-white font-medium text-sm" style={{ fontFamily: 'var(--font-figtree)' }}>
            {name}
          </span>
          <span className="text-white/80 text-sm" style={{ fontFamily: 'var(--font-figtree)' }}>
            {title}
          </span>
        </div>
      </div>
    </div>
  )
}
