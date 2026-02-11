import { Skeleton } from "@/components/ui/skeleton"

export default function NoticesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-16" />

      <div className="hidden lg:block">
        <Skeleton className="h-96" />
      </div>

      <div className="lg:hidden space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
