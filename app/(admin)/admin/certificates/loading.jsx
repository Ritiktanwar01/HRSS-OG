import { Skeleton } from "@/components/ui/skeleton"

export default function CertificatesLoading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4">
          <div className="grid grid-cols-5 gap-4 mb-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>

          {[...Array(5)].map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 py-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
