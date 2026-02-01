"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import io from "socket.io-client"
import { subDays, isAfter } from "date-fns"

const MessageContext = createContext()

// Helper to get cached messages from localStorage
const getCachedMessages = (conversationId) => {
  try {
    const cachedData = localStorage.getItem(`messages_${conversationId}`)
    if (cachedData) {
      const { messages, timestamp } = JSON.parse(cachedData)
      // Check if cache is still valid (less than 1 hour old)
      if (Date.now() - timestamp < 60 * 60 * 1000) {
        return messages
      }
    }
  } catch (error) {
    console.error("Error retrieving cached messages:", error)
  }
  return null
}

// Helper to cache messages in localStorage
const cacheMessages = (conversationId, messages) => {
  try {
    // Only cache messages from the last 5 days
    const fiveDaysAgo = subDays(new Date(), 5)
    const recentMessages = messages.filter((msg) => isAfter(new Date(msg.createdAt), fiveDaysAgo))

    localStorage.setItem(
      `messages_${conversationId}`,
      JSON.stringify({
        messages: recentMessages,
        timestamp: Date.now(),
      }),
    )
  } catch (error) {
    console.error("Error caching messages:", error)
  }
}

export function MessageProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [typingUsers, setTypingUsers] = useState({})
  const { user, getAuthToken } = useAuth()
  const oldestMessageDateRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    if (!user) return

    const token = getAuthToken()
    if (!token) return

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token },
    })

    setSocket(newSocket)

    // Socket event listeners
    newSocket.on("connect", () => {
      console.log("Socket connected")
    })

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    // Clean up on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [user, getAuthToken])

  // Set up message listeners
  useEffect(() => {
    if (!socket) return

    // Handle receiving new messages
    socket.on("message:receive", (message) => {
      setMessages((prevMessages) => {
        // Only add if not already in the list
        if (!prevMessages.some((m) => m._id === message._id)) {
          const newMessages = [...prevMessages, message]

          // Update cache if this is for the active conversation
          if (activeConversation && message.conversationId === activeConversation._id) {
            cacheMessages(message.conversationId, newMessages)
          }

          return newMessages
        }
        return prevMessages
      })

      // Update conversation list if this is for the active conversation
      if (activeConversation && message.conversationId === activeConversation._id) {
        // Mark as read
        socket.emit("message:read", {
          conversationId: message.conversationId,
          messageId: message._id,
        })
      }
    })

    // Handle conversation updates
    socket.on("conversation:update", (updatedConversation) => {
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv._id === updatedConversation._id) {
            return { ...conv, lastMessage: updatedConversation.lastMessage }
          }
          return conv
        })
      })
    })

    // Handle user status changes
    socket.on("user:status", ({ userId, isOnline, lastSeen }) => {
      // Update user status in conversations
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          const updatedParticipants = conv.participants.map((p) => {
            if (p._id === userId) {
              return { ...p, isOnline, lastSeen }
            }
            return p
          })
          return { ...conv, participants: updatedParticipants }
        })
      })

      // Update user status in active conversation
      if (activeConversation) {
        setActiveConversation((prev) => {
          if (!prev) return prev
          const updatedParticipants = prev.participants.map((p) => {
            if (p._id === userId) {
              return { ...p, isOnline, lastSeen }
            }
            return p
          })
          return { ...prev, participants: updatedParticipants }
        })
      }
    })

    // Handle typing status
    socket.on("user:typing", ({ userId, conversationId, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return { ...prev, [conversationId]: [...(prev[conversationId] || []), userId] }
        } else {
          return {
            ...prev,
            [conversationId]: (prev[conversationId] || []).filter((id) => id !== userId),
          }
        }
      })
    })

    // Handle read receipts
    socket.on("message:read", ({ messageId, userId }) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) => {
          if (msg._id === messageId && !msg.readBy.some((r) => r.user === userId)) {
            return {
              ...msg,
              readBy: [...msg.readBy, { user: userId, readAt: new Date() }],
            }
          }
          return msg
        })

        // Update cache if this is for the active conversation
        if (activeConversation) {
          cacheMessages(activeConversation._id, updatedMessages)
        }

        return updatedMessages
      })
    })

    return () => {
      socket.off("message:receive")
      socket.off("conversation:update")
      socket.off("user:status")
      socket.off("user:typing")
      socket.off("message:read")
    }
  }, [socket, activeConversation])

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken])

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (conversationId, useCache = true) => {
      if (!user || !conversationId) return

      try {
        setLoading(true)

        // Try to get cached messages first
        if (useCache) {
          const cachedMessages = getCachedMessages(conversationId)
          if (cachedMessages && cachedMessages.length > 0) {
            setMessages(cachedMessages)
            setLoading(false)

            // Set the oldest message date for pagination
            const oldestMessage = cachedMessages.reduce((oldest, msg) => {
              return new Date(msg.createdAt) < new Date(oldest.createdAt) ? msg : oldest
            }, cachedMessages[0])

            oldestMessageDateRef.current = new Date(oldestMessage.createdAt)

            // Still fetch from server in the background to get any new messages
            fetchMessagesFromServer(conversationId)
            return
          }
        }

        // If no cache or cache is invalid, fetch from server
        await fetchMessagesFromServer(conversationId)
      } catch (error) {
        console.error("Error fetching messages:", error)
        setLoading(false)
      }
    },
    [user, getAuthToken],
  )

  // Helper function to fetch messages from server
  const fetchMessagesFromServer = useCallback(
    async (conversationId, before = null) => {
      try {
        const token = getAuthToken()
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${conversationId}?limit=50`

        if (before) {
          url += `&before=${before.toISOString()}`
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()

          if (before) {
            // Append older messages
            setMessages((prevMessages) => {
              const combinedMessages = [...prevMessages, ...data.messages]
              // Remove duplicates
              const uniqueMessages = Array.from(new Map(combinedMessages.map((msg) => [msg._id, msg])).values())
              return uniqueMessages
            })

            setHasMoreMessages(data.hasMore)
          } else {
            // Replace with new messages
            setMessages(data.messages)

            // Cache the messages
            cacheMessages(conversationId, data.messages)

            setHasMoreMessages(data.hasMore)
          }

          // Update oldest message date if we have messages
          if (data.messages.length > 0) {
            const oldestMessage = data.messages.reduce((oldest, msg) => {
              return new Date(msg.createdAt) < new Date(oldest.createdAt) ? msg : oldest
            }, data.messages[0])

            oldestMessageDateRef.current = new Date(oldestMessage.createdAt)
          }
        }
      } catch (error) {
        console.error("Error fetching messages from server:", error)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [getAuthToken],
  )

  // Load more (older) messages
  const loadMoreMessages = useCallback(() => {
    if (!activeConversation || !hasMoreMessages || loadingMore || !oldestMessageDateRef.current) return

    setLoadingMore(true)
    fetchMessagesFromServer(activeConversation._id, oldestMessageDateRef.current)
  }, [activeConversation, hasMoreMessages, loadingMore, fetchMessagesFromServer])

  // Send a message
  const sendMessage = useCallback(
    (conversationId, content, attachments = []) => {
      if (!socket || !conversationId || !content) return

      socket.emit("message:new", {
        conversationId,
        content,
        attachments,
      })
    },
    [socket],
  )

  // Set typing status
  const setTypingStatus = useCallback(
    (conversationId, isTyping) => {
      if (!socket || !conversationId) return

      socket.emit("user:typing", {
        conversationId,
        isTyping,
      })
    },
    [socket],
  )

  // Create a new conversation
  const createConversation = useCallback(
    async (name, participants, isGroup = false) => {
      if (!user) return

      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            participants,
            isGroup,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setConversations((prev) => [data, ...prev])
          return data
        }
      } catch (error) {
        console.error("Error creating conversation:", error)
      }
    },
    [user, getAuthToken],
  )

  // Set active conversation
  const setActiveConversationById = useCallback(
    (conversationId) => {
      const conversation = conversations.find((c) => c._id === conversationId)
      if (conversation) {
        setActiveConversation(conversation)
        // Reset message state
        setMessages([])
        setHasMoreMessages(true)
        oldestMessageDateRef.current = null
        // Fetch messages with cache
        fetchMessages(conversationId, true)
      }
    },
    [conversations, fetchMessages],
  )

  // Clear message cache for testing
  const clearMessageCache = useCallback((conversationId = null) => {
    try {
      if (conversationId) {
        localStorage.removeItem(`messages_${conversationId}`)
      } else {
        // Clear all message caches
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key.startsWith("messages_")) {
            localStorage.removeItem(key)
          }
        }
      }
    } catch (error) {
      console.error("Error clearing message cache:", error)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user, fetchConversations])

  const value = {
    conversations,
    activeConversation,
    messages,
    loading,
    loadingMore,
    hasMoreMessages,
    typingUsers,
    fetchConversations,
    fetchMessages,
    loadMoreMessages,
    sendMessage,
    setTypingStatus,
    createConversation,
    setActiveConversationById,
    setActiveConversation,
    clearMessageCache,
  }

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
}

export function useMessage() {
  return useContext(MessageContext)
}
