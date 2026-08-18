import React, { useState } from 'react';
import { IngredientItem, IngredientFilterState } from '../types';
import { Search, X, FlaskConical, AlertCircle, Plus, Minus, Edit2, Trash2, Tag, Truck } from 'lucide-react';

interface IngredientsViewProps {
  ingredients: IngredientItem[];
  onAddIngredient: () => void;
  onEditIngredient: (item: IngredientItem) => void;
  onDeleteIngredient: (id: string) => void;
  onUpdateStock: (id: string, delta: number) => void;
}

export const IngredientsView: React.FC<IngredientsViewProps> = ({
  ingredients,
  onAddIngredient,
  onEditIngredient,
  onDeleteIngredient,
  onUpdateStock
}) => {
  const [filters, setFilters] = useState<IngredientFilterState>({
    searchQuery: '',
    brand: 'all',
    category: 'all',
    size: 'all',
    status: 'all'
  });

  // Extract unique brands and categories for dynamic filter dropdowns
  const uniqueBrands = Array.from(new Set(ingredients.map(i => i.brandSupplier)));
  const uniqueCategories = Array.from(new Set(ingredients.map(i => i.category)));
  const uniqueSizes = Array.from(new Set(ingredients.map(i => i.size)));

  const filtered = ingredients.filter(item => {
    // 1. Search Query (Name, supplier, batch lot, flavor profiles)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchSupplier = item.brandSupplier.toLowerCase().includes(q);
      const matchLot = item.batchLotNumber.toLowerCase().includes(q);
      const matchFlavor = item.flavorProfile.some(f => f.toLowerCase().includes(q));
      if (!matchName && !matchSupplier && !matchLot && !matchFlavor) return false;
    }

    // 2. Brand
    if (filters.brand !== 'all' && item.brandSupplier !== filters.brand) return false;

    // 3. Category
    if (filters.category !== 'all' && item.category !== filters.category) return false;

    // 4. Size (Gallon, Sample, 55 Gal drum, etc.)
    if (filters.size !== 'all' && item.size !== filters.size) return false;

    // 5. Stock Status
    if (filters.status !== 'all' && item.status !== filters.status) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Ingredient Filters Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ingredient by name, Brand/Supplier, LOT #, flavor..."
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={onAddIngredient}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Ingredient
          </button>
        </div>

        {/* Input criteria dropdowns (Brand/Supplier, Category, Size, Stock status) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Brand / Supplier
            </label>
            <select
              value={filters.brand}
              onChange={e => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Container Size
            </label>
            <select
              value={filters.size}
              onChange={e => setFilters(prev => ({ ...prev, size: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="all">All Sizes (Gallon/Sample)</option>
              {uniqueSizes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Inventory Status
            </label>
            <select
              value={filters.status}
              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ingredients Grid / Table */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-lg font-medium text-slate-300">No ingredients match your criteria</p>
          <p className="text-sm mt-1 text-slate-500">Check your Brand, Category, or Size filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const isOut = item.status === 'Out of Stock' || item.currentStock <= 0;
            const isLow = item.status === 'Low Stock' || (item.currentStock > 0 && item.currentStock <= item.reorderLevel);

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">{item.batchLotNumber}</span>
                      <h3 className="font-bold text-base text-white mt-0.5 leading-tight">{item.name}</h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 border ${
                        isOut
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : isLow
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Brand & Category */}
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.brandSupplier}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-700">
                        {item.category}
                      </span>
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-500/20">
                        {item.size}
                      </span>
                    </div>
                  </div>

                  {/* Flavor profiles */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.flavorProfile.map(fp => (
                      <span
                        key={fp}
                        className="bg-slate-950 text-slate-400 border border-slate-800 text-[11px] px-2 py-0.5 rounded"
                      >
                        {fp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stock Controls & Cost */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">Available</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <button
                        onClick={() => onUpdateStock(item.id, -0.5)}
                        disabled={item.currentStock <= 0}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white px-1">
                        {item.currentStock} {item.unit}
                      </span>
                      <button
                        onClick={() => onUpdateStock(item.id, 0.5)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">Unit Cost</span>
                    <span className="text-sm font-bold text-emerald-400">${item.costPerUnit.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditIngredient(item)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteIngredient(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
