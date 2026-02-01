"use client"

import { useState, useEffect } from "react"
import { useMessage } from "@/contexts/message-context"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NewConversationForm({ onSuccess }) {
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { createConversation, setActiveConversation } = useMessage()
  const { getAuthToken, user } = useAuth()

  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/members`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Filter out current user
          setAvailableUsers(data.filter((u) => u._id !== user?._id))
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [getAuthToken, user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedUsers.length === 0) {
      return
    }

    if (isGroup && !groupName) {
      return
    }

    try {
      setLoading(true)
      const userIds = selectedUsers.map((u) => u._id)
      const name = isGroup ? groupName : ""

      const conversation = await createConversation(name, userIds, isGroup)

      if (conversation) {
        setActiveConversation(conversation)
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserSelection = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id))
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="isGroup" checked={isGroup} onCheckedChange={setIsGroup} />
        <Label htmlFor="isGroup">Create group conversation</Label>
      </div>

      {isGroup && (
        <div className="space-y-2">
          <Label htmlFor="groupName">Group Name</Label>
          <Input
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            required={isGroup}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Select {isGroup ? "Members" : "Recipient"}</Label>
        <ScrollArea className="h-60 border rounded-md p-2">
          {loading ? (
            <div className="flex justify-center p-4">
              <p>Loading users...</p>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="flex justify-center p-4">
              <p>No users available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                  onClick={() => toggleUserSelection(user)}
                >
                  <Checkbox
                    checked={selectedUsers.some((u) => u._id === user._id)}
                    onCheckedChange={() => toggleUserSelection(user)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    {user.designation && <p className="text-xs text-muted-foreground">{user.designation}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || selectedUsers.length === 0 || (isGroup && !groupName)}>
          {loading ? "Creating..." : "Create Conversation"}
        </Button>
      </div>
    </form>
  )
}
