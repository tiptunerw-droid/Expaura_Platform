export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs text-gray-600 font-mono uppercase tracking-widest">Admin</p>
      </div>
    </div>
  );
}
