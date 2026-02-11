"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Search, Download, Calendar, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function PublicNoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNotice, setSelectedNotice] = useState(null)

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/public-notices/`)
      if (!response.ok) throw new Error("Failed to fetch notices")
      const data = await response.json()
      setNotices(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to load public notices",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredNotices = notices.filter((notice) =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDownload = (notice) => {
    if (notice.fileUrl) {
      const link = document.createElement("a")
      link.href = notice.fileUrl
      link.target = "_blank"
      link.download = `${notice.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      toast({
        title: "Info",
        description: "No file available for download",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bhagva-50 to-bhagva-100 py-12 px-4 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-bhagva-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bhagva-50 to-bhagva-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-bhagva-900 mb-4">Public Notices</h1>
          <p className="text-lg text-gray-600">
            Important announcements and official notices from Hindu Rashtra Sevak Sangh
          </p>
        </div>

        {/* Search Bar */}
        <Card className="border-bhagva-200 shadow-lg mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-bhagva-500 focus:ring-bhagva-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notices Grid */}
        {filteredNotices.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {filteredNotices.map((notice) => (
              <Card
                key={notice._id}
                className="border-bhagva-200 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <CardHeader className="bg-gradient-to-r from-bhagva-600 to-bhagva-700 text-white pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white mb-2">{notice.title}</CardTitle>
                      <div className="flex items-center gap-2 text-bhagva-100 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(notice.createdAt)}</span>
                      </div>
                    </div>
                    <FileText className="h-8 w-8 text-bhagva-200 flex-shrink-0" />
                  </div>
                </CardHeader>

                <CardContent className="pt-6 pb-6">
                  <p className="text-gray-700 mb-6 line-clamp-3">{notice.description}</p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setSelectedNotice(notice)}
                      className="flex-1 bg-bhagva-700 hover:bg-bhagva-800 text-white"
                    >
                      View Details
                    </Button>
                    {notice.fileUrl && (
                      <Button
                        onClick={() => handleDownload(notice)}
                        variant="outline"
                        className="flex-1 border-bhagva-200 text-bhagva-700 hover:bg-bhagva-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-bhagva-200 shadow-lg">
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notices Found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "Check back soon for updates"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedNotice && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-bhagva-900">{selectedNotice.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-gray-600 mt-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(selectedNotice.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNotice.description}</p>
                </div>

                {selectedNotice.content && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Content</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedNotice.content}</p>
                  </div>
                )}

                {selectedNotice.fileUrl && (
                  <div className="bg-bhagva-50 border border-bhagva-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-bhagva-700" />
                        <div>
                          <p className="font-semibold text-gray-900">Attached Document</p>
                          <p className="text-sm text-gray-600">Click download to view the file</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownload(selectedNotice)}
                        className="bg-bhagva-700 hover:bg-bhagva-800"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
