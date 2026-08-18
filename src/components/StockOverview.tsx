import React from 'react';
import { ProductItem, IngredientItem } from '../types';
import { AlertTriangle, Package, FlaskConical, DollarSign, TrendingUp, ShieldAlert } from 'lucide-react';

interface StockOverviewProps {
  products: ProductItem[];
  ingredients: IngredientItem[];
  onSelectProductTab: () => void;
  onSelectIngredientTab: () => void;
}

export const StockOverview: React.FC<StockOverviewProps> = ({
  products,
  ingredients,
  onSelectProductTab,
  onSelectIngredientTab
}) => {
  const lowStockProducts = products.filter(p => p.stockQty <= p.minThreshold);
  const lowStockIngredients = ingredients.filter(i => i.currentStock <= i.reorderLevel);

  const totalProductUnits = products.reduce((acc, p) => acc + p.stockQty, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + p.stockQty * p.unitPrice, 0);
  const totalIngredientValue = ingredients.reduce((acc, i) => acc + i.currentStock * i.costPerUnit, 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{products.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">{totalProductUnits} units in stock</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingredients Raw</span>
            <FlaskConical className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{ingredients.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">Active batch suppliers</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Product Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <span className="text-xs text-slate-400 mt-1 block">Retail inventory value</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">
            {lowStockProducts.length + lowStockIngredients.length}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Requires reordering</span>
        </div>
      </div>

      {/* Alerts Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products needing restock */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">Products Under Threshold</h3>
            </div>
            <button
              onClick={onSelectProductTab}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              View Products
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center bg-slate-950/40 rounded-xl border border-slate-800/40">
              All finished products have healthy stock levels!
            </p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs"
                >
                  <div>
                    <strong className="text-slate-100 block">{p.name}</strong>
                    <span className="text-slate-400">{p.bottleSize} • {p.mg}mg • SKU: {p.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-400">{p.stockQty} left</span>
                    <span className="text-slate-500 block text-[11px]">min: {p.minThreshold}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients needing restock */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">Ingredients Low / Out</h3>
            </div>
            <button
              onClick={onSelectIngredientTab}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              View Ingredients
            </button>
          </div>

          {lowStockIngredients.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center bg-slate-950/40 rounded-xl border border-slate-800/40">
              All raw ingredients are adequately supplied!
            </p>
          ) : (
            <div className="space-y-2">
              {lowStockIngredients.map(i => (
                <div
                  key={i.id}
                  className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs"
                >
                  <div>
                    <strong className="text-slate-100 block">{i.name}</strong>
                    <span className="text-slate-400">{i.brandSupplier} • {i.size}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${i.currentStock === 0 ? 'text-rose-500' : 'text-amber-400'}`}>
                      {i.currentStock} {i.unit}
                    </span>
                    <span className="text-slate-500 block text-[11px]">lot: {i.batchLotNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
