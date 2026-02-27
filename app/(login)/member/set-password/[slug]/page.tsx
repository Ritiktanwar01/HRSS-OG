"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

const passwordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirm: z.string().min(1, { message: "Please confirm password" }),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SetPasswordPage() {
  const { slug } =useParams()
  const router = useRouter()
  const [valid, setValid] = useState(null) // null = checking, true/false afterwards

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirm: "" },
  })

  const verify = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/password-slug/verify/${slug}/`)
        const data = await res.json()
        console.log("Slug verification response:", res)
        if (res.ok && data.valid) {
          setValid(true)
        } else {
          setValid(false)
          toast({ title: "Link invalid", description: data.message || "The link is not valid or has expired", variant: "destructive" })
        }
      } catch (err) {
        console.error(err)
        setValid(false)
        toast({ title: "Error", description: "Failed to verify link", variant: "destructive" })
      }
    }

  useEffect(() => {
    verify()
  }, [slug])

  const onSubmit = async (vals: PasswordFormValues) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/password-slug/set/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password: vals.password }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: "Success", description: "Password set successfully" })
        // redirect to login page
        router.push(`/member/login`)
      } else {
        toast({ title: "Error", description: data.message || "Could not set password", variant: "destructive" })
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Network error", variant: "destructive" })
    }
  }

  if (valid === null) {
    return <div className="min-h-screen flex items-center justify-center">Checking link...</div>
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">This link is invalid or has expired.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Set Your Password</CardTitle>
          <CardDescription className="text-center">
            Please choose a password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-bhagva-700 hover:bg-bhagva-800">
                Set Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
