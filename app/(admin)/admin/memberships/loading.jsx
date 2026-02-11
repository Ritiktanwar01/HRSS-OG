import { Skeleton } from "@/components/ui/skeleton"

export default function MembershipsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <Skeleton className="h-16" />

      <div className="hidden lg:block">
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}
