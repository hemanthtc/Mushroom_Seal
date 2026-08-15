import React from 'react';
import { 
  Sprout, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Store, 
  ArrowRight, 
  HeartHandshake, 
  Clock, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import type { Product } from '../../types';

interface PromotionalHeroProps {
  products: Product[];
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const PromotionalHero: React.FC<PromotionalHeroProps> = ({
  products,
  onOpenLogin,
  onOpenRegister,
}) => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-12 pb-16 text-emerald-50">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-900 border border-emerald-800/80 shadow-2xl p-8 sm:p-12">
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 bg-emerald-900/90 border border-amber-500/40 text-amber-300 text-xs px-3.5 py-1.5 rounded-full font-semibold shadow-md">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Direct Organic Farm Marketplace • Fresh Harvested Today</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Farm-Fresh <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">Organic Mushrooms</span> & Local Harvest Deliveries
            </h1>

            {/* Subheadline */}
            <p className="text-emerald-200 text-sm sm:text-base font-normal max-w-xl leading-relaxed">
              Connect directly with verified local growers. Enjoy hyper-local cold-chain delivery within <strong className="text-white">4 hours</strong> with strict distance-based freshness safeguards.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/60 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Certified Organic</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/60 text-xs">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Cold-Chain &lt; 4 Hours</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/60 text-xs">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Harvested Daily at 5 AM</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onOpenRegister}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-950/50 text-sm transition-all transform hover:-translate-y-0.5"
              >
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 font-bold px-6 py-3.5 rounded-2xl border border-emerald-700/80 text-sm transition-colors shadow-md"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Customer / Seller Login</span>
              </button>
            </div>

          </div>

          {/* Right Promotional Feature Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-emerald-900/60 backdrop-blur-xl border border-emerald-700/80 rounded-3xl p-6 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Shroom & Veggies Direct</h3>
                    <p className="text-[11px] text-emerald-300">Sarjapur Agro Belt Farm Hub</p>
                  </div>
                </div>
                <span className="bg-emerald-800 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-600">
                  VERIFIED FARM
                </span>
              </div>

              {/* Promo Banner Box */}
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 p-4 rounded-2xl border border-emerald-600/50 text-xs space-y-2">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span>Special Launch Offer</span>
                  <span className="bg-amber-400 text-emerald-950 px-2 py-0.5 rounded font-black text-[10px]">20% OFF</span>
                </div>
                <p className="text-emerald-100 text-[11px] leading-relaxed">
                  Register as a new Customer today to unlock priority distance delivery and direct farm pricing on Oyster & Button Mushroom combos!
                </p>
              </div>

              {/* Micro Metrics */}
              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800">
                  <strong className="text-lg font-black text-amber-300 block">4.9 / 5.0</strong>
                  <span className="text-[10px] text-emerald-300">Verified Ratings</span>
                </div>
                <div className="bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800">
                  <strong className="text-lg font-black text-white block">15,000+</strong>
                  <span className="text-[10px] text-emerald-300">Organic KGs Delivered</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FEATURED HARVEST PROMOTIONAL SHOWCASE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-emerald-800/60 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Featured Seasonal Harvests
            </h2>
            <p className="text-xs text-emerald-300 mt-1">
              Freshly harvested varieties available directly from registered organic vendors.
            </p>
          </div>
          <button
            onClick={onOpenLogin}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 underline"
          >
            Log in to view full catalog & prices →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredProducts.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-emerald-950/40 rounded-3xl border border-emerald-800/40 p-6">
              <Sprout className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-80" />
              <h3 className="text-base font-bold text-emerald-100">No pre-built products in catalog</h3>
              <p className="text-emerald-400 text-xs mt-1">Sellers can log in to add fresh harvest produce to the storefront catalog.</p>
            </div>
          ) : (
            featuredProducts.map((item) => (
              <div
                key={item.id}
                className="bg-emerald-950 border border-emerald-800/80 rounded-3xl overflow-hidden shadow-lg hover:border-emerald-600 transition-all flex flex-col group"
              >
                <div className="relative h-44 overflow-hidden bg-emerald-900/50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-emerald-950/90 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-700 backdrop-blur-md">
                    {item.category}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-emerald-300 line-clamp-2 mt-1 font-light">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-emerald-900 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-amber-300">₹{item.price}</span>
                      <span className="text-[10px] text-emerald-400 font-medium"> / {item.unit}</span>
                    </div>

                    <button
                      onClick={onOpenLogin}
                      className="bg-emerald-900 hover:bg-emerald-800 text-amber-300 hover:text-white font-bold text-[11px] px-3 py-1.5 rounded-xl border border-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3 text-amber-400" /> Order
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* WHY CHOOSE US & SELLER PARTNER BANNER */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customer Benefits */}
        <div className="bg-emerald-900/40 border border-emerald-800/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">For Organic Produce Buyers</h3>
              <p className="text-xs text-emerald-300">Phone-first 1-Click Login & Auto 7-Day Session</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-emerald-200">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>OTP Phone-based instant verification. Stay logged in for 7 days.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Live Razorpay online payment simulation & instant order cancellation refunds.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Dynamic Map Location Picker with automatic distance-based freshness guards.</span>
            </li>
          </ul>
        </div>

        {/* Seller Partnership */}
        <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-700/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">For Mushroom & Agro Farmers</h3>
              <p className="text-xs text-amber-300">Sell Direct • High Security Role Portal</p>
            </div>
          </div>
          <p className="text-xs text-emerald-200 leading-relaxed">
            Register your farm to access the seller dashboard. Manage live inventory, track order fulfillment, set custom distance limits, and analyze payout accounting ledgers.
          </p>
          <div className="pt-1">
            <button
              onClick={onOpenRegister}
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black px-4 py-2 rounded-xl text-xs shadow-md transition-colors"
            >
              Register Farm as Vendor
            </button>
          </div>
        </div>

      </section>

    </div>
  );
};
