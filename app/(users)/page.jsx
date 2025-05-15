"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Users, Landmark, School } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
export default function Home() {
  const [aboutData, setAboutData] = useState({
    mission: "",
  })
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
      } finally {
        setIsLoading(false)
      }
    }

    fetchAboutData()
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-bhagva-800 text-white">
        <div className="container mx-auto px-4 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">Hindu Rashtra Sevak Sangh Charitable Trust</h1>
            <h2 className="text-xl md:text-2xl">Dedicated to serving humanity with compassion and integrity</h2>
            <p className="text-white/80 max-w-xl">
              HRSS is committed to uplifting the underprivileged, preserving cultural heritage, and creating a better
              future for all through service and dedication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-bhagva-800 hover:bg-white/90">
                <Link href="/donate">Donate Now</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-bhagva-800 hover:bg-white/90">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                src={"/hero-image.jpg"}
                width={600}
                height={400}
                alt="HRSS volunteers serving the community"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
        ></div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-bhagva-800 mb-4">Our Mission</h2>
            <p className="text-gray-700">
              Through selfless service and unwavering dedication, we aim to build a harmonious society that embraces
              spiritual values, cultural heritage, and social welfare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-bhagva-700">
                  <Heart className="mr-2 h-5 w-5" /> Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Reaching out to the underprivileged with medical camps, food distribution, and disaster relief.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-bhagva-700">
                  <Users className="mr-2 h-5 w-5" /> Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Building strong communities through spiritual guidance and social cohesion programs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-bhagva-700">
                  <Landmark className="mr-2 h-5 w-5" /> Heritage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Preserving and promoting our rich cultural heritage and traditions for future generations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-bhagva-700">
                  <School className="mr-2 h-5 w-5" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Empowering through education initiatives, scholarships, and skill development programs.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-bhagva-800 mb-4">Our Impact</h2>
            <div className="h-1 w-20 bg-bhagva-600 mb-6 mx-auto"></div>
            <p className="text-gray-700">Making a difference in society through various initiatives and programs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-bhagva-700 mb-2">50+</div>
              <div className="text-gray-600">Villages Supported</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-bhagva-700 mb-2">5K+</div>
              <div className="text-gray-600">Meals Distributed</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-bhagva-700 mb-2">500+</div>
              <div className="text-gray-600">Animal resued</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-bhagva-700 mb-2">100+</div>
              <div className="text-gray-600">Cultural Events</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bhagva-700 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Join Us in Making a Difference</h2>
          <p className="max-w-2xl mx-auto mb-8 text-white/90">
            Your contribution can help us extend our reach and impact more lives. Support our mission through donations
            or by volunteering your time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-bhagva-800 hover:bg-white/90">
              <Link href="/donate">Donate Now</Link>
            </Button>
            <Button asChild size="lg" className="bg-white text-bhagva-800 hover:bg-white/90">
              <Link href="/contact">Volunteer With Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
