"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Search, Eye, Edit2, Trash2, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function NoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedNotice, setSelectedNotice] = useState(null)

  useEffect(() => {
    fetchNotices()
  }, [categoryFilter])

  const fetchNotices = async () => {
    try {
      const category = categoryFilter !== "all" ? `&category=${categoryFilter}` : ""
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notices?search=${searchTerm}${category}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      )
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setNotices(data.notices)
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
    if (!confirm("Are you sure you want to delete this notice?")) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notices/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Notice deleted successfully",
      })

      fetchNotices()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notice",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN")

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
        <Button asChild className="mt-4 md:mt-0 bg-bhagva-700 hover:bg-bhagva-800">
          <Link href="/admin/notices/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Notice
          </Link>
        </Button>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  fetchNotices()
                }}
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
                      <Button asChild size="sm" variant="outline" className="text-bhagva-700 border-bhagva-200 bg-transparent">
                        <Link href={`/admin/notices/edit/${notice._id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(notice._id)}
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
        {notices.map((notice) => (
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
                <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Link href={`/admin/notices/edit/${notice._id}`}>Edit</Link>
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
                    <Link href={`/admin/notices/edit/${selectedNotice._id}`}>Edit Notice</Link>
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

      {notices.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notices Found</h3>
            <p className="text-gray-600 mb-4">No notices found for the selected filters.</p>
            <Button asChild className="bg-bhagva-700 hover:bg-bhagva-800">
              <Link href="/admin/notices/create">Create First Notice</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
