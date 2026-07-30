export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-border-subtle border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs text-text-tertiary font-mono uppercase tracking-widest">Dashboard</p>
      </div>
    </div>
  );
}
