"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, FileText, ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditCertificatePage({ params }) {
  const { id } = params
  const { user, loading } = useAuth()
  const router = useRouter()
  const [certificate, setCertificate] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login")
    } else if (user) {
      fetchCertificate()
    }
  }, [user, loading, router, id])

  const fetchCertificate = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setCertificate(data.certificate)
        setFormData({
          title: data.certificate.title,
          description: data.certificate.description || "",
          isActive: data.certificate.isActive,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch certificate",
          variant: "destructive",
        })
        router.push("/admin/certificates")
      }
    } catch (error) {
      console.error("Error fetching certificate:", error)
      toast({
        title: "Error",
        description: "Failed to fetch certificate",
        variant: "destructive",
      })
      router.push("/admin/certificates")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      isActive: checked,
    })
  }

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("isActive", formData.isActive)
      if (selectedFile) {
        formDataToSend.append("file", selectedFile)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Certificate updated successfully",
        })
        router.push("/admin/certificates")
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update certificate",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating certificate:", error)
      toast({
        title: "Error",
        description: "Failed to update certificate",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-bhagva-600 mb-4" />
          <p className="text-lg">Loading certificate...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/certificates">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certificates
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Certificate</CardTitle>
          <CardDescription>Update certificate details or upload a new file.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Current File</Label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                {certificate.fileType === "pdf" ? (
                  <FileText className="h-6 w-6 text-red-500 mr-2" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-blue-500 mr-2" />
                )}
                <span className="text-sm">
                  {certificate.title}.{certificate.fileType === "pdf" ? "pdf" : "jpg/png"}
                </span>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}${certificate.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-sm text-blue-600 hover:underline"
                >
                  View
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Upload New File (Optional)</Label>
              <Input id="file" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
              <p className="text-sm text-gray-500">Leave empty to keep the current file. Max file size: 10MB</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/certificates">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Certificate"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
