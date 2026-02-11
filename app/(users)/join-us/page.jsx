"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const membershipFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  fatherOrSpouseName: z.string().min(2, { message: "Father/Spouse name must be at least 2 characters." }),
  address: z.string().min(10, { message: "Please enter a valid address." }),
  mobile: z.string().min(10, { message: "Please enter a valid mobile number." }).max(10),
  email: z.string().email({ message: "Please enter a valid email address." }),
  dateOfBirth: z.string().refine((date) => new Date(date) < new Date(), {
    message: "Date of birth must be in the past.",
  }),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
})

export default function JoinUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      fullName: "",
      fatherOrSpouseName: "",
      address: "",
      mobile: "",
      email: "",
      dateOfBirth: "",
      agreeTerms: false,
    },
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memberships`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
      }

      setSubmitted(true)
      toast({
        title: "Success",
        description: "Your membership form has been submitted successfully!",
      })

      form.reset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to submit your form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bhagva-50 to-bhagva-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-bhagva-200 shadow-lg">
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Successful!</h2>
              <p className="text-gray-600 mb-4">
                Thank you for your membership application. We have received your form.
              </p>
              <div className="bg-bhagva-50 border border-bhagva-200 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-bhagva-900 mb-3">Next Steps:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-bhagva-700 mr-3 font-bold">1.</span>
                    <span>Download and print the membership form from your email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bhagva-700 mr-3 font-bold">2.</span>
                    <span>Pay ₹1,100 registration fee at HRSS headquarters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bhagva-700 mr-3 font-bold">3.</span>
                    <span>Submit the hard copy form at our office</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bhagva-700 mr-3 font-bold">4.</span>
                    <span>Wait for verification and membership confirmation</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                We will contact you shortly at the provided email and phone number.
              </p>
              <Button asChild className="bg-bhagva-700 hover:bg-bhagva-800">
                <a href="/">Go Back Home</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bhagva-50 to-bhagva-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-bhagva-900 mb-4">Join Our Mission</h1>
          <p className="text-lg text-gray-600">
            Become a member of Hindu Rashtra Sevak Sangh and contribute to our social welfare initiatives
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="border-bhagva-200 shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-bhagva-600 to-bhagva-700 text-white rounded-t-lg">
            <CardTitle>Membership Application Form</CardTitle>
            <CardDescription className="text-bhagva-100">
              Please fill in all required fields carefully
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          className="border-gray-300 focus:border-bhagva-500 focus:ring-bhagva-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Father/Spouse Name */}
                <FormField
                  control={form.control}
                  name="fatherOrSpouseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Father/Spouse Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter father's or spouse's name"
                          className="border-gray-300 focus:border-bhagva-500 focus:ring-bhagva-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Date of Birth *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="border-gray-300 focus:border-bhagva-500 focus:ring-bhagva-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Full Address *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your complete address including city, state, and PIN code"
                          className="border-gray-300 focus:border-bhagva-500 focus:ring-bhagva-500 min-h-24 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mobile */}
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Mobile Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          className="border-gray-300 focus:border-bhagva-500 focus:ring-bhagva-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          className="border-gray-300 focus:border-bhagva-500 focus:ring-bhagva-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Terms and Conditions */}
                <div className="space-y-4 mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900">Terms & Conditions</h3>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 ml-2">
                      Please read and accept all the following terms before submitting your application.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="text-bhagva-700 font-bold pt-1">1.</div>
                        <p className="text-gray-700">
                          The applicant shall not have been found guilty of any legal or criminal offences.
                        </p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="text-bhagva-700 font-bold pt-1">2.</div>
                        <p className="text-gray-700">
                          If the information provided by the applicant is found to be incorrect, the organization shall have the right to take action according to Section 420 IPC.
                        </p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="text-bhagva-700 font-bold pt-1">3.</div>
                        <p className="text-gray-700">
                          The applicant must pay ₹1,100 as a membership registration fee to be submitted in hard copy form at HRSS headquarters.
                        </p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="text-bhagva-700 font-bold pt-1">4.</div>
                        <p className="text-gray-700">
                          If any member wishes to resign or leave the organization, they must submit their resignation letter at least 30 days in advance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 rounded-lg border border-bhagva-200 bg-bhagva-50 p-4 mt-6">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="text-gray-900 font-semibold cursor-pointer">
                            I agree to all terms and conditions
                          </FormLabel>
                          <p className="text-sm text-gray-600">
                            By checking this box, you confirm that you have read and agree to all the terms mentioned above.
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-bhagva-700 hover:bg-bhagva-800 text-white py-6 text-lg font-semibold rounded-lg transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Membership Application"
                    )}
                  </Button>
                </div>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Questions? Contact us at{" "}
                  <a href="mailto:info@hrss.org" className="text-bhagva-700 font-semibold hover:underline">
                    info@hrss.org
                  </a>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-bhagva-200">
            <CardHeader>
              <CardTitle className="text-bhagva-700">Registration Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                One-time membership registration fee to be paid at our headquarters.
              </p>
              <div className="text-3xl font-bold text-bhagva-700">₹1,100</div>
              <p className="text-sm text-gray-600 mt-2">Must be paid in cash at HRSS office</p>
            </CardContent>
          </Card>

          <Card className="border-bhagva-200">
            <CardHeader>
              <CardTitle className="text-bhagva-700">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>1. Submit this online form</li>
                <li>2. Download printed form</li>
                <li>3. Pay ₹1,100 at HQ</li>
                <li>4. Submit documents</li>
                <li>5. Receive confirmation</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
