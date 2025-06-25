"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail, MapPin, Phone, Trash2, Eye, Plus, Edit } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

// Form schema for contact page content
const contactFormSchema = z.object({
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  phone1: z.string().min(10, { message: "Phone number must be at least 10 characters." }),
  phone2: z.string().optional(),
  email1: z.string().email({ message: "Please enter a valid email address." }),
  email2: z.string().email({ message: "Please enter a valid email address." }).optional(),
  officeHours: z.string().min(5, { message: "Office hours must be at least 5 characters." }),
})

// Form schema for regional offices
const officeFormSchema = z.object({
  name: z.string().min(2, { message: "Office name must be at least 2 characters." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters." }).optional(),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
})

export default function AdminContactPage() {
  const [inquiries, setInquiries] = useState([])
  const [offices, setOffices] = useState([])
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [isAddingOffice, setIsAddingOffice] = useState(false)
  const [editingOffice, setEditingOffice] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { getAuthToken } = useAuth()

  // Form for contact page content
  const contactForm = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      address: "",
      phone1: "",
      phone2: "",
      email1: "",
      email2: "",
      officeHours: "",
    },
  })

  // Form for regional offices
  const officeForm = useForm({
    resolver: zodResolver(officeFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  })

  // Fetch contact information, offices, and inquiries on component mount
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          contactForm.reset({
            address: data.address || "",
            phone1: data.phone1 || "",
            phone2: data.phone2 || "",
            email1: data.email1 || "",
            email2: data.email2 || "",
            officeHours: data.officeHours || "",
          })
        }
      } catch (error) {
        console.error("Error fetching contact info:", error)
        toast({
          title: "Error",
          description: "Failed to load contact information",
          variant: "destructive",
        })
      }
    }

    const fetchOffices = async () => {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/offices`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setOffices(data)
        }
      } catch (error) {
        console.error("Error fetching offices:", error)
        toast({
          title: "Error",
          description: "Failed to load regional offices",
          variant: "destructive",
        })
      }
    }

    const fetchInquiries = async () => {
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
      }
    }

    fetchContactInfo()
    fetchOffices()
    fetchInquiries()
  }, [getAuthToken])

  async function onContactSubmit(data) {
    setIsLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Contact Page Updated",
          description: "The contact page content has been successfully updated.",
        })
      } else {
        throw new Error("Failed to update contact information")
      }
    } catch (error) {
      console.error("Error updating contact info:", error)
      toast({
        title: "Error",
        description: "Failed to update contact information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleViewInquiry(inquiry) {
    setSelectedInquiry(inquiry)

    // Mark as read if unread
    if (inquiry.status === "unread") {
      try {
        const token = getAuthToken()
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
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        setInquiries(inquiries.filter((inquiry) => inquiry._id !== id))
        toast({
          title: "Inquiry Deleted",
          description: "The inquiry has been successfully removed.",
        })
      } else {
        throw new Error("Failed to delete inquiry")
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error)
      toast({
        title: "Error",
        description: "Failed to delete inquiry",
        variant: "destructive",
      })
    }
  }

  function handleAddOffice() {
    setIsAddingOffice(true)
    setEditingOffice(null)
    officeForm.reset({
      name: "",
      address: "",
      phone: "",
      email: "",
    })
  }

  function handleEditOffice(office) {
    setIsAddingOffice(false)
    setEditingOffice(office)
    officeForm.reset({
      name: office.name || "",
      address: office.address || "",
      phone: office.phone || "",
      email: office.email || "",
    })
  }

  async function handleDeleteOffice(id) {
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/offices/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        setOffices(offices.filter((office) => office._id !== id))
        toast({
          title: "Office Deleted",
          description: "The regional office has been successfully removed.",
        })
      } else {
        throw new Error("Failed to delete office")
      }
    } catch (error) {
      console.error("Error deleting office:", error)
      toast({
        title: "Error",
        description: "Failed to delete office",
        variant: "destructive",
      })
    }
  }

  async function onOfficeSubmit(data) {
    setIsLoading(true)
    try {
      const token = getAuthToken()
      let response

      if (editingOffice) {
        // Update existing office
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/offices/${editingOffice._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(data),
        })
      } else {
        // Add new office
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/offices`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(data),
        })
      }

      if (response.ok) {
        const result = await response.json()

        if (editingOffice) {
          setOffices(offices.map((office) => (office._id === editingOffice._id ? result : office)))
          toast({
            title: "Office Updated",
            description: "The regional office has been successfully updated.",
          })
        } else {
          setOffices([...offices, result])
          toast({
            title: "Office Added",
            description: "The new regional office has been successfully added.",
          })
        }

        // Close dialog
        document.querySelector("[data-radix-dialog-close]")?.click()
      } else {
        throw new Error("Failed to save office")
      }
    } catch (error) {
      console.error("Error saving office:", error)
      toast({
        title: "Error",
        description: "Failed to save office",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Page Management</h1>
        <p className="text-muted-foreground">Manage contact information and inquiries.</p>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Contact Information</TabsTrigger>
          <TabsTrigger value="offices">Regional Offices</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Edit the main contact information displayed on the contact page</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...contactForm}>
                <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-bhagva-600 mr-3 mt-1" />
                        <div className="flex-1">
                          <FormField
                            control={contactForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter organization address"
                                    className="min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-bhagva-600 mr-3 mt-1" />
                        <div className="flex-1 space-y-4">
                          <FormField
                            control={contactForm.control}
                            name="phone1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter primary phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={contactForm.control}
                            name="phone2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secondary Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter secondary phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-bhagva-600 mr-3 mt-1" />
                        <div className="flex-1 space-y-4">
                          <FormField
                            control={contactForm.control}
                            name="email1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter primary email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={contactForm.control}
                            name="email2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secondary Email (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter secondary email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={contactForm.control}
                        name="officeHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Office Hours</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter office hours" className="min-h-[80px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="bg-bhagva-700 hover:bg-bhagva-800" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offices" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Regional Offices</CardTitle>
                <CardDescription>Manage regional office locations displayed on the contact page</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-bhagva-700 hover:bg-bhagva-800" onClick={handleAddOffice}>
                    <Plus className="mr-2 h-4 w-4" /> Add Office
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{isAddingOffice ? "Add New Office" : "Edit Office"}</DialogTitle>
                    <DialogDescription>
                      {isAddingOffice
                        ? "Add details for the new regional office."
                        : "Update the details of the regional office."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...officeForm}>
                    <form onSubmit={officeForm.handleSubmit(onOfficeSubmit)} className="space-y-4">
                      <FormField
                        control={officeForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Office Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Mumbai Office" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={officeForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter office address" className="min-h-[80px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={officeForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={officeForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="submit" className="bg-bhagva-700 hover:bg-bhagva-800" disabled={isLoading}>
                          {isLoading ? "Saving..." : isAddingOffice ? "Add Office" : "Save Changes"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offices.map((office) => (
                  <div key={office._id} className="flex items-start p-4 border rounded-md">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{office.name}</h3>
                      <p className="text-muted-foreground mt-1">{office.address}</p>
                      {office.phone && <p className="text-sm mt-1">Phone: {office.phone}</p>}
                      {office.email && <p className="text-sm mt-1">Email: {office.email}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEditOffice(office)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteOffice(office._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Inquiries</CardTitle>
              <CardDescription>View and manage inquiries submitted through the contact form</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((inquiry) => (
                      <TableRow key={inquiry._id}>
                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                        <TableCell>{inquiry.email}</TableCell>
                        <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              inquiry.status === "unread"
                                ? "bg-bhagva-100 text-bhagva-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {inquiry.status === "unread" ? "Unread" : "Read"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleViewInquiry(inquiry)}>
                                  <Eye className="h-4 w-4 mr-2" /> View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Inquiry Details</DialogTitle>
                                </DialogHeader>
                                {selectedInquiry && selectedInquiry._id === inquiry._id && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500">Name</h4>
                                        <p className="mt-1">{selectedInquiry.name}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500">Date</h4>
                                        <p className="mt-1">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                        <p className="mt-1">{selectedInquiry.email}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                                        <p className="mt-1">{selectedInquiry.phone || "Not provided"}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-500">Message</h4>
                                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                                        <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteInquiry(inquiry._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view for inquiries */}
              <div className="md:hidden space-y-3 mt-4">
                {inquiries.map((inquiry) => (
                  <Card key={inquiry._id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{inquiry.name}</h3>
                          <p className="text-sm text-gray-600">{inquiry.email}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            inquiry.status === "unread" ? "bg-bhagva-100 text-bhagva-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {inquiry.status === "unread" ? "Unread" : "Read"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleViewInquiry(inquiry)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Inquiry Details</DialogTitle>
                            </DialogHeader>
                            {selectedInquiry && selectedInquiry._id === inquiry._id && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Name</h4>
                                    <p className="mt-1">{selectedInquiry.name}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                    <p className="mt-1">{selectedInquiry.email}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                                    <p className="mt-1">{selectedInquiry.phone || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Date</h4>
                                    <p className="mt-1">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Message</h4>
                                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                                    <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteInquiry(inquiry._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {inquiries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No inquiries found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
