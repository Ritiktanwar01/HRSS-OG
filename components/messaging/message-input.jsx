"use client"

import { useState, useRef, useEffect } from "react"
import { useMessage } from "@/contexts/message-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send } from "lucide-react"

export function MessageInput() {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const { activeConversation, sendMessage, setTypingStatus } = useMessage()
  const typingTimeoutRef = useRef(null)
  const textareaRef = useRef(null)

  // Handle typing status
  useEffect(() => {
    if (!activeConversation) return

    if (message && !isTyping) {
      setIsTyping(true)
      setTypingStatus(activeConversation._id, true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing status after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      setTypingStatus(activeConversation._id, false)
    }, 2000)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTyping) {
        setTypingStatus(activeConversation._id, false)
      }
    }
  }, [message, isTyping, activeConversation, setTypingStatus])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!message.trim() || !activeConversation) return

    sendMessage(activeConversation._id, message.trim())
    setMessage("")

    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleKeyDown = (e) => {
    // Send message on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!activeConversation) return null

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex items-end gap-2">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-10 resize-none"
          rows={1}
        />

        <Button type="submit" size="icon" disabled={!message.trim()} className="h-8 w-8 flex-shrink-0">
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  )
}
