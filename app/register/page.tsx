"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const RWANDAN_CITIES = [
  "Kigali", "Butare", "Gisenyi", "Musanze", "Ruhengeri",
  "Muhanga", "Nyagatare", "Rusizi", "Nyamata", "Rwamagana",
  "Kibuye", "Cyangugu", "Nyanza", "Kibungo", "Ruhango",
];

export default function RestaurantOwnerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    restaurantName: "",
    cityName: "Kigali",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && form.name && form.email && form.password && form.restaurantName;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-surface text-text-primary font-sans selection:bg-emerald-500 selection:text-white">
      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10 overflow-y-auto max-h-screen">
        <div className="max-w-md w-full mx-auto pb-12">
          <div className="mb-12 mt-8 lg:mt-0">
            <span className="text-xl font-bold tracking-tighter uppercase border-b-2 border-emerald-500 pb-1">
              Expaura
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-4 uppercase">
            Start<br/><span className="text-emerald-500">Different.</span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-sm">
            Register your restaurant to digitize your menu and track customer experiences.
          </p>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500/80 mb-2">
                01. Owner Details
              </h3>
              
              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Paul"
                  className="w-full bg-transparent border-b-2 border-border-subtle py-2 text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                />
              </div>

              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="owner@restaurant.rw"
                  className="w-full bg-transparent border-b-2 border-border-subtle py-2 text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                />
              </div>

              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b-2 border-border-subtle py-2 text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500/80 mb-2">
                02. Restaurant Details
              </h3>
              
              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  value={form.restaurantName}
                  onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                  placeholder="Cafe Kigali"
                  className="w-full bg-transparent border-b-2 border-border-subtle py-2 text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                    City
                  </label>
                  <select
                    required
                    value={form.cityName}
                    onChange={(e) => setForm({ ...form, cityName: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-border-subtle py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors text-lg appearance-none rounded-none"
                  >
                    {RWANDAN_CITIES.map((city) => (
                      <option key={city} value={city} className="bg-[#111]">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+250 788"
                    className="w-full bg-transparent border-b-2 border-border-subtle py-2 text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-white transition-colors">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="KG 7 Ave"
                  className="w-full bg-transparent border-b-2 border-border-subtle py-2 text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 hover:bg-emerald-500 hover:text-white transition-all duration-300 disabled:opacity-50 mt-8"
            >
              {loading ? "Creating..." : "Initialize"}
            </button>
          </form>

          <div className="mt-12 text-sm text-gray-500 font-medium">
            Already registered?{" "}
            <Link href="/login" className="text-white hover:text-emerald-500 transition-colors underline decoration-2 underline-offset-4">
              Enter Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Left Panel - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-black">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <Image 
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop" 
          alt="Restaurant Ambiance" 
          fill
          className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out opacity-80"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 mix-blend-overlay w-full text-center pointer-events-none">
          <p className="text-[12rem] font-black uppercase tracking-tighter text-white opacity-20 leading-none">
            EXP
          </p>
        </div>
      </div>
    </div>
  );
}
