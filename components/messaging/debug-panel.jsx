"use client"

import { useState } from "react"
import { useMessage } from "@/contexts/message-context"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function DebugPanel() {
  const [open, setOpen] = useState(false)
  const { activeConversation, clearMessageCache } = useMessage()

  const handleClearCache = () => {
    if (activeConversation) {
      clearMessageCache(activeConversation._id)
      alert(`Cache cleared for conversation: ${activeConversation._id}`)
    } else {
      clearMessageCache()
      alert("All message caches cleared")
    }
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
          Debug Tools {open ? "▲" : "▼"}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-2 space-y-2">
        <div className="text-xs text-muted-foreground">
          <p>Active Conversation: {activeConversation?._id || "None"}</p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleClearCache}>
          Clear Message Cache
        </Button>
      </CollapsibleContent>
    </Collapsible>
  )
}
