"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save } from "lucide-react"

export default function EditDonationPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    donationType: "oneTime",
    message: "",
    paymentStatus: "pending",
    transactionId: "",
  })

  const fetchDonation = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/donations/${params.id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch donation")
      }

      const data = await response.json()
      const donation = data.donation

      setFormData({
        name: donation.name || "",
        email: donation.email || "",
        phone: donation.phone || "",
        amount: donation.amount?.toString() || "",
        donationType: donation.donationType || "oneTime",
        message: donation.message || "",
        paymentStatus: donation.paymentStatus || "pending",
        transactionId: donation.transactionId || "",
      })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/donations/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          amount: Number.parseFloat(formData.amount),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update donation")
      }

      toast({
        title: "Success",
        description: "Donation updated successfully.",
      })

      router.push(`/admin/donations/view/${params.id}`)
    } catch (error) {
      console.error("Error updating donation:", error)
      toast({
        title: "Error",
        description: "Failed to update donation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  useEffect(() => {
    fetchDonation()
  }, [params.id])

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

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-bhagva-800">Edit Donation</h1>
          <p className="text-gray-500">Update donation information and status</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Donor Information</CardTitle>
              <CardDescription>Update donor details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Donation Information */}
          <Card>
            <CardHeader>
              <CardTitle>Donation Information</CardTitle>
              <CardDescription>Update donation details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="donationType">Donation Type</Label>
                <Select
                  value={formData.donationType}
                  onValueChange={(value) => handleInputChange("donationType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oneTime">One-time</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => handleInputChange("paymentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  value={formData.transactionId}
                  onChange={(e) => handleInputChange("transactionId", e.target.value)}
                  placeholder="Enter transaction ID"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-bhagva-700 hover:bg-bhagva-800">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
