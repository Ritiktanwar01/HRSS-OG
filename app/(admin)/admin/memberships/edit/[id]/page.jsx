"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

// schema for admin edit
const schema = z.object({
  full_name: z.string().min(2),
  father_or_spouse_name: z.string().min(2),
  address: z.string().min(10),
  mobile: z.string().min(10).max(14),
  email: z.string().email(),
  date_of_birth: z.string(),
  fee_paid: z.boolean(),
  status: z.enum(["pending", "accepted", "rejected"]),
  remark: z.string().optional(),
})

export default function EditMembershipPage({ params }) {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/membership-applications/list/`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("fetch fail")
        const list = await res.json()
    console.log("Membership list:", list)
        const app = list.find((m) => String(m.id) === id)
        if (app) {
          form.reset({
            full_name: app.full_name,
            father_or_spouse_name: app.father_or_spouse_name,
            address: app.address,
            mobile: app.mobile,
            email: app.email,
            date_of_birth: app.date_of_birth,
            fee_paid: app.fee_paid,
            status: app.status,
            remark: app.remark || "",
          })
        }
      } catch (e) {
        console.error(e)
        toast({ title: "Error", description: "Unable to load application", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/membership-applications/${id}/`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Updated", description: "Membership updated" })
      router.push("/admin/memberships")
    } catch (e) {
      toast({ title: "Error", description: "Update failed", variant: "destructive" })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Membership</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input {...form.register("full_name")} placeholder="Full name" />
        <Input {...form.register("father_or_spouse_name")} placeholder="Father/Spouse name" />
        <Input {...form.register("date_of_birth")} type="date" />
        <Input {...form.register("email")} placeholder="Email" />
        <Input {...form.register("mobile")} placeholder="Mobile" />
        <Input {...form.register("address")} placeholder="Address" />
        <div className="flex gap-2">
          <Select value={form.watch("status") || "pending"} onValueChange={(v) => form.setValue("status", v)}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.watch("fee_paid") ? "paid" : "not"} onValueChange={(v) => form.setValue("fee_paid", v === "paid")}>
            <SelectTrigger><SelectValue placeholder="Fee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="not">Not paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-sm font-medium">Remark</p>
          <textarea
            className="w-full border rounded px-2 py-1"
            rows={3}
            {...form.register("remark")}
          />
        </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}
