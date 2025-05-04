'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import Image from "next/image"

const ANIMALS = [
  "🐶", "🐱", "🐰", "🦊", "🐼", "🦁", "🐯", "🐨", "🐮", "🐷",
  "🐸", "🐙", "🦄", "🦒", "🦘", "🦛", "🦏", "🐪", "🦬", "🐃"
]

const STORAGE_KEY = 'business-model-playground-avatar-emoji'

export function AppBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [avatarEmoji, setAvatarEmoji] = useState<string>("")

  useEffect(() => {
    // Try to get the stored emoji from localStorage
    const storedEmoji = localStorage.getItem(STORAGE_KEY)
    
    if (storedEmoji) {
      // If we have a stored emoji, use it
      setAvatarEmoji(storedEmoji)
    } else {
      // If no stored emoji, generate a random one and store it
      const randomIndex = Math.floor(Math.random() * ANIMALS.length)
      const newEmoji = ANIMALS[randomIndex]
      localStorage.setItem(STORAGE_KEY, newEmoji)
      setAvatarEmoji(newEmoji)
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-8 flex h-14 items-center">
        <div className="mr-4 flex">
          <Link className="flex items-center space-x-2" href="/">
            <Image className="h-8 w-8" src="/favicon.svg" alt="Logo" width={32} height={32} />
            <span className="font-bold">Business Model Playground</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button 
                type="button"
                className="rounded-full hover:bg-accent hover:text-accent-foreground"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{avatarEmoji}</AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-4" 
              align="end"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <div className="space-y-2">
                <h4 className="font-medium leading-none">How your data is stored</h4>
                <p className="text-sm text-muted-foreground">
                  This application uses local browser storage to save your data. Here&apos;s what you need to know:
                </p>
                <ul className="list-disc pl-4 text-sm text-muted-foreground">
                  <li>No login required </li>
                  <li>All data stored locally in your browser</li>
                  <li>Clearing browser data resets the application</li>
                  <li>{avatarEmoji} is a random avatar assigned to you</li>
                </ul>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
} 