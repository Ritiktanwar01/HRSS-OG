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
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import Map from "../../../lib/Map"

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
})

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState({
    address: "",
    phone1: "",
    phone2: "",
    email1: "",
    email2: "",
    officeHours: "",
  })
  const [offices, setOffices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  })

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/public`)
        if (response.ok) {
          const data = await response.json()
          setContactInfo(data)
        }
      } catch (error) {
        console.error("Error fetching contact info:", error)
      }
    }

    const fetchOffices = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/offices/public`)
        if (response.ok) {
          const data = await response.json()
          setOffices(data)
        }
      } catch (error) {
        console.error("Error fetching offices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContactInfo()
    fetchOffices()
  }, [])

  async function onSubmit(data) {
    setIsSubmitting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Message Sent",
          description: "Thank you for contacting us. We will get back to you soon.",
        })
        form.reset()
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-bhagva-800 mb-4 text-center">Contact Us</h1>
      <div className="h-1 w-20 bg-bhagva-600 mb-8 mx-auto"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-bhagva-700 mb-4">Get In Touch</h2>
            <p className="text-gray-700 mb-6">
              We'd love to hear from you. Whether you have a question about our initiatives, volunteering, or donations,
              our team is ready to assist you.
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-bhagva-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Address</h3>
                  <p className="text-gray-600">{contactInfo.address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 text-bhagva-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Phone</h3>
                  <p className="text-gray-600">
                    {contactInfo.phone1}
                    {contactInfo.phone2 && (
                      <>
                        <br />
                        {contactInfo.phone2}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-6 w-6 text-bhagva-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">
                    {contactInfo.email1}
                    {contactInfo.email2 && (
                      <>
                        <br />
                        {contactInfo.email2}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-6 w-6 text-bhagva-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Office Hours</h3>
                  <p className="text-gray-600 whitespace-pre-line">{contactInfo.officeHours}</p>
                </div>
              </div>
            </div>
          </div>

          {offices.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-bhagva-700 mb-4">Regional Offices</h2>
              <div className="space-y-3">
                {offices.map((office) => (
                  <div key={office._id}>
                    <h3 className="font-medium text-gray-900">{office.name}</h3>
                    <p className="text-gray-600">
                      {office.address}
                      {office.phone && (
                        <>
                          <br />
                          Phone: {office.phone}
                        </>
                      )}
                      {office.email && (
                        <>
                          <br />
                          Email: {office.email}
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-bhagva-700">Send a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please let us know how we can help..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-bhagva-700 hover:bg-bhagva-800" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-bhagva-700 mb-6 text-center">Find Us</h2>
        <div className="bg-gray-100 h-[400px] w-full rounded-lg shadow-md flex items-center justify-center">
          <Map />
          {/* <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3526.686287682272!2d77.3858726!3d27.880905599999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39733bd5aa89f1f3%3A0x668eb0956dd0709!2sHindu%20Rastra%20Sevak%20Sang%20Charitable%20trust!5e0!3m2!1sen!2sin!4v1747140246156!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}
        </div>
      </div>
    </div>
  )
}
