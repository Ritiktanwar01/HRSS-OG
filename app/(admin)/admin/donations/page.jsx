"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Download, Search, Filter, Eye, Edit } from "lucide-react"
import { format } from "date-fns"

export default function DonationsPage() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch(`${`${process.env.NEXT_PUBLIC_API_URL}/api` || "/api"}/donations`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch donations")
        }

        const data = await response.json()
        setDonations(data.donations || [])
      } catch (error) {
        console.error("Error fetching donations:", error)
        toast({
          title: "Error",
          description: "Failed to load donations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [])

  // Filter and sort donations
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || donation.paymentStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort donations
  const sortedDonations = [...filteredDonations].sort((a, b) => {
    if (sortBy === "date-desc") {
      return new Date(b.createdAt) - new Date(a.createdAt)
    } else if (sortBy === "date-asc") {
      return new Date(a.createdAt) - new Date(b.createdAt)
    } else if (sortBy === "amount-desc") {
      return b.amount - a.amount
    } else if (sortBy === "amount-asc") {
      return a.amount - b.amount
    }
    return 0
  })

  // Export donations as CSV
  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Amount", "Type", "Status", "Transaction ID", "Date"]

    const csvData = sortedDonations.map((donation) => [
      donation.name,
      donation.email,
      donation.phone,
      donation.amount,
      donation.donationType === "oneTime" ? "One-time" : "Monthly",
      donation.paymentStatus,
      donation.transactionId || "N/A",
      new Date(donation.createdAt).toLocaleDateString(),
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `donations-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
            Pending
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  // Calculate total donations
  const totalSuccessfulDonations = donations
    .filter((d) => d.paymentStatus === "success")
    .reduce((sum, donation) => sum + donation.amount, 0)

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bhagva-800">Donations</h1>
          <p className="text-gray-500">Manage and track all donations</p>
        </div>
        <Button onClick={exportToCSV} className="w-full sm:w-auto bg-bhagva-700 hover:bg-bhagva-800">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Donations</CardTitle>
            <CardDescription>All time donations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-bhagva-800">₹{totalSuccessfulDonations.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Successful Transactions</CardTitle>
            <CardDescription>Completed donations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {donations.filter((d) => d.paymentStatus === "success").length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Failed Transactions</CardTitle>
            <CardDescription>Unsuccessful attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {donations.filter((d) => d.paymentStatus === "failed").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donation Records</CardTitle>
          <CardDescription>View and manage all donation transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, email or transaction ID"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-bhagva-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-500">Loading donations...</p>
            </div>
          ) : sortedDonations.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-gray-500">No donations found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDonations.map((donation) => (
                      <TableRow key={donation._id}>
                        <TableCell className="font-medium">{donation.name}</TableCell>
                        <TableCell>{donation.email}</TableCell>
                        <TableCell>₹{donation.amount}</TableCell>
                        <TableCell>{donation.donationType === "oneTime" ? "One-time" : "Monthly"}</TableCell>
                        <TableCell>{getStatusBadge(donation.paymentStatus)}</TableCell>
                        <TableCell className="font-mono text-xs">{donation.transactionId || "N/A"}</TableCell>
                        <TableCell>
                          {donation.createdAt ? format(new Date(donation.createdAt), "dd MMM yyyy, HH:mm") : "N/A"}
                        </TableCell>
                        <TableCell>
                          {/* <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => (window.location.href = `/admin/donations/view/${donation._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => (window.location.href = `/admin/donations/edit/${donation._id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div> */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {sortedDonations.map((donation) => (
                  <Card key={donation._id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{donation.name}</h3>
                          <p className="text-sm text-gray-600">{donation.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-bhagva-800">₹{donation.amount}</p>
                          {getStatusBadge(donation.paymentStatus)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="font-medium">{donation.donationType === "oneTime" ? "One-time" : "Monthly"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <p className="font-medium">
                            {donation.createdAt ? format(new Date(donation.createdAt), "dd MMM yyyy") : "N/A"}
                          </p>
                        </div>
                      </div>

                      {donation.transactionId && (
                        <div className="text-sm">
                          <span className="text-gray-500">Transaction ID:</span>
                          <p className="font-mono text-xs break-all">{donation.transactionId}</p>
                        </div>
                      )}

                      {/* <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => (window.location.href = `/admin/donations/view/${donation._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => (window.location.href = `/admin/donations/edit/${donation._id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div> */}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
