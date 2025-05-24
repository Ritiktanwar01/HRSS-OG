"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Download, RefreshCw } from "lucide-react"
import { format } from "date-fns"

export default function DonationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [donation, setDonation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDonation = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/donations/${params.id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch donation")
      }

      const data = await response.json()
      setDonation(data.donation)
    } catch (error) {
      console.error("Error fetching donation:", error)
      toast({
        title: "Error",
        description: "Failed to load donation details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshPaymentStatus = async () => {
    if (!donation?.transactionId) return

    setRefreshing(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/donations/status/${donation.transactionId}`,
        {
          credentials: "include",
        },
      )

      if (!response.ok) {
        throw new Error("Failed to refresh payment status")
      }

      const data = await response.json()
      if (data.success) {
        setDonation((prev) => ({ ...prev, paymentStatus: data.donation.status }))
        toast({
          title: "Success",
          description: "Payment status refreshed successfully.",
        })
      }
    } catch (error) {
      console.error("Error refreshing payment status:", error)
      toast({
        title: "Error",
        description: "Failed to refresh payment status.",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const downloadReceipt = () => {
    if (!donation) return

    const receiptData = `
DONATION RECEIPT
================

Donation ID: ${donation._id}
Transaction ID: ${donation.transactionId || "N/A"}
Date: ${format(new Date(donation.createdAt), "dd MMM yyyy, HH:mm")}

DONOR INFORMATION
-----------------
Name: ${donation.name}
Email: ${donation.email}
Phone: ${donation.phone}

DONATION DETAILS
----------------
Amount: ₹${donation.amount}
Type: ${donation.donationType === "oneTime" ? "One-time" : "Monthly"}
Status: ${donation.paymentStatus}
Message: ${donation.message || "N/A"}

PAYMENT INFORMATION
-------------------
Payment Method: ${donation.paymentMethod}
${donation.paymentDetails ? `Payment Details: ${JSON.stringify(donation.paymentDetails, null, 2)}` : ""}

Thank you for your generous donation!
    `

    const blob = new Blob([receiptData], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `donation-receipt-${donation._id}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    fetchDonation()
  }, [params.id])

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-bhagva-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading donation details...</p>
        </div>
      </div>
    )
  }

  if (!donation) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Donation not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-bhagva-800">Donation Details</h1>
            <p className="text-gray-500">View donation information and status</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshPaymentStatus} disabled={refreshing || !donation.transactionId}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
          <Button onClick={downloadReceipt} className="bg-bhagva-700 hover:bg-bhagva-800">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Button variant="outline" onClick={() => router.push(`/admin/donations/edit/${donation._id}`)}>
            Edit Donation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Donor Information</CardTitle>
            <CardDescription>Details about the donor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg font-semibold">{donation.name}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{donation.email}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-lg">{donation.phone}</p>
            </div>
            {donation.message && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <p className="text-lg">{donation.message}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Donation Information */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Information</CardTitle>
            <CardDescription>Details about the donation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Amount</label>
              <p className="text-2xl font-bold text-bhagva-800">₹{donation.amount.toLocaleString()}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <p className="text-lg">{donation.donationType === "oneTime" ? "One-time" : "Monthly"}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">{getStatusBadge(donation.paymentStatus)}</div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-lg">{format(new Date(donation.createdAt), "dd MMM yyyy, HH:mm")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Transaction and payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                <p className="text-lg font-mono">{donation.transactionId || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Method</label>
                <p className="text-lg capitalize">{donation.paymentMethod}</p>
              </div>
            </div>

            {donation.paymentDetails && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Details</label>
                  <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(donation.paymentDetails, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
