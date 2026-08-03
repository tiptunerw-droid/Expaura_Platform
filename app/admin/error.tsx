"use client";

import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-surface text-text-primary flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-14 h-14 bg-red-500/10 flex items-center justify-center rounded-full mx-auto">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tighter">Admin panel unavailable</h1>
          <p className="text-sm text-text-tertiary font-bold uppercase tracking-widest">
            {error.digest ? `Reference ${error.digest}` : "We couldn't load your data. Please try again."}
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-10 px-6 rounded text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
