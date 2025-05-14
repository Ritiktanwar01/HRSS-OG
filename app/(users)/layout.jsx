import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import 'leaflet/dist/leaflet.css';


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "HRSS - Hindu Rashtra Sevak Sangh",
  description: "Official website of Hindu Rashtra Sevak Sangh Charitable Trust",
  generator: "Ritik Tanwar",
  favicon: "/favicon.ico",
  keywords: [
    "Hindu",
    "Rashtra",
    "Sevak",
    "Sangh",
    "Charitable",
    "Trust",
    "HRSS",
    "India",
    "Seva",
    "Service",
    "Charity",
    "Community",
    "Support",
    "Welfare",
    "Empowerment",
    "Development",
    "Education",
    "Health",
    "Environment",
    "Culture",
    "Tradition",
    "Heritage",
    "Volunteer",
    "Philanthropy",
    "Non-profit",
    "Hodal",
    "Haryana",
    "Sevabhavi",
    "Sevabhavi Sanstha",
    "Sevabhavi Sangh",
    "Sevabhavi Trust",
    "Sevabhavi Kendra",
    "Sevabhavi Kendra Hodal",
    "Sevabhavi Kendra Haryana",
    "Sevabhavi Kendra India",
    "Sevabhavi Kendra Charitable Trust",
    "Sevabhavi Kendra NGO",
    "Sevabhavi Kendra Non-profit",
    "Sevabhavi Kendra Community Service",
    "Sevabhavi Kendra Social Service",
    "Sevabhavi Kendra Welfare",
    "Sevabhavi Kendra Empowerment",
    "Sevabhavi Kendra Development",
    "Sevabhavi Kendra Education",
    "Sevabhavi Kendra Health",
    "Sevabhavi Kendra Environment",
    "Sevabhavi Kendra Culture",
    "Sevabhavi Kendra Tradition",
    "Sevabhavi Kendra Heritage",
    "Sevabhavi Kendra Volunteer",
    "Sevabhavi Kendra Philanthropy",
    "Sevabhavi Kendra Non-profit Organization",
    "Sevabhavi Kendra NGO",
    "Sevabhavi Kendra Charitable Organization",
    "Sevabhavi Kendra Community Organization",
    "Sevabhavi Kendra Social Organization",
    "Sevabhavi Kendra Welfare Organization",
    "Sevabhavi Kendra Empowerment Organization",
    "Sevabhavi Kendra Development Organization",
    "Sevabhavi Kendra Education Organization",
    "Sevabhavi Kendra Health Organization",
    "Sevabhavi Kendra Environment Organization",
    "Sevabhavi Kendra Culture Organization",
    "Sevabhavi Kendra Tradition Organization",
    "Sevabhavi Kendra Heritage Organization",
    "Sevabhavi Kendra Volunteer Organization",
    "Sevabhavi Kendra Philanthropy Organization",
    "Sevabhavi Kendra Non-profit Charity",
    "Sevabhavi Kendra Charitable Charity",
    "Sevabhavi Kendra Community Charity",
    "Sevabhavi Kendra Social Charity",
    "Sevabhavi Kendra Welfare Charity",
    "Sevabhavi Kendra Empowerment Charity",
    "Sevabhavi Kendra Development Charity",
    "Sevabhavi Kendra Education Charity",
    "Sevabhavi Kendra Health Charity",
    "Bhulwana",
    "Bhulwana Hodal",
    "Bhulwana Haryana",
    "Bhulwana India",
    "Bhulwana Charitable Trust",
    "Bhulwana NGO",
    "Bhulwana Non-profit",
    "Bhulwana Community Service",
    "Bhulwana Social Service",
    "Bhulwana Welfare",
    "Bhulwana Empowerment",
    "Bhulwana Development",
    "Bhulwana Education",
    "Bhulwana Health",
  ],
  authors: [
    {
      name: "Laptech Solutions",
      url: "https://laptech.solutions"
}],

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
