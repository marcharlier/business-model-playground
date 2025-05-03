import "./globals.css"
import { Inter as NextInter } from "next/font/google"
import { cn } from "@/lib/utils"
import { AppBar } from "@/components/ui/app-bar"
import { Footer } from "@/components/ui/footer"
import { ThemeProvider } from "@/context/ThemeContext"

const inter = NextInter({ subsets: ["latin"] })

export const metadata = {
  title: 'Business Model Playground',
  description: 'Build and analyze your business models',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Business Model Playground</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased flex flex-col",
        inter.className
      )}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <AppBar />
            <main className="flex-1 pt-14">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
