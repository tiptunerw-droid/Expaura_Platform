"use client";

import Link from "next/link";

function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-border-subtle bg-surface fixed top-0 w-full z-50">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="text-xl font-bold tracking-tighter uppercase text-text-primary">
            Expaura
          </span>
        </Link>
      </div>
      <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-500">
        <Link href="/directory" className="hover:text-[#ffffff] transition-colors">Directory</Link>
        <Link href="/features" className="hover:text-[#ffffff] transition-colors">Features</Link>
        <Link href="/pricing" className="hover:text-[#ffffff] transition-colors">Pricing</Link>
      </nav>
      <div className="flex gap-4">
        <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-[#ffffff] transition-colors py-2">
          Login
        </Link>
        <Link href="/register" className="text-xs font-bold uppercase tracking-widest bg-white text-black px-4 py-2 hover:bg-emerald-500 hover:text-[#ffffff] transition-all">
          List Restaurant
        </Link>
      </div>
    </header>
  );
}

export { SiteHeader };
