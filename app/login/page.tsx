"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SharedLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(data.redirectUrl || "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0A0A0A] text-[#F3F3F3] font-sans selection:bg-[#4F46E5] selection:text-white">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-16">
            <span className="text-xl font-bold tracking-tighter uppercase border-b-2 border-white pb-1">
              Expaura
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter leading-none mb-4 uppercase">
            Normal is<br/><span className="text-[#4F46E5]">Boring.</span>
          </h1>
          <p className="text-lg text-gray-400 mb-12 max-w-sm">
            Sign in to access your restaurant dashboard and elevate your customer experience.
          </p>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@restaurant.rw"
                className="w-full bg-transparent border-b-2 border-gray-800 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-[#4F46E5] transition-colors text-lg"
              />
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-wider">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-transparent border-b-2 border-gray-800 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-[#4F46E5] transition-colors text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 hover:bg-[#4F46E5] hover:text-white transition-all duration-300 disabled:opacity-50 mt-4"
            >
              {loading ? "Signing in..." : "Enter"}
            </button>
          </form>

          <div className="mt-12 text-sm text-gray-500 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white hover:text-[#4F46E5] transition-colors underline decoration-2 underline-offset-4">
              Register Restaurant
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop" 
          alt="Restaurant in Kigali" 
          className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
        />
        <div className="absolute bottom-12 right-12 z-20 text-right mix-blend-difference">
          <p className="text-5xl font-black uppercase tracking-tighter text-white opacity-80 leading-none">
            Kigali
          </p>
          <p className="text-xl font-bold tracking-widest text-white opacity-60 uppercase mt-2">
            Rwanda
          </p>
        </div>
      </div>
    </div>
  );
}
