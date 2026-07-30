import { SiteHeader } from "@/components/site/header";

export default function CityDirectoryLoading() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <SiteHeader />
      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-800 rounded" />
          <div className="flex gap-4 pb-4 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-800 rounded-full flex-shrink-0" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="hidden lg:block space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-800 rounded" />
              ))}
            </div>
            <div className="lg:col-span-3 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface-alt border border-border-subtle rounded-lg overflow-hidden flex">
                  <div className="w-48 h-36 bg-gray-800 flex-shrink-0" />
                  <div className="p-4 flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-gray-800 rounded" />
                    <div className="h-3 w-1/2 bg-gray-800 rounded" />
                    <div className="h-3 w-1/4 bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
