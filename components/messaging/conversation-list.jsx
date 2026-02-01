"use client"

import { useState } from "react"
import { useMessage } from "@/contexts/message-context"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { NewConversationForm } from "./new-conversation-form"

export function ConversationList() {
  const { conversations, activeConversation, setActiveConversationById, loading } = useMessage()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true

    // Search in conversation name
    if (conv.name.toLowerCase().includes(searchTerm.toLowerCase())) return true

    // Search in participant names
    return conv.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  // Get the other participant in a direct message
  const getOtherParticipant = (conversation) => {
    if (conversation.isGroup) return null
    return conversation.participants.find((p) => p._id !== (activeConversation?.user?._id || ""))
  }

  // Format the last message preview
  const formatLastMessagePreview = (message) => {
    if (!message) return "No messages yet"
    if (message.content.length > 30) {
      return message.content.substring(0, 30) + "..."
    }
    return message.content
  }

  // Format the last message time
  const formatLastMessageTime = (message) => {
    if (!message || !message.createdAt) return ""
    return formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
  }

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="h-5 w-5" />
                <span className="sr-only">New Conversation</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
              </DialogHeader>
              <NewConversationForm onSuccess={() => setIsNewConversationOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="font-medium">No conversations yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start a new conversation to connect with members</p>
            <Button onClick={() => setIsNewConversationOpen(true)}>Start a conversation</Button>
          </div>
        ) : (
          <ul className="divide-y">
            {filteredConversations.map((conversation) => {
              const isActive = activeConversation?._id === conversation._id
              const otherParticipant = getOtherParticipant(conversation)

              return (
                <li
                  key={conversation._id}
                  className={`hover:bg-muted/50 cursor-pointer ${isActive ? "bg-muted" : ""}`}
                  onClick={() => setActiveConversationById(conversation._id)}
                >
                  <div className="flex items-start p-4">
                    <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                      {conversation.isGroup ? (
                        <>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {conversation.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={otherParticipant?.profilePicture || "/placeholder.svg"} />
                          <AvatarFallback>{otherParticipant?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </>
                      )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">
                          {conversation.isGroup ? conversation.name : otherParticipant?.name}
                        </h3>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {formatLastMessageTime(conversation.lastMessage)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {formatLastMessagePreview(conversation.lastMessage)}
                        </p>

                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 flex-shrink-0">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {conversation.isGroup && (
                        <div className="flex items-center mt-1">
                          <Users className="h-3 w-3 text-muted-foreground mr-1" />
                          <span className="text-xs text-muted-foreground">
                            {conversation.participants.length} members
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
