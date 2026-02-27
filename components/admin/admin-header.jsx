"use client"

import { useState, useEffect } from "react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { fetchCsrfToken } from "@/hooks/use-auth"

export default function AdminHeader({ toggleSidebar }) {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/notifications/`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      setNotifications(data)
    } catch (e) {
      console.error('failed to load notifications', e)
    }
  }

  const markRead = async (id) => {
    try {
      const csrfToken = await fetchCsrfToken()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/notifications/${id}/read/`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            ...(csrfToken && { "X-CSRFToken": csrfToken }),
          }
        }
      )
      if (!res.ok) throw new Error()
      setNotifications((nots) =>
        nots.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (e) {
      console.error('mark read failed', e)
    }
  }

  return (
    <header
      id="admin-header"
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm"
    >
      {/* Left side - Menu button and title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      {/* Right side - Notifications and user menu */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {
              setShowNotifications((v) => {
                const next = !v
                if (next) fetchNotifications()
                return next
              })
            }}
          >
            <Bell className="h-5 w-5" />
            {notifications.some((n) => !n.is_read) && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white shadow-lg z-50">
              {notifications.filter((n) => !n.is_read).length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500">
                  No notifications
                </p>
              ) : (
                notifications
                  .filter((n) => !n.is_read)
                  .map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 border-b last:border-b-0 font-semibold bg-gray-50`}
                    >
                      <p className="text-sm">{n.message}</p>
                      <button
                        className="text-xs text-blue-600"
                        onClick={() => markRead(n.id)}
                      >
                        Mark read
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}

        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-bhagva-100 text-bhagva-700">
                  {user?.username?.charAt(0) || "B"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.first_name + ' ' + user?.last_name || "Admin"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "admin@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span onClick={() => window.location.href = "/admin/settings"}>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
