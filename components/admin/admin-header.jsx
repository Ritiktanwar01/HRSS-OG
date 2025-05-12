"use client"

import { useState } from "react"
import { Menu, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const AdminHeader = ({ toggleSidebar }) => {
  const pathname = usePathname()
  const [pageTitle, setPageTitle] = useState("")
  const { Logout, user } = useAuth()

  useEffect(() => {
    // Set page title based on current path
    const path = pathname.split("/").pop()
    if (path) {
      setPageTitle(path.charAt(0).toUpperCase() + path.slice(1))
    }
  }, [pathname])

  const handleLogout = async () => {
    await Logout()
  }

  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-4 sticky top-0 z-20">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
