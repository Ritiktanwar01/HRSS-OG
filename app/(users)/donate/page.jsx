"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Heart, CheckCircle2 } from "lucide-react"

const donationFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid amount.",
  }),
  donationType: z.enum(["oneTime", "monthly"]),
  message: z.string().optional(),
})

export default function DonatePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState(null)

  const form = useForm({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      amount: "",
      donationType: "oneTime",
      message: "",
    },
  })

  const predefinedAmounts = [500, 1000, 2500, 5000]

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount)
    form.setValue("amount", amount.toString())
  }

  async function onSubmit(data) {
    setIsSubmitting(true)
    try {
      // In a real application, this would call your payment gateway API
      // For demo purposes, we'll simulate a successful payment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsSuccess(true)
      toast({
        title: "Donation Successful",
        description: "Thank you for your generous contribution!",
      })
    } catch (error) {
      console.error("Error processing donation:", error)
      toast({
        title: "Error",
        description: "Failed to process your donation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-bhagva-800 mb-4 text-center">Support Our Cause</h1>
      <div className="h-1 w-20 bg-bhagva-600 mb-8 mx-auto"></div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-bhagva-700 mb-4">Make a Difference</h2>
            <p className="text-gray-700 mb-6">
              Your contribution helps us continue our mission of service to society and preservation of cultural
              heritage. Every donation, big or small, makes a significant impact on our initiatives.
            </p>

            <div className="space-y-6">
              <div className="bg-bhagva-50 p-4 rounded-lg">
                <h3 className="font-medium text-bhagva-800 mb-2">Where Your Money Goes</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-bhagva-600 mr-2">•</span>
                    <span>Medical camps for underprivileged communities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bhagva-600 mr-2">•</span>
                    <span>Educational support for deserving students</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bhagva-600 mr-2">•</span>
                    <span>Food distribution programs for the needy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bhagva-600 mr-2">•</span>
                    <span>Cultural preservation and awareness initiatives</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-bhagva-800 mb-2">Tax Benefits</h3>
                <p className="text-gray-700">
                  All donations are eligible for tax exemption under Section 80G of the Income Tax Act. You will receive
                  a receipt for your contribution.
                </p>
              </div>
            </div>
          </div>

          <div>
            {isSuccess ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-semibold">Thank You!</h2>
                    <p className="text-gray-700">
                      Your donation has been successfully processed. A confirmation has been sent to your email address.
                    </p>
                    <Button
                      className="mt-4 bg-bhagva-700 hover:bg-bhagva-800"
                      onClick={() => {
                        setIsSuccess(false)
                        form.reset()
                        setSelectedAmount(null)
                      }}
                    >
                      Make Another Donation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-bhagva-700">Donation Form</CardTitle>
                  <CardDescription>Fill out the form below to make your contribution</CardDescription>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>

                      <FormField
                        control={form.control}
                        name="donationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Donation Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="oneTime" />
                                  </FormControl>
                                  <FormLabel className="font-normal">One-time</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="monthly" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Monthly</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <div className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                {predefinedAmounts.map((amount) => (
                                  <Button
                                    key={amount}
                                    type="button"
                                    variant={selectedAmount === amount ? "default" : "outline"}
                                    className={
                                      selectedAmount === amount
                                        ? "bg-bhagva-700 hover:bg-bhagva-800"
                                        : "border-bhagva-200 text-bhagva-700"
                                    }
                                    onClick={() => handleAmountSelect(amount)}
                                  >
                                    ₹{amount}
                                  </Button>
                                ))}
                                <Button
                                  type="button"
                                  variant={selectedAmount === "other" ? "default" : "outline"}
                                  className={
                                    selectedAmount === "other"
                                      ? "bg-bhagva-700 hover:bg-bhagva-800"
                                      : "border-bhagva-200 text-bhagva-700"
                                  }
                                  onClick={() => {
                                    setSelectedAmount("other")
                                    form.setValue("amount", "")
                                  }}
                                >
                                  Other
                                </Button>
                              </div>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter amount"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    if (e.target.value) {
                                      const value = Number.parseInt(e.target.value)
                                      if (predefinedAmounts.includes(value)) {
                                        setSelectedAmount(value)
                                      } else {
                                        setSelectedAmount("other")
                                      }
                                    }
                                  }}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share why you're supporting our cause..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-bhagva-700 hover:bg-bhagva-800"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Processing..."
                        ) : (
                          <>
                            <Heart className="mr-2 h-4 w-4" /> Donate Now
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
