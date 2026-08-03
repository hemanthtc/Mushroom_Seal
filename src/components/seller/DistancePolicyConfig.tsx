import React, { useState } from 'react';
import { Truck, ShieldCheck, MapPin, CheckCircle, Info } from 'lucide-react';

export const DistancePolicyConfig: React.FC = () => {
  const [tier1Max, setTier1Max] = useState(5);
  const [tier2Max, setTier2Max] = useState(15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-6 rounded-3xl border border-emerald-800 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-800 rounded-2xl border border-emerald-700 text-amber-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Distance Limitation & Perishable Policy</h2>
            <p className="text-xs text-emerald-300">
              Configure delivery zone radius thresholds & cold-chain transit parameters.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-emerald-950/60 p-6 rounded-3xl border border-emerald-800/80 shadow-xl space-y-6 text-emerald-100">
        
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" /> Default Distance Radius Tiers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800 space-y-2">
              <label className="block text-white font-bold">Zone 1 (Near Farm Radius)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tier1Max}
                  onChange={(e) => setTier1Max(Number(e.target.value))}
                  className="bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-1.5 text-white font-mono w-24 text-center font-bold"
                />
                <span className="text-emerald-300">km from farm</span>
              </div>
              <p className="text-[11px] text-emerald-400">Allows max quantity per order for fresh un-insulated harvest.</p>
            </div>

            <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800 space-y-2">
              <label className="block text-white font-bold">Zone 2 (Mid-Range Radius)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tier2Max}
                  onChange={(e) => setTier2Max(Number(e.target.value))}
                  className="bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-1.5 text-white font-mono w-24 text-center font-bold"
                />
                <span className="text-emerald-300">km from farm</span>
              </div>
              <p className="text-[11px] text-emerald-400">Requires cold-pack thermal insulation box.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-emerald-800/60">
          <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Quality & Cold-Chain Guarantee
          </h3>

          <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800 space-y-3 text-xs">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-300">
                Fresh Oyster & Shiitake mushrooms lose moisture rapidly if transported beyond 15 km without active climate control. 
                Setting strict distance limits ensures buyers receive 100% firm, pristine produce.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-emerald-800">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Distance Policy Saved!
            </span>
          ) : <div />}

          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-6 py-3 rounded-2xl shadow-lg text-xs"
          >
            Save Policy Rules
          </button>
        </div>

      </form>
    </div>
  );
};
