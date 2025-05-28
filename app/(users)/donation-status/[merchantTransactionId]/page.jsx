"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Home, RefreshCw, Heart, Download } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"

export default function DonationStatusPage({params}) {
  const { merchantTransactionId } = useParams(params)
  const router = useRouter()
  const [status, setStatus] = useState("loading") // loading, success, failed, error
  const [donation, setDonation] = useState(null)
  const [error, setError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)


  // Function to trigger confetti for successful payments
  const triggerConfetti = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#FF9933", "#FFFFFF", "#138808"], // Indian flag colors
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#FF9933", "#FFFFFF", "#138808"], // Indian flag colors
      })
    }, 250)

    return () => clearInterval(interval)
  }

  // Function to check payment status
  const checkPaymentStatus = async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true)

    try {
      const txnId =  merchantTransactionId

      if (!txnId) {
        setStatus("error")
        setError("Transaction ID not found in URL")
        return
      }

      console.log("Checking payment status for transaction:", txnId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/donations/status/${txnId}`)
      const data = await response.json()

      console.log("Payment status response:", data)

      if (data.success) {
        setDonation(data.donation)
        setStatus(data.donation.status)

        // Trigger confetti for successful payments
        if (data.donation.status === "success") {
          setTimeout(triggerConfetti, 500)
        }
      } else {
        setStatus("error")
        setError(data.message || "Failed to verify payment status")
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
      setStatus("error")
      setError("Failed to verify payment status. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Function to download receipt
  const downloadReceipt = () => {
    if (!donation) return

    const receiptContent = `
DONATION RECEIPT
================

Transaction ID: ${donation.transactionId}
Donor Name: ${donation.name}
Email: ${donation.email}
Phone: ${donation.phone}
Amount: ₹${donation.amount}
Donation Type: ${donation.donationType === "oneTime" ? "One-time" : "Monthly"}
Date: ${new Date(donation.createdAt).toLocaleDateString("en-IN")}
Status: ${donation.status.toUpperCase()}

Thank you for your generous contribution!

This receipt is eligible for tax exemption under Section 80G of the Income Tax Act.

For any queries, please contact us at support@hrssog.org
    `.trim()

    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `donation-receipt-${donation.transactionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  

  // Render loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-bhagva-100 shadow-lg">
          <CardContent className="pt-10 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-bhagva-50 p-4">
                <Loader2 className="h-16 w-16 text-bhagva-600 animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-bhagva-800 mb-4">Verifying Payment</h1>
            <div className="h-1 w-16 bg-bhagva-500 mx-auto mb-6"></div>
            <p className="text-gray-600 mb-4">Please wait while we verify your payment status...</p>
            <div className="text-sm text-gray-500">This may take a few moments</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render success state
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-bhagva-100 shadow-lg">
          <CardContent className="pt-10 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-50 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-bhagva-800 mb-4">Payment Successful!</h1>
            <div className="h-1 w-16 bg-bhagva-500 mx-auto mb-6"></div>

            <p className="text-gray-700 mb-6">
              Thank you for your generous donation! Your contribution will help us make a significant impact in our
              community.
            </p>

            {donation && (
              <div className="bg-bhagva-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-bhagva-800 mb-3">Donation Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{donation.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs">{donation.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(donation.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span>{donation.donationType === "oneTime" ? "One-time" : "Monthly"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>You will receive a confirmation email with your donation details</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>A receipt for tax exemption will be sent to your email address</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Your contribution will be put to work immediately</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={downloadReceipt} className="bg-bhagva-700 hover:bg-bhagva-800">
                <Download className="mr-2 h-4 w-4" /> Download Receipt
              </Button>
              <Button asChild variant="outline" className="border-bhagva-200 text-bhagva-700">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> Return Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render failed state
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-bhagva-100 shadow-lg">
          <CardContent className="pt-10 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-50 p-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-bhagva-800 mb-4">Payment Failed</h1>
            <div className="h-1 w-16 bg-bhagva-500 mx-auto mb-6"></div>

            <p className="text-gray-700 mb-6">
              We're sorry, but your donation payment could not be processed. This could be due to various reasons such
              as insufficient funds, network issues, or bank restrictions.
            </p>

            {donation && (
              <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-red-800 mb-3">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{donation.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs">{donation.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-red-600 font-medium">Failed</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-yellow-800 mb-2">What you can do:</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span>Check your payment details and try again</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span>Try a different payment method</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span>Contact your bank if the issue persists</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span>Refresh to check payment status again</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-bhagva-700 hover:bg-bhagva-800">
                <Link href="/donate">
                  <Heart className="mr-2 h-4 w-4" /> Try Again
                </Link>
              </Button>
              <Button
                onClick={() => checkPaymentStatus()}
                variant="outline"
                className="border-bhagva-200 text-bhagva-700"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh Status
              </Button>
              <Button asChild variant="outline" className="border-gray-200 text-gray-700">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> Return Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-bhagva-100 shadow-lg">
        <CardContent className="pt-10 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-50 p-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-bhagva-800 mb-4">Verification Error</h1>
          <div className="h-1 w-16 bg-bhagva-500 mx-auto mb-6"></div>

          <p className="text-gray-700 mb-4">We encountered an error while verifying your payment status.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 mb-6 text-sm">{error}</div>
          )}

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-blue-800 mb-2">What to do:</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Try refreshing the page to check status again</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>If payment was deducted, contact us with your transaction details</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Check your bank statement for any deductions</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => checkPaymentStatus()}
              className="bg-bhagva-700 hover:bg-bhagva-800"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Try Again
            </Button>
            <Button asChild variant="outline" className="border-bhagva-200 text-bhagva-700">
              <Link href="/donate">
                <Heart className="mr-2 h-4 w-4" /> Make New Donation
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gray-200 text-gray-700">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Return Home
              </Link>
            </Button>
          </div>

          <div className="text-center mt-6 text-gray-500 text-sm">
            Need help? Contact us at{" "}
            <a href="mailto:support@hrssog.org" className="text-bhagva-600 hover:underline">
              support@hrssog.org
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
