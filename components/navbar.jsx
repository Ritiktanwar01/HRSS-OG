"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { DialogTitle } from "@radix-ui/react-dialog"

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-white shadow-md py-2" : "bg-white/80 backdrop-blur-sm py-4",
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-bhagva-700 flex items-center justify-center text-white font-bold text-xl">
            H
          </div>
          <span className="font-bold text-xl text-bhagva-800">HRSS</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-bhagva-800 bg-bhagva-50"
                  : "text-gray-700 hover:text-bhagva-700 hover:bg-bhagva-50/60",
              )}
            >
              {item.name}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2 bg-bhagva-700 hover:bg-bhagva-800">
            <Link href="/donate">Donate Now</Link>
          </Button>
        </nav>

        {/* Mobile Navigation - Only visible on small screens */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <DialogTitle>{""}</DialogTitle>
              {/* Add an accessible title for the dialog */}
              <h2 className="sr-only">Navigation Menu</h2> {/* Screen-reader-only title */}
              <div className="flex flex-col mt-6 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-bhagva-800 bg-bhagva-50"
                        : "text-gray-700 hover:text-bhagva-700 hover:bg-bhagva-50/60",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <Button asChild className="mt-4 bg-bhagva-700 hover:bg-bhagva-800">
                  <Link href="/donate">Donate Now</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Navbar
