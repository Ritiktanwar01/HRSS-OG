"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreVertical, UserCog, Mail, UserX } from "lucide-react"

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState(null)
  const [selectedDesignation, setSelectedDesignation] = useState("")
  const { getAuthToken } = useAuth()

  // Fetch members and designations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = getAuthToken()

        // Fetch members
        const membersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/members`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        // Fetch designations
        const designationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/designations`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (membersResponse.ok && designationsResponse.ok) {
          const membersData = await membersResponse.json()
          const designationsData = await designationsResponse.json()

          setMembers(membersData)
          setDesignations(designationsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [getAuthToken])

  // Filter members based on search term
  const filteredMembers = members.filter((member) => {
    if (!searchTerm) return true

    return (
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.designation && member.designation.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  // Open assign designation dialog
  const openAssignDialog = (member) => {
    setCurrentMember(member)
    setSelectedDesignation(member.designation || "")
    setIsAssignDialogOpen(true)
  }

  // Handle assign designation
  const handleAssignDesignation = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/designations/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          userId: currentMember._id,
          designationName: selectedDesignation,
        }),
      })

      if (response.ok) {
        // Update member in state
        setMembers(
          members.map((member) =>
            member._id === currentMember._id ? { ...member, designation: selectedDesignation } : member,
          ),
        )

        setIsAssignDialogOpen(false)
        setCurrentMember(null)
        setSelectedDesignation("")
      }
    } catch (error) {
      console.error("Error assigning designation:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Members</h1>
        <p className="text-muted-foreground">Manage organization members and their designations</p>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No members found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={member.profilePicture || "/placeholder.svg"} />
                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    {member.designation ? (
                      <span className="bg-muted px-2 py-1 rounded-full text-xs">{member.designation}</span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openAssignDialog(member)}>
                          <UserCog className="mr-2 h-4 w-4" />
                          Assign Designation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <UserX className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Assign Designation Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Designation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Member</p>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={currentMember?.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback>{currentMember?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentMember?.name}</p>
                  <p className="text-sm text-muted-foreground">{currentMember?.email}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Designation</p>
              <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {designations.map((designation) => (
                    <SelectItem key={designation._id} value={designation.name}>
                      {designation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAssignDesignation}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
