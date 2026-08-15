import React, { useState } from 'react';
import type { 
  Product, 
  CategoryType, 
  AddressDetails 
} from '../../types';
import { 
  Plus, 
  Check, 
  Clock, 
  Leaf, 
  AlertTriangle, 
  Truck, 
  Sparkles,
  ShieldCheck,
  Maximize2,
  Info
} from 'lucide-react';
import { getMaxAllowedQuantityForDistance } from '../../services/storage';

interface ProductCatalogProps {
  products: Product[];
  categories: CategoryType[];
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  searchQuery: string;
  address: AddressDetails;
  addToCart: (product: Product, quantity?: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  address,
  addToCart,
}) => {
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  // Filter logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.farmName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedAnimationId(product.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 sm:p-10 shadow-2xl border border-emerald-800/60">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Leaf className="w-96 h-96 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/70 border border-emerald-600/50 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Direct From Organic Farmers & Mushroom Growers
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-emerald-100 to-amber-200 bg-clip-text text-transparent">
            Fresh Mushroom & Organic Veggie Harvest
          </h1>

          <p className="text-emerald-200/90 text-sm sm:text-base leading-relaxed">
            Order fresh Oyster, Shiitake, and Button mushrooms plucked today at 5:00 AM. 
            We calculate real-time distance to preserve peak freshness and enforce distance-based quantity limits.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-300">
            <div className="flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/60">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Distance to Farm: <strong className="text-amber-300 font-bold">{address.estimatedDistanceKm} km</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Chemicals • 100% Traceable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white shadow-emerald-900/40 ring-2 ring-emerald-400'
                : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-emerald-950/20 rounded-3xl border border-emerald-800/40 p-8">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-emerald-100">No items match your filter</h3>
          <p className="text-emerald-400 text-sm mt-1">Try resetting the category filter or searching for another veggie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const maxAllowed = getMaxAllowedQuantityForDistance(product, address.estimatedDistanceKm);
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProductDetail(product)}
                className="group relative bg-emerald-950/50 hover:bg-emerald-900/40 rounded-3xl border border-emerald-800/50 hover:border-emerald-600/70 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-emerald-900">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-80" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.badge && (
                      <span className="bg-amber-500 text-emerald-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                        {product.badge}
                      </span>
                    )}
                    {product.isOrganic && (
                      <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-emerald-400/30 flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-emerald-200" /> Organic
                      </span>
                    )}
                  </div>

                  {/* Quick Expand Button */}
                  <button className="absolute top-3 right-3 p-2 rounded-full bg-emerald-950/60 text-emerald-200 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Harvest Tag */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] text-emerald-200 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700/50">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Harvested {product.harvestedDate}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {product.farmName}
                    </div>
                    <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1 mt-0.5">
                      {product.name}
                    </h3>
                    <p className="text-xs text-emerald-300/80 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  {/* Distance limitation warning pill */}
                  <div className="bg-emerald-900/60 rounded-xl p-2 border border-emerald-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-300 font-medium flex items-center gap-1">
                      <Truck className="w-3 h-3 text-amber-400" /> Limit at {address.estimatedDistanceKm}km:
                    </span>
                    <span className="font-extrabold text-amber-300 bg-emerald-950 px-2 py-0.5 rounded-lg border border-amber-500/30">
                      Max {maxAllowed} {product.unit}s
                    </span>
                  </div>

                  {/* Price and Add button */}
                  <div className="pt-2 flex items-center justify-between border-t border-emerald-800/40">
                    <div>
                      <span className="text-xl font-extrabold text-white">₹{product.price}</span>
                      <span className="text-xs text-emerald-400 font-medium ml-1">/ {product.unit}</span>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                        addedAnimationId === product.id
                          ? 'bg-emerald-500 text-emerald-950 scale-105'
                          : isOutOfStock
                          ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950'
                      }`}
                    >
                      {addedAnimationId === product.id ? (
                        <>
                          <Check className="w-4 h-4" /> Added!
                        </>
                      ) : isOutOfStock ? (
                        'Sold Out'
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-emerald-950 border border-emerald-700/70 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 bg-emerald-900">
              <img 
                src={selectedProductDetail.image} 
                alt={selectedProductDetail.name}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedProductDetail(null)}
                className="absolute top-4 right-4 bg-emerald-950/80 text-white rounded-full p-2 hover:bg-emerald-900 border border-emerald-700"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-amber-500 text-emerald-950 text-xs font-black uppercase px-3 py-1 rounded-full">
                  {selectedProductDetail.category}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 text-emerald-100">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedProductDetail.name}</h2>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">Farm: {selectedProductDetail.farmName}</p>
              </div>

              <p className="text-sm text-emerald-200/90 leading-relaxed">
                {selectedProductDetail.description}
              </p>

              {/* Distance rules matrix */}
              <div className="bg-emerald-900/60 rounded-2xl p-4 border border-emerald-800 space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> Distance-Based Quantity Restrictions
                </h4>
                <p className="text-xs text-emerald-300">
                  Because fresh farm produce requires cold-preservation during transit, buying limits adapt to delivery distance:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 text-xs">
                  <div className="bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-800">
                    <span className="block text-[10px] text-emerald-400">0 - 5 km</span>
                    <strong className="text-amber-300 text-sm">{selectedProductDetail.distanceRules.maxQtyKm5} {selectedProductDetail.unit}s</strong>
                  </div>
                  <div className="bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-800">
                    <span className="block text-[10px] text-emerald-400">5 - 15 km</span>
                    <strong className="text-amber-300 text-sm">{selectedProductDetail.distanceRules.maxQtyKm15} {selectedProductDetail.unit}s</strong>
                  </div>
                  <div className="bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-800">
                    <span className="block text-[10px] text-emerald-400">&gt; 15 km</span>
                    <strong className="text-amber-300 text-sm">{selectedProductDetail.distanceRules.maxQtyKmBeyond} {selectedProductDetail.unit}s</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-emerald-800">
                <div>
                  <span className="text-2xl font-extrabold text-white">₹{selectedProductDetail.price}</span>
                  <span className="text-xs text-emerald-400 font-medium"> / {selectedProductDetail.unit}</span>
                </div>
                
                <button
                  onClick={() => {
                    addToCart(selectedProductDetail, 1);
                    setSelectedProductDetail(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm"
                >
                  <Plus className="w-5 h-5" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
