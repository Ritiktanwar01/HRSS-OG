"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Download, Search, Filter } from "lucide-react"
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
        return <Badge className="bg-green-500 text-white">Success</Badge>
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-bhagva-800">Donations</h1>
          <p className="text-gray-500 text-sm">Manage and track all donations</p>
        </div>
        <Button onClick={exportToCSV} className="w-full sm:w-auto bg-bhagva-700 hover:bg-bhagva-800 text-sm" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="text-sm sm:text-base">Total Donations</CardTitle>
            <CardDescription className="text-xs sm:text-sm">All time donations</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-bhagva-800">
              ₹{totalSuccessfulDonations.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="text-sm sm:text-base">Successful</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Completed donations</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
              {donations.filter((d) => d.paymentStatus === "success").length}
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="text-sm sm:text-base">Failed</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Unsuccessful attempts</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">
              {donations.filter((d) => d.paymentStatus === "failed").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Donation Records</CardTitle>
          <CardDescription className="text-sm">View and manage all donation transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, email or transaction ID"
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px] text-sm">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px] text-sm">
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

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-bhagva-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-500 text-sm">Loading donations...</p>
            </div>
          ) : sortedDonations.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-gray-500 text-sm">No donations found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Transaction ID</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDonations.map((donation) => (
                      <TableRow key={donation._id}>
                        <TableCell className="font-medium text-sm">{donation.name}</TableCell>
                        <TableCell className="text-sm">{donation.email}</TableCell>
                        <TableCell className="text-sm font-semibold">₹{donation.amount}</TableCell>
                        <TableCell className="text-sm">
                          {donation.donationType === "oneTime" ? "One-time" : "Monthly"}
                        </TableCell>
                        <TableCell>{getStatusBadge(donation.paymentStatus)}</TableCell>
                        <TableCell className="font-mono text-xs">{donation.transactionId || "N/A"}</TableCell>
                        <TableCell className="text-sm">
                          {donation.createdAt ? format(new Date(donation.createdAt), "dd MMM yyyy") : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {sortedDonations.map((donation) => (
                  <Card key={donation._id} className="p-3 border-l-4 border-l-bhagva-600">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-semibold text-sm truncate">{donation.name}</h3>
                          <p className="text-xs text-gray-600 truncate">{donation.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sm text-bhagva-800">₹{donation.amount}</p>
                          <div className="mt-1">{getStatusBadge(donation.paymentStatus)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
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
                        <div className="text-xs">
                          <span className="text-gray-500">Transaction ID:</span>
                          <p className="font-mono text-xs break-all bg-gray-50 p-1 rounded mt-1">
                            {donation.transactionId}
                          </p>
                        </div>
                      )}
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
