"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Upload, User, Save } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

// Form schema for team members
const teamMemberSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  position: z.string().min(2, { message: "Position must be at least 2 characters." }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  photo: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedin: z.string().url({ message: "Please enter a valid LinkedIn URL." }).optional().or(z.literal("")),
  twitter: z.string().url({ message: "Please enter a valid Twitter URL." }).optional().or(z.literal("")),
  experience: z.string().optional(),
  education: z.string().optional(),
  specialization: z.string().optional(),
})

export default function AddTeamMemberPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const router = useRouter()
  const { getAuthToken } = useAuth()

  // Form for team members
  const memberForm = useForm({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      position: "",
      bio: "",
      photo: "",
      email: "",
      phone: "",
      linkedin: "",
      twitter: "",
      experience: "",
      education: "",
      specialization: "",
    },
  })

  async function onMemberSubmit(data: z.infer<typeof teamMemberSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Team Member Added",
          description: "The new team member has been successfully added.",
        })

        // Redirect to admin/about page with team tab selected
        router.push("/admin/about?tab=team")
      } else {
        throw new Error("Failed to add team member")
      }
    } catch (error) {
      console.error("Error adding team member:", error)
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!file) return

    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "image")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        memberForm.setValue("photo", data.url)
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
    } finally {
      setUploadingPhoto(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/about?tab=team">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team Members
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Team Member</h1>
          <p className="text-muted-foreground">Edit info of member in your organization's team.</p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Team Member Details</CardTitle>
          <CardDescription>Fill in the information for the new team member</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...memberForm}>
            <form onSubmit={memberForm.handleSubmit(onMemberSubmit)} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                    {memberForm.watch("photo") ? (
                      <img
                        src={memberForm.watch("photo") || "/placeholder.svg"}
                        alt="Member preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      id="photo-upload"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                      onChange={(e) => {
                        const files = e.target.files
                        const file = files && files[0]
                        if (file) {
                          handlePhotoUpload(file)
                        }
                      }}
                      disabled={uploadingPhoto}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingPhoto}
                      className="relative z-0 bg-transparent"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <FormField
                    control={memberForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input className="w-full" placeholder="Enter member's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={memberForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Position/Title *</FormLabel>
                        <FormControl>
                          <Input className="w-full" placeholder="e.g., President, Secretary, Treasurer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={memberForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input className="w-full" type="email" placeholder="member@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={memberForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input className="w-full" placeholder="+91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Bio Section */}
              <FormField
                control={memberForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a brief biography about the team member, their role, and contributions to the organization..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={memberForm.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area of Specialization</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Community Outreach, Finance, Legal Affairs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={memberForm.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5 years in social work" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={memberForm.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Educational Background</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Educational qualifications, degrees, certifications..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Social Media Links (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={memberForm.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={memberForm.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter Profile</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Link href="/admin/about?tab=team">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-bhagva-700 hover:bg-bhagva-800"
                  disabled={isLoading || uploadingPhoto}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Adding Member..." : "Add Team Member"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
