"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/super-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0A0A0A] text-[#F3F3F3] font-sans selection:bg-purple-600 selection:text-white">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-16 flex items-center justify-between">
            <span className="text-xl font-bold tracking-tighter uppercase border-b-2 border-white pb-1">
              Expaura
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 bg-purple-500/10 px-3 py-1 border border-purple-500/20">
              System Access
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter leading-none mb-4 uppercase">
            Admin<br/><span className="text-purple-600">Control.</span>
          </h1>
          <p className="text-lg text-gray-400 mb-12 max-w-sm">
            Access the core platform administration and global analytics engine.
          </p>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@expaura.rw"
                className="w-full bg-transparent border-b-2 border-gray-800 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-purple-600 transition-colors text-lg"
              />
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-transparent border-b-2 border-gray-800 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-purple-600 transition-colors text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 hover:bg-purple-600 hover:text-white transition-all duration-300 disabled:opacity-50 mt-4"
            >
              {loading ? "Authenticating..." : "Authorize"}
            </button>
          </form>

          <div className="mt-12 text-sm text-gray-500 font-medium">
            System uninitialized?{" "}
            <Link href="/admin/register" className="text-white hover:text-purple-500 transition-colors underline decoration-2 underline-offset-4">
              Bootstrap Core
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-[#111]">
        <div className="absolute inset-0 bg-black/60 z-10 mix-blend-multiply" />
        <img 
          src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1974&auto=format&fit=crop" 
          alt="Server Architecture" 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-50"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-end justify-between p-12 mix-blend-difference pointer-events-none">
          <p className="text-right text-xs font-mono text-purple-400 tracking-[0.3em] uppercase">
            {/* // Expaura_OS_v1.0 */}<br/>{/* // Central_Command */}
          </p>
          <div className="text-right">
            <p className="text-[10rem] font-black uppercase tracking-tighter text-white leading-[0.8] opacity-90">
              SYS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
