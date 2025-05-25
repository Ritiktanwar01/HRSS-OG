"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Home,
  Info,
  Phone,
  FileImage,
  Award,
  Heart,
  FileText,
  X,
} from "lucide-react"

export default function AdminSidebar({ isOpen, onLinkClick }) {
  const pathname = usePathname()

  const isActive = (path) => {
    return pathname === path
  }

  const handleLinkClick = () => {
    localStorage.clear()
    window.location.href = "/admin/login"
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById("admin-sidebar")
        const header = document.getElementById("admin-header")
        if (sidebar && !sidebar.contains(event.target) && !header.contains(event.target)) {
          onLinkClick()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onLinkClick])

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Members",
      href: "/admin/members",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Designations",
      href: "/admin/designations",
      icon: <Award className="h-5 w-5" />,
    },
    {
      name: "About",
      href: "/admin/about",
      icon: <Info className="h-5 w-5" />,
    },
    {
      name: "Certificates",
      href: "/admin/certificates",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Contact",
      href: "/admin/contact",
      icon: <Phone className="h-5 w-5" />,
    },
    {
      name: "Gallery",
      href: "/admin/gallery",
      icon: <FileImage className="h-5 w-5" />,
    },
    {
      name: "Donations",
      href: "/admin/donations",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={handleLinkClick} />}

      {/* Sidebar */}
      <div
        id="admin-sidebar"
        className={`fixed top-0 left-0 z-50 h-full w-64 transform bg-white border-r shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link href="/admin/dashboard" className="flex items-center font-semibold text-lg">
              <Home className="mr-2 h-5 w-5 text-bhagva-600" />
              <span className="text-gray-900">Admin Panel</span>
            </Link>
            {/* Close button for mobile */}
            <button onClick={handleLinkClick} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-bhagva-100 text-bhagva-900"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <Link
              href="#"
              onClick={handleLinkClick}
              className="flex w-full items-center justify-center rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
