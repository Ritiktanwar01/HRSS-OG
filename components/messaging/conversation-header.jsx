"use client"

import { useMessage } from "@/contexts/message-context"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Info, MoreVertical, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ConversationHeader() {
  const { activeConversation, typingUsers } = useMessage()

  if (!activeConversation) return null

  // Get the other participant in a direct message
  const getOtherParticipant = () => {
    if (activeConversation.isGroup) return null
    return activeConversation.participants.find((p) => p._id !== activeConversation.user?._id)
  }

  const otherParticipant = getOtherParticipant()
  const isTyping = typingUsers[activeConversation._id]?.length > 0

  // Format last seen time
  const formatLastSeen = (user) => {
    if (user.isOnline) return "Online"
    if (!user.lastSeen) return "Offline"
    return `Last seen ${formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}`
  }

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          {activeConversation.isGroup ? (
            <>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {activeConversation.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src={otherParticipant?.profilePicture || "/placeholder.svg"} />
              <AvatarFallback>{otherParticipant?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </>
          )}
        </Avatar>

        <div>
          <div className="flex items-center">
            <h3 className="font-medium">
              {activeConversation.isGroup ? activeConversation.name : otherParticipant?.name}
            </h3>

            {!activeConversation.isGroup && otherParticipant?.designation && (
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{otherParticipant.designation}</span>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {activeConversation.isGroup ? (
              <span className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {activeConversation.participants.length} members
              </span>
            ) : isTyping ? (
              <span className="text-primary">Typing...</span>
            ) : (
              formatLastSeen(otherParticipant)
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Info className="h-5 w-5" />
          <span className="sr-only">Conversation Info</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {activeConversation.isGroup && <DropdownMenuItem>Add members</DropdownMenuItem>}
            <DropdownMenuItem>Clear chat</DropdownMenuItem>
            {activeConversation.isGroup && (
              <DropdownMenuItem className="text-destructive">Leave group</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
