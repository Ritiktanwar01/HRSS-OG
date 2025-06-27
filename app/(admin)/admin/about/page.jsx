"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

// Form schema for about page content
const aboutFormSchema = z.object({
  story: z.string().min(10, { message: "Story must be at least 10 characters." }),
  mission: z.string().min(10, { message: "Mission must be at least 10 characters." }),
  vision: z.string().min(10, { message: "Vision must be at least 10 characters." }),
})

export default function AdminAboutPage() {
  const [teamMembers, setTeamMembers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const { getAuthToken } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Form for about page content
  const aboutForm = useForm({
    resolver: zodResolver(aboutFormSchema),
    defaultValues: {
      story: "",
      mission: "",
      vision: "",
    },
  })

  // Handle tab switching from URL params
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "team") {
      setActiveTab("team")
    }
  }, [searchParams])

  // Fetch about page content and team members on component mount
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          aboutForm.reset({
            story: data.story || "",
            mission: data.mission || "",
            vision: data.vision || "",
          })
        }
      } catch (error) {
        console.error("Error fetching about data:", error)
        toast({
          title: "Error",
          description: "Failed to load about page content",
          variant: "destructive",
        })
      }
    }

    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-members`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setTeamMembers(data)
        }
      } catch (error) {
        console.error("Error fetching team members:", error)
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive",
        })
      }
    }

    fetchAboutData()
    fetchTeamMembers()
  }, [getAuthToken])

  async function onAboutSubmit(data) {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "About Page Updated",
          description: "The about page content has been successfully updated.",
        })
      } else {
        throw new Error("Failed to update about page")
      }
    } catch (error) {
      console.error("Error updating about page:", error)
      toast({
        title: "Error",
        description: "Failed to update about page content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteMember(id) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-members/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        setTeamMembers(teamMembers.filter((member) => member._id !== id))
        toast({
          title: "Team Member Deleted",
          description: "The team member has been successfully removed.",
        })
      } else {
        throw new Error("Failed to delete team member")
      }
    } catch (error) {
      console.error("Error deleting team member:", error)
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">About Page Management</h1>
        <p className="text-muted-foreground">Manage the content displayed on the about page.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Page Content</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About Page Content</CardTitle>
              <CardDescription>Edit the main content sections of the about page</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...aboutForm}>
                <form onSubmit={aboutForm.handleSubmit(onAboutSubmit)} className="space-y-6">
                  <FormField
                    control={aboutForm.control}
                    name="story"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Our Story</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter the organization's story" className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={aboutForm.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Our Mission</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the organization's mission"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={aboutForm.control}
                    name="vision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Our Vision</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the organization's vision"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="bg-bhagva-700 hover:bg-bhagva-800" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage the leadership team displayed on the about page</CardDescription>
              </div>
              <Link href="/admin/add-team-member">
                <Button className="bg-bhagva-700 hover:bg-bhagva-800">
                  <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No team members added yet.</p>
                    <Link href="/admin/add-team-member">
                      <Button className="bg-bhagva-700 hover:bg-bhagva-800">
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Team Member
                      </Button>
                    </Link>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div key={member._id} className="flex items-start p-4 border rounded-md">
                      <img
                        src={member.photo || "/placeholder.svg?height=100&width=100"}
                        alt={member.name}
                        className="w-16 h-16 rounded-full mr-4 object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-muted-foreground">{member.position}</p>
                        <p className="text-sm mt-1 line-clamp-2">{member.bio}</p>
                        {member.email && <p className="text-xs text-muted-foreground mt-1">📧 {member.email}</p>}
                        {member.phone && <p className="text-xs text-muted-foreground">📞 {member.phone}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 bg-transparent"
                          onClick={() => handleDeleteMember(member._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
