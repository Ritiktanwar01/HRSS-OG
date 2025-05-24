"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, ImageIcon, MessageSquare, Settings, LogOut, X, Users, Tag, IndianRupee } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const AdminSidebar = ({ isOpen }) => {
  const [open,setOpen] = useState(isOpen)

  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "About", href: "/admin/about", icon: FileText },
    { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    { name: "Donations", href: "/admin/donations", icon: IndianRupee },
    { name: "Contact", href: "/admin/contact", icon: MessageSquare },
    { name: "Members", href: "/admin/members", icon: Users },
    { name: "Designations", href: "/admin/designations", icon: Tag },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-bhagva-700 flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-semibold text-gray-900">HRSS Admin</span>
          </Link>
          <button className="lg:hidden" onClick={() => {}}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link onClick={() => {setOpen(false)}}
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-bhagva-50 text-bhagva-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-bhagva-700" : "text-gray-400")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <Link onClick={() => {localStorage.clear(); window.location.href = "/admin/login"}}
            href="#"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Logout
          </Link>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
