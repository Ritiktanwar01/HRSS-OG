"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import AdminHeader from "@/components/admin/admin-header"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { AuthProvider } from "@/hooks/use-auth"
import "../globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <AdminHeader toggleSidebar={toggleSidebar} />
              <div className="flex min-h-screen w-full">
                <AdminSidebar isOpen={isDesktop ? true : sidebarOpen} onLinkClick={closeSidebar} />
                <main className="flex-1 p-4 md:p-6 lg:ml-64">
                  <div className="max-w-7xl mx-auto">{children}</div>
                </main>
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
