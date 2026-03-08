"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { FileText, ImageIcon, Trash2, Plus, Eye, Pencil } from "lucide-react"
import Link from "next/link"

export default function CertificatesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [certificates, setCertificates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
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
      fetchCertificates()
    }
  }, [user, loading, router])

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates/admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setCertificates(data.certificates)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch certificates",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching certificates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch certificates",
        variant: "destructive",
      })
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
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("isActive", formData.isActive)
      formDataToSend.append("file", selectedFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Certificate added successfully",
        })
        setOpenDialog(false)
        setFormData({
          title: "",
          description: "",
          isActive: true,
        })
        setSelectedFile(null)
        fetchCertificates()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add certificate",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding certificate:", error)
      toast({
        title: "Error",
        description: "Failed to add certificate",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this certificate?")) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Certificate deleted successfully",
        })
        fetchCertificates()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete certificate",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting certificate:", error)
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive",
      })
    }
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-bhagva-600 hover:bg-bhagva-700">
              <Plus className="mr-2 h-4 w-4" /> Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Certificate</DialogTitle>
              <DialogDescription>Upload a certificate image or PDF file.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">Certificate File (JPG, PNG, or PDF)</Label>
                  <Input id="file" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} required />
                  <p className="text-sm text-gray-500">Max file size: 10MB</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bhagva-600"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No certificates found</h3>
          <p className="mt-2 text-sm text-gray-500">Get started by adding a new certificate.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((certificate) => (
                <TableRow key={certificate._id}>
                  <TableCell className="font-medium">{certificate.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {certificate.fileType === "pdf" ? (
                        <FileText className="mr-2 h-4 w-4 text-red-500" />
                      ) : (
                        <ImageIcon className="mr-2 h-4 w-4 text-blue-500" />
                      )}
                      {certificate.fileType.toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        certificate.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {certificate.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(certificate.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0" title="View">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}${certificate.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0" title="Edit">
                        <Link href={`/admin/certificates/edit/${certificate._id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        title="Delete"
                        onClick={() => handleDelete(certificate._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
