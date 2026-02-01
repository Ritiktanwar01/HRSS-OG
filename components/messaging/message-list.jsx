"use client"

import { useRef, useEffect, useState } from "react"
import { useMessage } from "@/contexts/message-context"
import { useAuth } from "@/hooks/use-auth"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, CheckCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function MessageList() {
  const { messages, activeConversation, loading, loadingMore, hasMoreMessages, loadMoreMessages } = useMessage()
  const { user } = useAuth()
  const messagesEndRef = useRef(null)
  const messagesStartRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const [prevScrollHeight, setPrevScrollHeight] = useState(0)

  // Scroll to bottom on initial load or when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && initialLoad && !loading) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" })
      setInitialLoad(false)
    } else if (messagesEndRef.current && !loading && !loadingMore) {
      // Only auto-scroll if user is already at the bottom
      const container = scrollContainerRef.current
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100

        if (isAtBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }
    }
  }, [messages, loading, initialLoad, loadingMore])

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!messagesStartRef.current || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMessages && !loadingMore) {
          // Save current scroll position
          if (scrollContainerRef.current) {
            setPrevScrollHeight(scrollContainerRef.current.scrollHeight)
          }

          // Load more messages
          loadMoreMessages()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(messagesStartRef.current)

    return () => {
      if (messagesStartRef.current) {
        observer.unobserve(messagesStartRef.current)
      }
    }
  }, [hasMoreMessages, loadingMore, loading, loadMoreMessages])

  // Maintain scroll position when loading older messages
  useEffect(() => {
    if (loadingMore && scrollContainerRef.current && prevScrollHeight > 0) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight
      const scrollDiff = newScrollHeight - prevScrollHeight

      if (scrollDiff > 0) {
        scrollContainerRef.current.scrollTop = scrollDiff
      }
    }
  }, [messages, loadingMore, prevScrollHeight])

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a conversation to start messaging</p>
      </div>
    )
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col h-full overflow-y-auto p-4">
        <div className="flex flex-col space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex mb-4 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full mr-2" />}
              <div className="flex flex-col">
                {i % 2 === 0 && <Skeleton className="h-4 w-24 mb-1" />}
                <Skeleton className={`h-16 w-64 rounded-lg ${i % 2 === 0 ? "rounded-bl-none" : "rounded-br-none"}`} />
                <Skeleton className="h-3 w-16 mt-1 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  // Check if a message is read by all participants
  const isReadByAll = (message) => {
    if (!activeConversation || !message.readBy) return false

    // Get all participants except the sender
    const otherParticipants = activeConversation.participants.filter((p) => p._id !== message.sender._id)

    // Check if all other participants have read the message
    return otherParticipants.every((participant) =>
      message.readBy.some((readInfo) => readInfo.user === participant._id),
    )
  }

  return (
    <div ref={scrollContainerRef} className="flex flex-col h-full overflow-y-auto p-4">
      {/* Loading indicator for older messages */}
      {loadingMore && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center space-x-2">
            <div
              className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}

      {/* Intersection observer target for infinite scrolling */}
      <div ref={messagesStartRef} className="h-1" />

      {Object.keys(groupedMessages).length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                {format(new Date(date), "MMMM d, yyyy")}
              </div>
            </div>

            {dateMessages.map((message, index) => {
              const isCurrentUser = message.sender._id === user?._id
              const showAvatar =
                !isCurrentUser && (index === 0 || dateMessages[index - 1].sender._id !== message.sender._id)

              return (
                <div key={message._id} className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  {!isCurrentUser && showAvatar && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src={message.sender.profilePicture || "/placeholder.svg"} />
                      <AvatarFallback>{message.sender.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[70%] ${!isCurrentUser && !showAvatar ? "ml-10" : ""}`}>
                    {!isCurrentUser && showAvatar && (
                      <div className="flex items-baseline mb-1">
                        <span className="text-sm font-medium mr-2">{message.sender.name}</span>
                        {message.sender.designation && (
                          <span className="text-xs text-muted-foreground">{message.sender.designation}</span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        }`}
                      >
                        {message.content}
                      </div>

                      <div
                        className={`flex items-center mt-1 text-xs text-muted-foreground ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{format(new Date(message.createdAt), "h:mm a")}</span>

                        {isCurrentUser && (
                          <span className="ml-1">
                            {isReadByAll(message) ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
