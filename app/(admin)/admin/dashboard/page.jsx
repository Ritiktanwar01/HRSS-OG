"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, ImageIcon, Mail, DollarSign, Calendar, FileText, BarChart3, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    donations: { value: "₹0", change: "0%" },
    visitors: { value: "0", change: "0%" },
    inquiries: { value: "0", change: "0%" },
    galleryItems: { value: "0", change: "0%" },
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { getAuthToken,user } = useAuth()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setStats({
            donations: {
              value: `₹${data.stats.totalDonations.toLocaleString()}`,
              change: `${data.stats.donationChange}%`,
            },
            visitors: {
              value: data.stats.websiteVisitors.toLocaleString(),
              change: `${data.stats.visitorChange}%`,
            },
            inquiries: {
              value: data.stats.contactInquiries.toString(),
              change: `${data.stats.inquiryChange}%`,
            },
            galleryItems: {
              value: data.stats.galleryItems.toString(),
              change: `${data.stats.galleryChange}%`,
            },
          })
          setRecentActivities(data.recentActivities)
          setUpcomingEvents(data.upcomingEvents)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [getAuthToken])

  // Format stats for display
  const statsData = [
    {
      title: "Total Donations",
      value: stats.donations.value,
      change: stats.donations.change,
      icon: <DollarSign className="h-5 w-5 text-bhagva-600" />,
    },
    {
      title: "Website Visitors",
      value: stats.visitors.value,
      change: stats.visitors.change,
      icon: <Users className="h-5 w-5 text-bhagva-600" />,
    },
    {
      title: "Contact Inquiries",
      value: stats.inquiries.value,
      change: stats.inquiries.change,
      icon: <Mail className="h-5 w-5 text-bhagva-600" />,
    },
    {
      title: "Gallery Items",
      value: stats.galleryItems.value,
      change: stats.galleryItems.change,
      icon: <ImageIcon className="h-5 w-5 text-bhagva-600" />,
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Overview of your website statistics and recent activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-lg sm:text-2xl font-bold">{isLoading ? "Loading..." : stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">{isLoading ? "0%" : stat.change}</span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="activities" className="flex items-center text-xs sm:text-sm">
            <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Recent </span>Activities
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center text-xs sm:text-sm">
            <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Upcoming </span>Events
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center text-xs sm:text-sm">
            <BarChart3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Recent Activities</CardTitle>
              <CardDescription className="text-sm">Latest actions and updates on your website</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bhagva-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading activities...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity._id} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-bhagva-500 mt-2 mr-3 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <p className="font-medium text-sm sm:text-base truncate">{activity.action}</p>
                            <span className="text-xs text-muted-foreground flex-shrink-0">{activity.timeAgo}</span>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {activity.amount && (
                              <span className="font-medium text-bhagva-600">{activity.amount} - </span>
                            )}
                            <span className="break-words">{activity.name}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No recent activities</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Upcoming Events</CardTitle>
              <CardDescription className="text-sm">Events scheduled in the coming days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bhagva-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading events...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div key={event._id} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                        <div className="bg-bhagva-100 text-bhagva-700 p-2 rounded mr-3 flex-shrink-0">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base">{event.title}</p>
                          <div className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                            {event.date} - {event.location}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No upcoming events</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Website Analytics</CardTitle>
              <CardDescription className="text-sm">Visitor statistics and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] sm:h-[300px] flex items-center justify-center bg-muted rounded-md">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Analytics charts will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
