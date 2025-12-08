import "./globals.css"
import { Inter, Figtree } from "next/font/google"
import { cn } from "@/lib/utils"
import { AppBarWrapper } from "@/components/ui/app-bar-wrapper"
import { Footer } from "@/components/ui/footer"
import { ThemeProvider } from "@/context/ThemeContext"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" })

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
        "min-h-screen bg-background font-sans antialiased flex flex-col bg-[#E4E4E4]",
        inter.variable,
        figtree.variable
      )}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <AppBarWrapper />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
