import "./globals.css"
import { Inter, Figtree } from "next/font/google"
import { cn } from "@/lib/utils"
import { AppBarWrapper } from "@/components/ui/app-bar-wrapper"
import { FooterWrapper } from "@/components/ui/footer-wrapper"
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
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
          <LayoutWrapper>
            <AppBarWrapper />
            <main className="flex-1 min-h-0">
              {children}
            </main>
            <FooterWrapper />
          </LayoutWrapper>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
