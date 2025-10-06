import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function PlanExpiredBanner() {
  return (
    <Alert variant="destructive" role="alert" aria-live="polite">
      <AlertTitle>Your plan has expired</AlertTitle>
      <AlertDescription>Renew now by selecting one of the hosting plans below.</AlertDescription>
    </Alert>
  )
}
