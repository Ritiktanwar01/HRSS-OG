export default function PollsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bhagva-50 to-white py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-lg mx-auto mb-3 w-80 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-lg mx-auto w-96 animate-pulse" />
        </div>

        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse" />
        </div>

        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
