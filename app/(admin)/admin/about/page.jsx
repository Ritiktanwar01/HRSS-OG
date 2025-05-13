"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Upload, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"

// Form schema for about page content
const aboutFormSchema = z.object({
  story: z.string().min(10, { message: "Story must be at least 10 characters." }),
  mission: z.string().min(10, { message: "Mission must be at least 10 characters." }),
  vision: z.string().min(10, { message: "Vision must be at least 10 characters." }),
})

// Form schema for team members
const teamMemberSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  position: z.string().min(2, { message: "Position must be at least 2 characters." }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  photo: z.string().optional(),
})

export default function AdminAboutPage() {
  const [teamMembers, setTeamMembers] = useState([])
  const [editingMember, setEditingMember] = useState(null)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { getAuthToken } = useAuth()

  // Form for about page content
  const aboutForm = useForm({
    resolver: zodResolver(aboutFormSchema),
    defaultValues: {
      story: "",
      mission: "",
      vision: "",
    },
  })

  // Form for team members
  const memberForm = useForm({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      position: "",
      bio: "",
      photo: "",
    },
  })

  // Fetch about page content and team members on component mount
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
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
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
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
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
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

  function handleAddMember() {
    setEditingMember(null)
    setIsAddingMember(true)
    memberForm.reset({
      name: "",
      position: "",
      bio: "",
      photo: "",
    })
  }

  function handleEditMember(member) {
    setEditingMember(member)
    setIsAddingMember(false)
    memberForm.reset({
      name: member.name,
      position: member.position,
      bio: member.bio,
      photo: member.photo,
    })
  }

  async function handleDeleteMember(id) {
    try {
    
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-members/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
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

  async function onMemberSubmit(data) {
    setIsLoading(true)
    try {
    
      let response

      if (editingMember) {
        // Update existing member
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-members/${editingMember._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify(data),
        })
      } else {
        // Add new member
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify(data),
        })
      }

      if (response.ok) {
        const result = await response.json()

        if (editingMember) {
          setTeamMembers(teamMembers.map((member) => (member._id === editingMember._id ? result : member)))
          toast({
            title: "Team Member Updated",
            description: "The team member has been successfully updated.",
          })
        } else {
          setTeamMembers([...teamMembers, result])
          toast({
            title: "Team Member Added",
            description: "The new team member has been successfully added.",
          })
        }

        // Close dialog
        document.querySelector("[data-radix-dialog-close]")?.click()
      } else {
        throw new Error("Failed to save team member")
      }
    } catch (error) {
      console.error("Error saving team member:", error)
      toast({
        title: "Error",
        description: "Failed to save team member",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">About Page Management</h1>
        <p className="text-muted-foreground">Manage the content displayed on the about page.</p>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-bhagva-700 hover:bg-bhagva-800" onClick={handleAddMember}>
                    <Plus className="mr-2 h-4 w-4" /> Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{isAddingMember ? "Add New Team Member" : "Edit Team Member"}</DialogTitle>
                    <DialogDescription>
                      {isAddingMember
                        ? "Add details for the new team member."
                        : "Update the details of the team member."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...memberForm}>
                    <form onSubmit={memberForm.handleSubmit(onMemberSubmit)} className="space-y-4">
                      <FormField
                        control={memberForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter member's name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={memberForm.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter member's position" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={memberForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter member's bio" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={memberForm.control}
                        name="photo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Photo</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                  {field.value ? (
                                    <img
                                      src={field.value || "/placeholder.svg"}
                                      alt="Member preview"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-8 w-8 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="relative flex-1">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    id="photo-upload"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                                    onChange={async (e) => {
                                      const file = e.target.files[0]
                                      if (!file) return

                                      try {
                                        const formData = new FormData()
                                        formData.append("file", file)
                                        formData.append("type", "image")

                                      
                                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
                                          method: "POST",
                                          headers: {
                                            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                                          },
                                          body: formData,
                                        })

                                        if (response.ok) {
                                          const data = await response.json()
                                          field.onChange(data.url)
                                          toast({
                                            title: "Upload Successful",
                                            description: "Photo has been uploaded successfully.",
                                          })
                                        } else {
                                          throw new Error("Failed to upload photo")
                                        }
                                      } catch (error) {
                                        console.error("Error uploading photo:", error)
                                        toast({
                                          title: "Upload Failed",
                                          description: "Failed to upload photo. Please try again.",
                                          variant: "destructive",
                                        })
                                      }
                                    }}
                                  />
                                  <Button type="button" variant="outline" className="w-full relative z-0">
                                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                                  </Button>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="submit" className="bg-bhagva-700 hover:bg-bhagva-800" disabled={isLoading}>
                          {isLoading ? "Saving..." : isAddingMember ? "Add Member" : "Save Changes"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member._id} className="flex items-start p-4 border rounded-md">
                    <img
                      src={member.photo || "/placeholder.svg?height=100&width=100"}
                      alt={member.name}
                      className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-muted-foreground">{member.position}</p>
                      <p className="text-sm mt-1">{member.bio}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEditMember(member)}>
                            Edit
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteMember(member._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
