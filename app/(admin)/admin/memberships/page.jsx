"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Search, Eye, Edit2, Trash2, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedMembership, setSelectedMembership] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchMemberships()
    fetchStats()
  }, [statusFilter])

  const fetchMemberships = async () => {
    try {
      const status = statusFilter !== "all" ? `&status=${statusFilter}` : ""
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/memberships?search=${searchTerm}${status}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      )
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setMemberships(data.memberships)
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

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memberships/stats/overview`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this membership?")) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memberships/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Membership deleted successfully",
      })

      fetchMemberships()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete membership",
        variant: "destructive",
      })
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
                  fetchMemberships()
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Mobile</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Fee Paid</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((membership) => (
                  <tr key={membership._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{membership.fullName}</td>
                    <td className="py-3 px-4 text-blue-600">{membership.email}</td>
                    <td className="py-3 px-4">{membership.mobile}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(membership.status)}`}>
                        {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${membership.feePaid ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {membership.feePaid ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(membership.createdAt)}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMembership(membership)}
                        className="text-bhagva-700 border-bhagva-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button asChild size="sm" variant="outline" className="text-bhagva-700 border-bhagva-200 bg-transparent">
                        <Link href={`/admin/memberships/edit/${membership._id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(membership._id)}
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
        {memberships.map((membership) => (
          <Card key={membership._id} className="border-bhagva-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{membership.fullName}</p>
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
                  <span className="text-gray-600">Fee Paid:</span> {membership.feePaid ? "Yes" : "No"}
                </p>
                <p>
                  <span className="text-gray-600">Date:</span> {formatDate(membership.createdAt)}
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
                <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Link href={`/admin/memberships/edit/${membership._id}`}>Edit</Link>
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
                <DialogTitle>{selectedMembership.fullName}</DialogTitle>
                <DialogDescription>Membership Application Details</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold text-gray-900">{selectedMembership.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Father/Spouse Name</p>
                    <p className="font-semibold text-gray-900">{selectedMembership.fatherOrSpouseName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedMembership.dateOfBirth)}</p>
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
                    <p className="text-2xl font-bold text-blue-600">₹{selectedMembership.registrationFeeAmount}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Fee Status</p>
                    <p className={`text-lg font-bold ${selectedMembership.feePaid ? "text-green-600" : "text-orange-600"}`}>
                      {selectedMembership.feePaid ? "Paid" : "Pending"}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Application Date</p>
                    <p className="text-lg font-bold text-purple-600">{formatDate(selectedMembership.createdAt)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button asChild className="flex-1 bg-bhagva-700 hover:bg-bhagva-800">
                    <Link href={`/admin/memberships/edit/${selectedMembership._id}`}>Edit Application</Link>
                  </Button>
                  <Button
                    onClick={() => {
                      handleDelete(selectedMembership._id)
                      setSelectedMembership(null)
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

      {memberships.length === 0 && (
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
