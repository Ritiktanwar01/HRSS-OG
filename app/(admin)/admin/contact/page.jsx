"use client"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function AdminContactPage() {
  const [inquiries, setInquiries] = useState([])
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { getAuthToken } = useAuth()

  useEffect(() => {
    const fetchInquiries = async () => {
      setIsLoading(true)
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setInquiries(data)
        }
      } catch (error) {
        console.error("Error fetching inquiries:", error)
        toast({
          title: "Error",
          description: "Failed to load inquiries",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchInquiries()
  }, [getAuthToken])

  async function handleViewInquiry(inquiry) {
    setSelectedInquiry(inquiry)
    if (inquiry.status === "unread") {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/${inquiry._id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        if (response.ok) {
          setInquiries(inquiries.map((item) => (item._id === inquiry._id ? { ...item, status: "read" } : item)))
        }
      } catch (error) {
        console.error("Error marking inquiry as read:", error)
      }
    }
  }

  async function handleDeleteInquiry(id) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      if (response.ok) {
        setInquiries(inquiries.filter((i) => i._id !== id))
        toast({ title: "Deleted", description: "Inquiry removed" })
      } else {
        throw new Error("Failed")
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error)
      toast({ title: "Error", description: "Failed to delete inquiry", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contact Inquiries</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : inquiries.length === 0 ? (
        <p>No inquiries found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inq) => (
              <TableRow key={inq._id}>
                <TableCell className="font-medium text-sm">{inq.name}</TableCell>
                <TableCell>{inq.email}</TableCell>
                <TableCell>{inq.status}</TableCell>
                <TableCell>
                  <button onClick={() => handleViewInquiry(inq)} className="mr-2">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteInquiry(inq._id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* view dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedInquiry.name}</p>
              <p><strong>Email:</strong> {selectedInquiry.email}</p>
              <p><strong>Phone:</strong> {selectedInquiry.phone}</p>
              <p><strong>Message:</strong> {selectedInquiry.message}</p>
              <p><strong>Status:</strong> {selectedInquiry.status}</p>
            </div>
          )}
          <DialogFooter>
            <button onClick={() => setSelectedInquiry(null)}>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
