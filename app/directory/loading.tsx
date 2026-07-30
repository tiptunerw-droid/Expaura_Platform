import { SiteHeader } from "@/components/site/header";

export default function DirectoryLoading() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <SiteHeader />
      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-gray-800 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-alt border border-border-subtle rounded-lg p-6 space-y-3">
                <div className="h-4 w-24 bg-gray-800 rounded" />
                <div className="h-3 w-16 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
          <div className="h-8 w-64 bg-gray-800 rounded mt-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface-alt border border-border-subtle rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-800 rounded" />
                  <div className="h-3 w-1/2 bg-gray-800 rounded" />
                  <div className="h-3 w-1/3 bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
