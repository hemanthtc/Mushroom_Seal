import React, { useState } from 'react';
import type { Product, CategoryType } from '../../types';
import { X, Sprout, Check, Trash2 } from 'lucide-react';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
}

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>(
    productToEdit || {
      name: '',
      category: 'Fresh Mushrooms',
      price: 150,
      unit: '250g',
      stock: 50,
      description: '',
      image: 'https://images.unsplash.com/photo-1504470695779-75300268aa0e?auto=format&fit=crop&w=800&q=80',
      farmName: 'GreenCap Farm',
      isOrganic: true,
      harvestedDate: 'Today 6:00 AM',
      badge: 'Farm Fresh',
      distanceRules: {
        maxQtyKm5: 10,
        maxQtyKm15: 5,
        maxQtyKmBeyond: 2,
      },
    }
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProduct: Product = {
      id: productToEdit ? productToEdit.id : 'prod-' + Date.now(),
      name: formData.name || 'Organic Veggie',
      category: (formData.category as CategoryType) || 'Fresh Mushrooms',
      price: Number(formData.price) || 100,
      unit: (formData.unit as 'kg' | 'pack' | '500g' | '250g' | '200g') || 'kg',
      stock: Number(formData.stock) || 10,
      description: formData.description || '',
      image: formData.image || 'https://images.unsplash.com/photo-1504470695779-75300268aa0e?auto=format&fit=crop&w=800&q=80',
      farmName: formData.farmName || 'Local Grower',
      isOrganic: formData.isOrganic ?? true,
      harvestedDate: formData.harvestedDate || 'Today',
      badge: formData.badge || undefined,
      distanceRules: formData.distanceRules || {
        maxQtyKm5: 10,
        maxQtyKm15: 5,
        maxQtyKmBeyond: 2,
      },
    };

    onSaveProduct(finalProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-emerald-950 border border-emerald-700/80 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-emerald-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800/60 rounded-xl border border-emerald-700">
              <Sprout className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">
                {productToEdit ? 'Edit Harvest Product' : 'Add New Mushroom / Veggie Produce'}
              </h2>
              <p className="text-xs text-emerald-300">Set price, inventory stock & distance buying limits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div>
            <label className="block text-emerald-300 font-bold mb-1">Product Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Fresh Pink Oyster Mushrooms"
              className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-emerald-300 font-bold mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-sans"
              >
                <option>Fresh Mushrooms</option>
                <option>Leafy Greens</option>
                <option>Root & Bulb Veggies</option>
                <option>Exotic & Herbs</option>
                <option>Farm Combos</option>
              </select>
            </div>

            <div>
              <label className="block text-emerald-300 font-bold mb-1">Farm Name</label>
              <input
                type="text"
                required
                value={formData.farmName}
                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-emerald-300 font-bold mb-1">Price (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-emerald-300 font-bold mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-sans"
              >
                <option value="200g">200g</option>
                <option value="250g">250g</option>
                <option value="500g">500g</option>
                <option value="kg">kg</option>
                <option value="pack">pack</option>
              </select>
            </div>

            <div>
              <label className="block text-emerald-300 font-bold mb-1">In Stock</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-emerald-300 font-bold mb-1">Image URL</label>
            <input
              type="text"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-emerald-300 font-bold mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          {/* Distance Restriction Settings */}
          <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800 space-y-2">
            <h4 className="font-extrabold text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span>Set Max Buyer Quantity Limits By Distance Zone</span>
            </h4>
            <p className="text-[11px] text-emerald-300">
              Limit maximum units a single buyer can order depending on how far their delivery address is from your farm.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[10px] text-emerald-400 font-bold mb-1">0 - 5 km (Near)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.distanceRules?.maxQtyKm5 || 10}
                  onChange={(e) => setFormData({
                    ...formData,
                    distanceRules: {
                      ...formData.distanceRules!,
                      maxQtyKm5: parseInt(e.target.value) || 1,
                    }
                  })}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-1.5 text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] text-emerald-400 font-bold mb-1">5 - 15 km (Mid)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.distanceRules?.maxQtyKm15 || 5}
                  onChange={(e) => setFormData({
                    ...formData,
                    distanceRules: {
                      ...formData.distanceRules!,
                      maxQtyKm15: parseInt(e.target.value) || 1,
                    }
                  })}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-1.5 text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] text-emerald-400 font-bold mb-1">&gt; 15 km (Far)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.distanceRules?.maxQtyKmBeyond || 2}
                  onChange={(e) => setFormData({
                    ...formData,
                    distanceRules: {
                      ...formData.distanceRules!,
                      maxQtyKmBeyond: parseInt(e.target.value) || 1,
                    }
                  })}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-1.5 text-white font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="flex justify-between items-center pt-2">
            {productToEdit && onDeleteProduct ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(productToEdit.id);
                  onClose();
                }}
                className="bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 font-bold px-3 py-2 rounded-xl flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-bold text-emerald-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Produce
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
