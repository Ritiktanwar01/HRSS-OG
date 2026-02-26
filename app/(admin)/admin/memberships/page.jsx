"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Search, Eye, Edit2, Trash2, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getCookie } from "@/hooks/api"

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortAsc, setSortAsc] = useState(true) // sort by status
  const [selectedMembership, setSelectedMembership] = useState(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectRemark, setRejectRemark] = useState("")
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // load once at startup
    fetchMemberships()
    // fetchStats()
  }, [])

  const fetchMemberships = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/membership-applications/list/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),          },
        }
      )
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setMemberships(data)
      setLoading(false) // ensure loading false after fetch
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to load memberships",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // const fetchStats = async () => {
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memberships/stats/overview`, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  //       },
  //     })
  //     if (!response.ok) throw new Error("Failed to fetch stats")
  //     const data = await response.json()
  //     setStats(data)
  //   } catch (error) {
  //     console.error("Error:", error)
  //   }
  // }

  // Accept an application
  const handleAccept = async (id) => {
    try {
      const formData = new FormData()
      formData.append("status", "accepted")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/membership-applications/${id}/`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            // do not set Content-Type when sending FormData; browser handles it
            "X-CSRFToken": getCookie("csrftoken"),
          },
          body: formData,
        }
      )
      if (!response.ok) throw new Error("Failed to accept")
      toast({title: "Success", description: "Application accepted"})
      fetchMemberships()
      setSelectedMembership(null)
    } catch (error) {
      toast({title: "Error", description: "Unable to accept", variant: "destructive"})
    }
  }

  // Reject an application (opens confirmation)
  const initiateReject = (membership) => {
    setSelectedMembership(membership)
    setIsRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!selectedMembership) return
    try {
      const formData = new FormData()
      formData.append("status", "rejected")
      formData.append("remark", rejectRemark)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/membership-applications/${selectedMembership.id}/`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            // omit Content-Type for FormData
            "X-CSRFToken": getCookie("csrftoken"),
          },
          body: formData,
        }
      )
      if (!response.ok) throw new Error("Failed to reject")
      toast({title: "Success", description: "Application rejected"})
      fetchMemberships()
      setSelectedMembership(null)
    } catch (error) {
      toast({title: "Error", description: "Unable to reject", variant: "destructive"})
    } finally {
      setIsRejectDialogOpen(false)
      setSelectedMembership(null)
      setRejectRemark("")
    }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN")

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }
    return styles[status] || styles.pending
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-bhagva-700" />
      </div>
    )
  }

  // compute filtered + sorted list
  const filteredMemberships = memberships
    .filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        if (
          !m.full_name.toLowerCase().includes(term) &&
          !m.email.toLowerCase().includes(term) &&
          !m.mobile.toLowerCase().includes(term)
        )
          return false
      }
      return true
    })
    .sort((a, b) => {
      if (a.status < b.status) return sortAsc ? -1 : 1
      if (a.status > b.status) return sortAsc ? 1 : -1
      return new Date(b.created_at) - new Date(a.created_at)
    })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Memberships</h1>
        <p className="text-gray-600 mt-2">Manage membership applications</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-bhagva-700">{stats.total}</div>
                <p className="text-gray-600 text-sm mt-1">Total Applications</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-gray-600 text-sm mt-1">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-gray-600 text-sm mt-1">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-gray-600 text-sm mt-1">Rejected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.feePaid}</div>
                <p className="text-gray-600 text-sm mt-1">Fee Paid</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name, email, or mobile..."
                value={searchTerm}
                onChange={(e) => {
                          setSearchTerm(e.target.value)
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={() => setSortAsc((s) => !s)}>
                Sort: {sortAsc ? "Asc" : "Desc"}
              </Button>
            </div>
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
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Mobile</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Fee Paid</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>{filteredMemberships.map((membership) => (
                  <tr key={membership.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="py-3 px-4 flex items-center">{membership.image && (<img src={process.env.NEXT_PUBLIC_API_URL + membership.image} alt="photo" className="h-6 w-6 rounded-full mr-2 object-cover" />)}{membership.full_name}</td><td className="py-3 px-4 text-blue-600">{membership.email}</td><td className="py-3 px-4">{membership.mobile}</td><td className="py-3 px-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(membership.status)}`}>{membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}</span></td><td className="py-3 px-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${membership.fee_paid ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{membership.fee_paid ? "Yes" : "No"}</span></td><td className="py-3 px-4 text-gray-600">{formatDate(membership.created_at)}</td><td className="py-3 px-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => setSelectedMembership(membership)} className="text-bhagva-700 border-bhagva-200"><Eye className="h-4 w-4" /></Button><Button size="sm" variant="solid" onClick={() => handleAccept(membership.id)} className="bg-green-100 text-green-700">Accept</Button><Button size="sm" variant="outline" onClick={() => initiateReject(membership)} className="text-red-600 border-red-200">Reject</Button></td></tr>
                ))}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredMemberships.map((membership) => (
          <Card key={membership.id} className="border-bhagva-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  {membership.image && (
                    <img
                      src={process.env.NEXT_PUBLIC_API_URL + membership.image}
                      alt="photo"
                      className="h-6 w-6 rounded-full mr-2 object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{membership.full_name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusBadge(membership.status)}`}>
                    {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <p>
                  <span className="text-gray-600">Email:</span> {membership.email}
                </p>
                <p>
                  <span className="text-gray-600">Mobile:</span> {membership.mobile}
                </p>
                <p>
                  <span className="text-gray-600">Fee Paid:</span> {membership.fee_paid ? "Yes" : "No"}
                </p>
                <p>
                  <span className="text-gray-600">Date:</span> {formatDate(membership.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-bhagva-700 hover:bg-bhagva-800"
                  onClick={() => setSelectedMembership(membership)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-green-100 text-green-700"
                  onClick={() => handleAccept(membership.id)}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200"
                  onClick={() => initiateReject(membership)}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={!!selectedMembership} onOpenChange={() => setSelectedMembership(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMembership && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMembership.full_name}</DialogTitle>
                <DialogDescription>Membership Application Details</DialogDescription>
              </DialogHeader>
              {selectedMembership.image && (
                <div className="text-center mb-4">
                  <img
                    src={process.env.NEXT_PUBLIC_API_URL+ selectedMembership.image}
                    alt="Applicant photo"
                    className="mx-auto h-32 w-32 rounded-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-6 py-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold text-gray-900">{selectedMembership.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Father/Spouse Name</p>
                    <p className="font-semibold text-gray-900">{selectedMembership.father_or_spouse_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedMembership.date_of_birth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="font-semibold text-gray-900">{selectedMembership.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-blue-600">{selectedMembership.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusBadge(selectedMembership.status)}`}>
                      {selectedMembership.status.charAt(0).toUpperCase() + selectedMembership.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-900">{selectedMembership.address}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Registration Fee</p>
                    {/* registration fee not stored in model */}
                    <p className="text-2xl font-bold text-blue-600">₹{selectedMembership.registration_fee_amount || "N/A"}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Fee Status</p>
                    <p className={`text-lg font-bold ${selectedMembership.fee_paid ? "text-green-600" : "text-orange-600"}`}>
                      {selectedMembership.fee_paid ? "Paid" : "Pending"}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Application Date</p>
                    <p className="text-lg font-bold text-purple-600">{formatDate(selectedMembership.created_at)}</p>
                  </div>
                </div>
                {selectedMembership.remark && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Remark</p>
                    <p className="font-semibold text-gray-900 whitespace-pre-wrap">{selectedMembership.remark}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"                    className="flex-1 bg-bhagva-700 hover:bg-bhagva-800"
                    onClick={() => window.location.href = `/admin/memberships/edit/${selectedMembership.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"                    className="flex-1 bg-green-100 text-green-700"
                    onClick={() => handleAccept(selectedMembership.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200"
                    onClick={() => initiateReject(selectedMembership)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject confirmation dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this application?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Rejection remark (sent to applicant)</p>
              <textarea
                className="w-full border rounded px-2 py-1"
                rows={3}
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredMemberships.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Memberships Found</h3>
            <p className="text-gray-600">No membership applications found for the selected filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
