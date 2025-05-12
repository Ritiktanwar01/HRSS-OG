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
        const token = getAuthToken()
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your website statistics and recent activities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "Loading..." : stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">{isLoading ? "0%" : stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Recent Activities
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest actions and updates on your website</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading activities...</div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity._id} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-bhagva-500 mt-2 mr-3"></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{activity.action}</p>
                          <span className="text-xs text-muted-foreground">{activity.timeAgo}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {activity.amount && <span className="font-medium text-bhagva-600">{activity.amount} - </span>}
                          {activity.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events scheduled in the coming days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading events...</div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event._id} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                      <div className="bg-bhagva-100 text-bhagva-700 p-2 rounded mr-3">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <div className="text-sm text-muted-foreground mt-1">
                          {event.date} - {event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Analytics</CardTitle>
              <CardDescription>Visitor statistics and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
                <p className="text-muted-foreground">Analytics charts will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
