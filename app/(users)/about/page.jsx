"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, Users } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  const [aboutData, setAboutData] = useState({
    story: "",
    mission: "",
    vision: "",
  })
  const [teamMembers, setTeamMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about/public`)
        if (response.ok) {
          const data = await response.json()
          setAboutData(data)
        }
      } catch (error) {
        console.error("Error fetching about data:", error)
      }
    }

    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-members/public`)
        if (response.ok) {
          const data = await response.json()
          setTeamMembers(data)
        }
      } catch (error) {
        console.error("Error fetching team members:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAboutData()
    fetchTeamMembers()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-bhagva-800 mb-4">About HRSS</h1>
        <div className="h-1 w-20 bg-bhagva-600 mb-8"></div>

        <div className="mb-12">
          <Image height={400} width={800} src="/Ganesh visarjan.jfif" alt="About HRSS (Hindu Rashtra Sevak Sangh Charitable Trust)"/>

          <h2 className="text-2xl font-semibold text-bhagva-700 mb-4">Our Story</h2>
          <p className="text-gray-700 mb-4">{aboutData.story}</p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-bhagva-700 mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-bhagva-700">Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Selfless service to humanity without discrimination is at the core of our mission.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-bhagva-700">Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We uphold the highest standards of honesty, transparency, and ethical conduct in all our endeavors.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-bhagva-700">Heritage</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We are committed to preserving and promoting our rich cultural heritage and spiritual traditions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-bhagva-700 mb-6">Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member._id}
                className="flex bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={member.photo || "/placeholder.svg?height=100&width=100"}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mr-4 object-cover border-2 border-bhagva-100"
                  width={100}
                  height={100}
                />
                <div>
                  <h3 className="text-xl font-semibold text-bhagva-700">{member.name}</h3>
                  <p className="text-gray-500 mb-2">{member.position}</p>
                  <p className="text-gray-700 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-bhagva-700 mb-4">Our Presence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-bhagva-600 mr-2" />
              <span className="text-gray-700">20+ States across India</span>
            </div>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-bhagva-600 mr-2" />
              <span className="text-gray-700">5,00+ Active Volunteers</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-bhagva-600 mr-2" />
              <span className="text-gray-700">3+ Years of Service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
