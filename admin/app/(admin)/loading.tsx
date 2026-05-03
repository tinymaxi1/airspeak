export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-24 bg-gray-100 rounded-xl border border-border" />
        <div className="h-24 bg-gray-100 rounded-xl border border-border" />
        <div className="h-24 bg-gray-100 rounded-xl border border-border" />
        <div className="h-24 bg-gray-100 rounded-xl border border-border" />
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 items-center">
        <div className="h-10 bg-gray-100 rounded-lg w-64" />
        <div className="h-10 bg-gray-100 rounded-lg w-32" />
        <div className="ml-auto h-10 bg-gray-100 rounded-lg w-28" />
      </div>

      {/* Table rows */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="h-12 bg-gray-50 border-b border-border" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-border last:border-b-0 px-4 flex items-center gap-3">
            <div className="h-9 w-9 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
            <div className="h-6 bg-gray-100 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
