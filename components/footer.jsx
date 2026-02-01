"use client"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { useEffect, useState } from "react"

const Footer = () => {
  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/public`)
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching footer data:", error)
    }
  }
  const [footerData, setFooterData] = useState({
    address: "",
    phone1: "",
    phone2: "",
    email1: "",
    email2: "",
    officeHours: "",
  })
  useEffect(() => {
    const getData = async () => {
      const data = await fetchData()
      setFooterData(data)
    }
    getData()
  }, [])
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-bhagva-700 flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <span className="font-bold text-xl">HRSS</span>
            </div>
            <p className="text-gray-400 mb-4">
              Hindu Rashtriya Sevak Sangh is dedicated to serving humanity with compassion and integrity while
              preserving our rich cultural heritage.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/people/%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%81-%E0%A4%B0%E0%A4%BE%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A5%8D%E0%A4%B0-%E0%A4%B8%E0%A5%87%E0%A4%B5%E0%A4%95-%E0%A4%B8%E0%A4%82%E0%A4%98-%E0%A4%9A%E0%A5%87%E0%A4%B0%E0%A4%BF%E0%A4%9F%E0%A5%87%E0%A4%AC%E0%A4%B2-%E0%A4%9F%E0%A5%8D%E0%A4%B0%E0%A4%B8%E0%A5%8D%E0%A4%9F/61556160382042/" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://x.com/CharityHrs21737?t=2ht8nPhljE8mMQrZWtJ6Uw&s=09" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://www.instagram.com/hrsstrust?igsh=MWpoeW43djc5MmlvZA==" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://www.youtube.com/@hrsstrust?si=9ohBNnfYbhPRZDzz" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-400 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-gray-400 hover:text-white transition-colors">
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-bhagva-500 mr-2 mt-0.5" />
                <span className="text-gray-400">{footerData.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-bhagva-500 mr-2" />
                <span className="text-gray-400">{footerData.phone1}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-bhagva-500 mr-2" />
                <span className="text-gray-400">{footerData.email1}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter for updates on our activities and events.</p>
            <form className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 bg-gray-800 text-white rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-bhagva-500"
                />
                <button
                  type="submit"
                  className="bg-bhagva-700 hover:bg-bhagva-800 px-4 py-2 rounded-r-md transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Hindu Rashtra Sevak Sangh Charitable Trust. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
