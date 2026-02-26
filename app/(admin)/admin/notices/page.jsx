"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Plus, Search, Eye, Edit2, Trash2, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getCookie } from "@/hooks/api"

export default function NoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedNotice, setSelectedNotice] = useState(null)
  const [isAddingFile, setIsAddingFile] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  // dialog state & form data for create/update/delete
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentNotice, setCurrentNotice] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    fileUrl: "",
    fileName: "",
    category: "general",
    isPublished: true,
    expiryDate: "",
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    // in real scenario, upload to server or use FormData
    setUploadedFile(file)
    setFormData((prev) => ({
      ...prev,
      fileName: file.name,
    }))
    toast({ title: 'File selected', description: file.name })
  }

  useEffect(() => {
    fetchNotices()
  }, [categoryFilter])

  const fetchNotices = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/users/public-notices/`
      if (categoryFilter !== "all") url += `category=${categoryFilter}&`
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`
      const response = await fetch(url, {
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      })

      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setNotices(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to load notices",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/public-notices/${id}/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
          },
        }
      )

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Notice deleted successfully",
      })

      // clear selection if it matches
      if (selectedNotice?._id === id) setSelectedNotice(null)
      if (currentNotice?._id === id) setCurrentNotice(null)

      fetchNotices()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notice",
        variant: "destructive",
      })
    }
  }

  const handleAddNotice = async (e) => {
    e.preventDefault()
    try {
      const data = { ...formData }
      if (uploadedFile) {
        // in real scenario with backend support
        // create FormData and send
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/public-notices/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          body: JSON.stringify(data),
        }
      )
      if (response.ok) {
        const newNotice = await response.json()
        setNotices([newNotice, ...notices])
        setIsAddDialogOpen(false)
        setUploadedFile(null)
        setIsAddingFile(false)
        setFormData({
          title: "",
          description: "",
          content: "",
          fileUrl: "",
          fileName: "",
          category: "general",
          isPublished: true,
          expiryDate: "",
        })
        toast({ title: "Success", description: "Notice created" })
      } else {
        const err = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: err.detail || "Failed to create notice",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding notice:", error)
    }
  }

  const handleEditNotice = async (e) => {
    e.preventDefault()
    try {
      const data = { ...formData }
      if (uploadedFile) {
        // handle file upload if needed
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/public-notices/${currentNotice._id}/`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          body: JSON.stringify(data),
        }
      )
      if (response.ok) {
        const updated = await response.json()
        setNotices(
          notices.map((n) => (n._id === updated._id ? updated : n))
        )
        setIsEditDialogOpen(false)
        setCurrentNotice(null)
        setUploadedFile(null)
        setIsAddingFile(false)
        setFormData({
          title: "",
          description: "",
          content: "",
          fileUrl: "",
          fileName: "",
          category: "general",
          isPublished: true,
          expiryDate: "",
        })
        toast({ title: "Success", description: "Notice updated" })
      } else {
        const err = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: err.detail || "Failed to update notice",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating notice:", error)
    }
  }

  const openEditDialog = (notice) => {
    setCurrentNotice(notice)
    setFormData({
      title: notice.title || "",
      description: notice.description || "",
      content: notice.content || "",
      fileUrl: notice.fileUrl || "",
      fileName: notice.fileName || "",
      category: notice.category || "general",
      isPublished: notice.isPublished,
      expiryDate: notice.expiryDate ? notice.expiryDate.split("T")[0] : "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (notice) => {
    setCurrentNotice(notice)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN")

  // apply filters locally so we don't rely on backend query params
  const filteredNotices = notices.filter((n) => {
    if (categoryFilter !== "all" && n.category !== categoryFilter) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        n.title.toLowerCase().includes(term) ||
        n.description.toLowerCase().includes(term)
      )
    }
    return true
  })

  const getCategoryBadge = (category) => {
    const styles = {
      general: "bg-blue-100 text-blue-800",
      important: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
      announcement: "bg-green-100 text-green-800",
    }
    return styles[category] || styles.general
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-bhagva-700" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Public Notices</h1>
          <p className="text-gray-600 mt-2">Manage public notices and announcements</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4 md:mt-0 bg-bhagva-700 hover:bg-bhagva-800">
            <Plus className="mr-2 h-4 w-4" />
            Create Notice
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddNotice} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAddingFile}
                  onChange={(e) => {
                    setIsAddingFile(e.target.checked)
                    if (!e.target.checked) setUploadedFile(null)
                  }}
                  className="checkbox"
                />
                Add File
              </Label>
            </div>
            {isAddingFile && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.xlsx,.zip"
                  />
                  {uploadedFile && (
                    <p className="text-sm text-gray-600">Selected: {uploadedFile.name}</p>
                  )}
                </div>
              </>
            )}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData((p) => ({ ...p, category: val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="expiryDate">Expiry date</Label>
                <Input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="checkbox"
              />
              <Label htmlFor="isPublished" className="mb-0">
                Published
              </Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <Card className="hidden lg:block">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Title</th>
                  <th className="text-left py-3 px-4 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 font-semibold">Published</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((notice) => (
                  <tr key={notice._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{notice.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadge(notice.category)}`}>
                        {notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${notice.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {notice.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(notice.createdAt)}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedNotice(notice)}
                        className="text-bhagva-700 border-bhagva-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(notice)}
                        className="text-bhagva-700 border-bhagva-200"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(notice)}
                        className="text-red-600 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredNotices.map((notice) => (
          <Card key={notice._id} className="border-bhagva-200">
            <CardContent className="pt-6">
              <div className="mb-4">
                <p className="font-semibold text-gray-900 mb-2">{notice.title}</p>
                <div className="flex gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryBadge(notice.category)}`}>
                    {notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${notice.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {notice.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{notice.description}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-bhagva-700 hover:bg-bhagva-800"
                  onClick={() => setSelectedNotice(notice)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => openEditDialog(notice)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200"
                  onClick={() => openDeleteDialog(notice)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedNotice && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNotice.title}</DialogTitle>
                <DialogDescription>{formatDate(selectedNotice.createdAt)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadge(selectedNotice.category)}`}>
                    {selectedNotice.category.charAt(0).toUpperCase() + selectedNotice.category.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedNotice.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {selectedNotice.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedNotice.description}</p>
                </div>

                {selectedNotice.content && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Content</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedNotice.content}</p>
                  </div>
                )}

                {selectedNotice.fileUrl && (
                  <div className="bg-bhagva-50 border border-bhagva-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-bhagva-700" />
                      <div>
                        <p className="font-semibold text-gray-900">Attached Document</p>
                        <p className="text-sm text-gray-600">{selectedNotice.fileName || "document.pdf"}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button asChild className="flex-1 bg-bhagva-700 hover:bg-bhagva-800">
                    <button type="button" onClick={() => openEditDialog(selectedNotice)} className="w-full text-left">
                    Edit Notice
                  </button>
                  </Button>
                  <Button
                    onClick={() => {
                      handleDelete(selectedNotice._id)
                      setSelectedNotice(null)
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditNotice} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fileUrl">File URL</Label>
              <Input
                id="edit-fileUrl"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fileName">File Name</Label>
              <Input
                id="edit-fileName"
                name="fileName"
                value={formData.fileName}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData((p) => ({ ...p, category: val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="edit-expiryDate">Expiry date</Label>
                <Input
                  type="date"
                  id="edit-expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="edit-isPublished"
                name="isPublished"
                type="checkbox"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="checkbox"
              />
              <Label htmlFor="edit-isPublished" className="mb-0">
                Published
              </Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notice</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the notice "{currentNotice?.title}"?
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                handleDelete(currentNotice._id)
                setIsDeleteDialogOpen(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredNotices.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notices Found</h3>
            <p className="text-gray-600 mb-4">No notices found for the selected filters.</p>
            <Button className="bg-bhagva-700 hover:bg-bhagva-800" onClick={() => setIsAddDialogOpen(true)}>
              Create First Notice
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
