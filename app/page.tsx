import React from "react";
import Link from "next/link";
import { ArrowRight, QrCode, Star, ChefHat, Search } from "lucide-react";
import { listFeatured, listRecentlyAdded } from "@/lib/actions/restaurants";
import { cn } from "@/lib/utils";

// Minimal stark header
function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-gray-800 bg-[#0A0A0A] fixed top-0 w-full z-50">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tighter uppercase text-[#F3F3F3]">
          Expaura
        </span>
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

// Brutalist Footer
function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-24 px-8 sm:px-16 lg:px-24">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 text-[#F3F3F3]">
        <div className="md:col-span-2">
          <span className="text-4xl font-black tracking-tighter uppercase block mb-4">
            Expaura.
          </span>
          <p className="text-gray-500 text-sm max-w-sm">
            The standard for modern restaurant experiences. Digitizing menus, capturing feedback, and empowering operators.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Platform</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="/directory" className="hover:text-white">Directory</Link></li>
            <li><Link href="/admin/login" className="hover:text-purple-500">System Admin</Link></li>
            <li><Link href="/register" className="hover:text-emerald-500">Join Expaura</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Legal</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-24 pt-8 border-t border-gray-900 text-xs text-gray-600 font-bold uppercase tracking-widest flex justify-between">
        <span>© {new Date().getFullYear()} Expaura Platform</span>
        <span>Kigali, Rwanda</span>
      </div>
    </footer>
  );
}

export default async function HomePage() {
  const featured = await listFeatured(6);
  const recentlyAdded = await listRecentlyAdded(12);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F3F3F3] font-sans selection:bg-emerald-500 selection:text-white">
      <Header />
      
      <main className="pt-24">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col justify-center px-8 sm:px-16 lg:px-24">
          <div className="absolute inset-0 z-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000&auto=format&fit=crop" 
              alt="Restaurant background" 
              className="w-full h-full object-cover grayscale mix-blend-overlay"
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
        <section className="py-24 border-y border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-800">
            {[
              { icon: QrCode, title: "Scan & Dine", desc: "Instant access to digital menus via QR. No apps, no waiting." },
              { icon: Star, title: "Authentic Reviews", desc: "Real feedback from verified diners shaping the culinary landscape." },
              { icon: ChefHat, title: "Curated Venues", desc: "Discover the finest spots in the city, handpicked and vetted." }
            ].map((feat, idx) => (
              <div key={idx} className="p-12 hover:bg-gray-900/50 transition-colors group">
                <feat.icon className="w-12 h-12 text-gray-600 group-hover:text-emerald-500 transition-colors mb-8" />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{feat.title}</h3>
                <p className="text-gray-400 font-medium">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED RESTAURANTS */}
        <section className="py-24 px-8 sm:px-16 lg:px-24">
          <div className="flex justify-between items-end mb-16 border-b border-gray-800 pb-8">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase">
              Featured<br/>Venues
            </h2>
            <Link href="/directory" className="text-sm font-bold uppercase tracking-widest text-emerald-500 hover:text-white transition-colors flex items-center gap-2">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 font-bold uppercase tracking-widest border border-dashed border-gray-800">
                No featured venues currently available.
              </div>
            ) : (
              featured.map((restaurant) => {
                const hasRating = restaurant.reviewCount > 0;
                return (
                  <Link href={`/r/${restaurant.slug}`} key={restaurant.id} className="group block">
                    <div className="aspect-[4/5] bg-gray-900 relative mb-4 overflow-hidden border border-gray-800 group-hover:border-emerald-500 transition-colors">
                      {restaurant.coverImageUrl ? (
                        <img src={restaurant.coverImageUrl} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="w-16 h-16 text-gray-800" />
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
                          <span className="text-[10px] text-gray-300">({restaurant.reviewCount})</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-emerald-500 transition-colors truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-medium truncate mt-1">
                      {restaurant.address || restaurant.city.name || "Kigali"}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
