"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SuperAdminRegisterPage() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/super-admin/register")
      .then((res) => res.json())
      .then((data) => setIsAvailable(data.isRegistrationAvailable))
      .catch(() => setIsAvailable(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/super-admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("CORE INITIALIZED. REDIRECTING...");
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SYSTEM FAULT");
    } finally {
      setLoading(false);
    }
  };

  if (isAvailable === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F3F3F3] flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Booting Core...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-[#0A0A0A] text-[#F3F3F3] font-sans selection:bg-purple-600 selection:text-white">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-16 flex items-center justify-between">
            <span className="text-xl font-bold tracking-tighter uppercase border-b-2 border-white pb-1">
              Expaura
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-500/10 px-3 py-1 border border-red-500/20">
              Root Access
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-4 uppercase">
            Initialize<br/><span className="text-purple-600">Core.</span>
          </h1>
          <p className="text-lg text-gray-400 mb-12 max-w-sm">
            Bootstrap the primary system administrator account.
          </p>

          {!isAvailable ? (
            <div className="border border-red-500/20 bg-red-500/5 p-8 text-center space-y-6">
              <div className="text-4xl">🔒</div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-widest text-red-500 mb-2">Registration Locked</h3>
                <p className="text-sm text-gray-400">
                  The primary system administrator has already been initialized.
                </p>
              </div>
              <Link
                href="/admin/login"
                className="inline-block w-full bg-white text-black font-bold uppercase tracking-widest py-4 hover:bg-red-600 hover:text-white transition-all duration-300"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 text-sm font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-purple-500/10 border-l-4 border-purple-500 text-purple-400 px-4 py-3 text-sm font-medium">
                  {success}
                </div>
              )}

              <div className="space-y-2 group">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                  System Admin Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Root User"
                  className="w-full bg-transparent border-b-2 border-gray-800 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-purple-600 transition-colors text-lg"
                />
              </div>

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
                  minLength={8}
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
                {loading ? "Bootstrapping..." : "Initialize System"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-[#111]">
        <div className="absolute inset-0 bg-purple-900/20 mix-blend-color z-10" />
        <img 
          src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1934&auto=format&fit=crop" 
          alt="Server Hardware" 
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-40"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none mix-blend-difference">
          <p className="text-[12rem] font-black uppercase tracking-tighter text-white opacity-90 leading-none">
            01
          </p>
        </div>
      </div>
    </div>
  );
}
