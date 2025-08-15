'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useProjects } from "@/lib/hooks/use-projects"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ANIMALS = [
  "🐶", "🐱", "🐰", "🦊", "🐼", "🦁", "🐯", "🐨", "🐮", "🐷",
  "🐸", "🐙", "🦄", "🦒", "🦘", "🦛", "🦏", "🐪", "🦬", "🐃"
]

const STORAGE_KEY = 'business-model-playground-avatar-emoji'

export function AppBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [avatarEmoji, setAvatarEmoji] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const projects = useProjects()

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

  const handleProjectSelect = (value: string) => {
    setSelectedProject(value)
    if (value === 'all') {
      router.push('/projects')
    } else {
      // Keep the user on the same sub-page within /projects when switching projects
      // Example: /projects/oldId/products -> /projects/newId/products
      // If no sub-path present, default to dashboard
      const match = pathname?.match(/^\/projects\/(?:[^/]+)(?:\/(.*))?$/)
      const restPath = match && match[1] ? match[1] : 'dashboard'
      router.push(`/projects/${value}/${restPath}`)
    }
    // Reset the select after a short delay to ensure navigation has started
    setTimeout(() => setSelectedProject(""), 100)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-8 flex h-14 items-center">
        <div className="mr-4 flex">
          <Link className="flex items-center space-x-2" href="/">
            <Image className="h-8 w-8" src="/favicon.svg" alt="Logo" width={32} height={32} />
            <span className="font-bold text-xs sm:text-base">Business Model Playground</span>
          </Link>
          {projects.length > 0 && (
            <div className="hidden sm:block">
              <Select value={selectedProject} onValueChange={handleProjectSelect}>
                <SelectTrigger className="w-[200px] ml-4">
                  <SelectValue placeholder="Jump to project..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectSeparator />
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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