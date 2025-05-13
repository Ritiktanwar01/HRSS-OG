import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import 'leaflet/dist/leaflet.css';


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "HRSS - Hindu Rashtriya Sevak Sangh",
  description: "Official website of Hindu Rashtriya Sevak Sangh Charitable Trust",
  generator: "Ritik Tanwar",
}

export default function UserLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
