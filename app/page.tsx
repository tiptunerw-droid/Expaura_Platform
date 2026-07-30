import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, QrCode, Star, ChefHat } from "lucide-react";
import { listFeatured } from "@/lib/actions/restaurants";

export const dynamic = "force-dynamic";

// Minimal stark header
function Header() {
  return (
      <header className="flex items-center justify-between px-8 py-6 border-b border-border-subtle bg-surface fixed top-0 w-full z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold tracking-tighter uppercase text-text-primary hover:text-emerald-500 transition-colors">
            Expaura
          </Link>
        </div>
        <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-text-tertiary">
          <Link href="/directory" className="hover:text-text-primary transition-colors">Directory</Link>
          <Link href="/features" className="hover:text-text-primary transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors py-2">
            Login
          </Link>
          <Link href="/register" className="text-xs font-bold uppercase tracking-widest bg-white text-black px-4 py-2 hover:bg-emerald-500 hover:text-white transition-all">
            List Restaurant
          </Link>
        </div>
      </header>
  );
}

// Brutalist Footer
function Footer() {
  return (
    <footer className="bg-black border-t border-neutral-800 py-24 px-8 sm:px-16 lg:px-24">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="md:col-span-2">
          <span className="text-4xl font-black tracking-tighter uppercase block mb-4 text-white">
            Expaura.
          </span>
          <p className="text-neutral-400 text-sm max-w-sm">
            The standard for modern restaurant experiences. Digitizing menus, capturing feedback, and empowering operators.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Platform</h4>
          <ul className="space-y-4 text-sm font-medium text-neutral-300">
            <li><Link href="/directory" className="hover:text-white transition-colors">Directory</Link></li>
            <li><Link href="/admin/login" className="hover:text-purple-400 transition-colors">System Admin</Link></li>
            <li><Link href="/register" className="hover:text-emerald-400 transition-colors">Join Expaura</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Legal</h4>
          <ul className="space-y-4 text-sm font-medium text-neutral-300">
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-24 pt-8 border-t border-neutral-800 text-xs text-neutral-500 font-bold uppercase tracking-widest flex justify-between">
        <span>© {new Date().getFullYear()} Expaura Platform</span>
        <span>Kigali, Rwanda</span>
      </div>
    </footer>
  );
}

async function FeaturedSection() {
  const featured = await listFeatured(6);

  if (featured.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-text-tertiary font-bold uppercase tracking-widest border border-dashed border-border-subtle">
        No featured venues currently available.
      </div>
    );
  }

  return featured.map((restaurant) => {
    const hasRating = restaurant.reviewCount > 0;
    return (
      <Link href={`/r/${restaurant.slug}`} key={restaurant.id} className="group block">
        <div className="aspect-[4/5] bg-surface-alt relative mb-4 overflow-hidden border border-border-subtle group-hover:border-emerald-500 transition-colors">
          {restaurant.coverImageUrl ? (
            <Image src={restaurant.coverImageUrl} alt={restaurant.name} fill className="object-cover group-hover:scale-[1.03] transition-all duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-16 h-16 text-text-tertiary" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
            {restaurant.city.name}
          </div>
          {hasRating && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded">
              <Star className="w-3.5 h-3.5 fill-brass text-brass" />
              <span className="text-sm font-bold text-white">{restaurant.averageOverall.toFixed(1)}</span>
              <span className="text-[10px] text-white/60">({restaurant.reviewCount})</span>
            </div>
          )}
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-emerald-500 transition-colors truncate">
          {restaurant.name}
        </h3>
        <p className="text-sm text-text-tertiary uppercase tracking-wider font-medium truncate mt-1">
          {restaurant.address || restaurant.city.name || "Kigali"}
        </p>
      </Link>
    );
  });
}

function FeaturedSkeleton() {
  return Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="group block animate-pulse">
      <div className="aspect-[4/5] bg-surface-alt relative mb-4 overflow-hidden border border-border-subtle rounded-lg" />
      <div className="h-5 w-3/4 bg-surface-alt rounded mb-2" />
      <div className="h-3 w-1/2 bg-surface-alt rounded" />
    </div>
  ));
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary font-sans selection:bg-emerald-500 selection:text-white">
      <Header />
      
      <main className="pt-24">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-black">
          <div className="absolute inset-0 z-0 opacity-40">
            <Image 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000&auto=format&fit=crop" 
              alt="Restaurant background" 
              fill
              className="object-cover grayscale mix-blend-overlay"
            />
          </div>
          
          <div className="relative z-10 max-w-4xl mix-blend-difference">
            <h1 className="text-[12vw] sm:text-[8rem] font-black tracking-tighter leading-[0.8] uppercase mb-8">
              The<br/><span className="text-emerald-500">Standard.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 font-medium max-w-2xl mb-12">
              Elevate your dining experience. Explore curated venues, digital menus, and authentic reviews.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                href="/directory" 
                className="bg-white text-black font-black uppercase tracking-widest px-8 py-5 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                Explore Directory <ArrowRight size={20} />
              </Link>
              <Link 
                href="/register" 
                className="border-2 border-white text-white font-black uppercase tracking-widest px-8 py-5 hover:bg-white hover:text-black transition-all flex items-center justify-center"
              >
                For Restaurants
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 border-y border-border-subtle">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
            {[
              { icon: QrCode, title: "Scan & Dine", desc: "Instant access to digital menus via QR. No apps, no waiting." },
              { icon: Star, title: "Authentic Reviews", desc: "Real feedback from verified diners shaping the culinary landscape." },
              { icon: ChefHat, title: "Curated Venues", desc: "Discover the finest spots in the city, handpicked and vetted." }
            ].map((feat, idx) => (
              <div key={idx} className="p-12 hover:bg-surface-alt/50 transition-colors group">
                <feat.icon className="w-12 h-12 text-text-tertiary group-hover:text-emerald-500 transition-colors mb-8" />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{feat.title}</h3>
                <p className="text-text-secondary font-medium">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED RESTAURANTS */}
        <section className="py-24 px-8 sm:px-16 lg:px-24">
          <div className="flex justify-between items-end mb-16 border-b border-border-subtle pb-8">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase">
              Featured<br/>Venues
            </h2>
            <Link href="/directory" className="text-sm font-bold uppercase tracking-widest text-emerald-500 hover:text-white transition-colors flex items-center gap-2">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Suspense fallback={<FeaturedSkeleton />}>
              <FeaturedSection />
            </Suspense>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
