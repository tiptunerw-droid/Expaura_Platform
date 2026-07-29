"use client";

import Link from "next/link";

function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-gray-800 bg-[#0A0A0A] fixed top-0 w-full z-50">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="text-xl font-bold tracking-tighter uppercase text-[#F3F3F3]">
            Expaura
          </span>
        </Link>
      </div>
      <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-500">
        <Link href="/directory" className="hover:text-white transition-colors">Directory</Link>
        <Link href="/features" className="hover:text-white transition-colors">Features</Link>
        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
      </nav>
      <div className="flex gap-4">
        <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors py-2">
          Login
        </Link>
        <Link href="/register" className="text-xs font-bold uppercase tracking-widest bg-white text-black px-4 py-2 hover:bg-emerald-500 hover:text-white transition-all">
          List Restaurant
        </Link>
      </div>
    </header>
  );
}

export { SiteHeader };
