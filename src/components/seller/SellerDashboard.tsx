import React from 'react';
import type { Product, Order } from '../../types';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  RotateCcw, 
  Sprout, 
  AlertTriangle,
  ArrowUpRight,
  PackageCheck,
  Truck,
  Plus
} from 'lucide-react';

interface SellerDashboardProps {
  products: Product[];
  orders: Order[];
  openAddProduct: () => void;
  setActiveTab: (tab: 'store' | 'orders' | 'dashboard' | 'products' | 'fulfillment' | 'policy') => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  products,
  orders,
  openAddProduct,
  setActiveTab,
}) => {
  // Calculate metrics
  const validOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const pendingShipments = orders.filter((o) => ['Pending', 'Packing'].includes(o.status)).length;
  const returnRequests = orders.filter((o) => o.status === 'Return Requested').length;
  const lowStockItems = products.filter((p) => p.stock < 25);

  // Top selling products calculation
  const productSalesMap: Record<string, { product: Product; quantity: number; revenue: number }> = {};

  orders.forEach((o) => {
    if (o.status !== 'Cancelled') {
      o.items.forEach((item) => {
        if (!productSalesMap[item.product.id]) {
          productSalesMap[item.product.id] = { product: item.product, quantity: 0, revenue: 0 };
        }
        productSalesMap[item.product.id].quantity += item.quantity;
        productSalesMap[item.product.id].revenue += item.product.price * item.quantity;
      });
    }
  });

  const topSelling = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-6 rounded-3xl border border-emerald-800 text-white shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            <Sprout className="w-4 h-4" /> Farmer Merchant Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Farm Sales & Revenue Analytics
          </h2>
          <p className="text-xs text-emerald-300 mt-1">
            Real-time track of revenue, incoming harvest orders, distance limit compliance, and refund handling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddProduct}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-extrabold px-4 py-2.5 rounded-2xl shadow-lg text-xs flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Produce
          </button>

          <button
            onClick={() => setActiveTab('fulfillment')}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl border border-emerald-600 text-xs flex items-center gap-1.5"
          >
            <PackageCheck className="w-4 h-4 text-amber-400" /> Manage Orders
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-emerald-950/60 p-5 rounded-3xl border border-emerald-800/80 shadow-lg space-y-2">
          <div className="flex justify-between items-center text-emerald-400 text-xs font-semibold">
            <span>Total Gross Revenue</span>
            <div className="p-2 bg-emerald-900 rounded-xl text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">₹{totalRevenue.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% from last week
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-emerald-950/60 p-5 rounded-3xl border border-emerald-800/80 shadow-lg space-y-2">
          <div className="flex justify-between items-center text-emerald-400 text-xs font-semibold">
            <span>Total Orders Placed</span>
            <div className="p-2 bg-emerald-900 rounded-xl text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{orders.length}</div>
          <div className="text-[11px] text-emerald-300">
            <strong className="text-amber-400">{pendingShipments}</strong> awaiting dispatch
          </div>
        </div>

        {/* Low Stock Veggies */}
        <div className="bg-emerald-950/60 p-5 rounded-3xl border border-emerald-800/80 shadow-lg space-y-2">
          <div className="flex justify-between items-center text-emerald-400 text-xs font-semibold">
            <span>Low Stock Alert</span>
            <div className="p-2 bg-emerald-900 rounded-xl text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{lowStockItems.length}</div>
          <div className="text-[11px] text-amber-300">
            {lowStockItems.length > 0 ? 'Requires immediate restock' : 'All items well stocked'}
          </div>
        </div>

        {/* Return & Refund requests */}
        <div className="bg-emerald-950/60 p-5 rounded-3xl border border-emerald-800/80 shadow-lg space-y-2">
          <div className="flex justify-between items-center text-emerald-400 text-xs font-semibold">
            <span>Return & Refund Requests</span>
            <div className="p-2 bg-emerald-900 rounded-xl text-purple-400">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{returnRequests}</div>
          <div className="text-[11px] text-emerald-300">
            Requires seller approval
          </div>
        </div>
      </div>

      {/* Analytics Section & Top Selling Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-emerald-950/60 p-6 rounded-3xl border border-emerald-800/80 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" /> Top Selling Mushroom & Veggie Produce
            </h3>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              View All Products
            </button>
          </div>

          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <p className="text-xs text-emerald-400 py-4">No sales recorded yet.</p>
            ) : (
              topSelling.map(({ product, quantity, revenue }) => (
                <div key={product.id} className="flex items-center justify-between bg-emerald-900/40 p-3.5 rounded-2xl border border-emerald-800 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-xl border border-emerald-700" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{product.name}</h4>
                      <span className="text-emerald-400">{product.category} • {product.farmName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-amber-300 text-sm">₹{revenue}</div>
                    <div className="text-[11px] text-emerald-300 font-medium">{quantity} {product.unit}s sold</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="bg-emerald-950/60 p-6 rounded-3xl border border-emerald-800/80 shadow-xl space-y-4">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" /> Seller Operations
          </h3>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => setActiveTab('fulfillment')}
              className="w-full bg-emerald-900/60 hover:bg-emerald-800 p-3.5 rounded-2xl border border-emerald-700/60 text-left flex items-center justify-between text-emerald-200 transition-colors"
            >
              <div>
                <strong className="text-white block">Pending Order Dispatch</strong>
                <span className="text-[11px] text-emerald-400">{pendingShipments} orders waiting to be packed</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => setActiveTab('policy')}
              className="w-full bg-emerald-900/60 hover:bg-emerald-800 p-3.5 rounded-2xl border border-emerald-700/60 text-left flex items-center justify-between text-emerald-200 transition-colors"
            >
              <div>
                <strong className="text-white block">Distance Limitation Policy</strong>
                <span className="text-[11px] text-emerald-400">Configure zone max ordering rules</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={openAddProduct}
              className="w-full bg-amber-500/20 hover:bg-amber-500/30 p-3.5 rounded-2xl border border-amber-500/50 text-left flex items-center justify-between text-amber-200 transition-colors"
            >
              <div>
                <strong className="text-amber-300 block">Post Harvest Batch</strong>
                <span className="text-[11px] text-amber-200">List today's fresh pluck</span>
              </div>
              <Plus className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
