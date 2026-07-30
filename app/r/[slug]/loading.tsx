export default function RestaurantLoading() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <div className="animate-pulse">
        <div className="h-64 sm:h-80 bg-surface-alt" />
        <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
          <div className="flex items-end gap-6 mb-8">
            <div className="w-28 h-28 rounded-xl bg-gray-800 border-4 border-[#0A0A0A]" />
            <div className="pb-2 space-y-2 flex-1">
              <div className="h-8 w-64 bg-gray-800 rounded" />
              <div className="h-4 w-48 bg-gray-800 rounded" />
              <div className="flex gap-4">
                <div className="h-3 w-20 bg-gray-800 rounded" />
                <div className="h-3 w-24 bg-gray-800 rounded" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-28 bg-gray-800 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-surface-alt rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
