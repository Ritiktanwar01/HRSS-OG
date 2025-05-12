import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns"

// Format date for message timestamps
export function formatMessageDate(date) {
  const messageDate = new Date(date)

  if (isToday(messageDate)) {
    return format(messageDate, "h:mm a")
  } else if (isYesterday(messageDate)) {
    return "Yesterday"
  } else if (isThisWeek(messageDate)) {
    return format(messageDate, "EEEE") // Day name
  } else if (isThisYear(messageDate)) {
    return format(messageDate, "MMM d") // Month and day
  } else {
    return format(messageDate, "MMM d, yyyy") // Full date
  }
}

// Format last seen time
export function formatLastSeen(date) {
  if (!date) return "Never"

  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Format conversation time
export function formatConversationTime(date) {
  const conversationDate = new Date(date)

  if (isToday(conversationDate)) {
    return format(conversationDate, "h:mm a")
  } else if (isYesterday(conversationDate)) {
    return "Yesterday"
  } else if (isThisWeek(conversationDate)) {
    return format(conversationDate, "EEEE") // Day name
  } else {
    return format(conversationDate, "MM/dd/yyyy") // Short date
  }
}
