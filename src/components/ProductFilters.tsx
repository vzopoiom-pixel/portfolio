import React from 'react';
import { Search, X, Snowflake, Filter, Check, RotateCcw } from 'lucide-react';
import { FilterState } from '../types';
import { FLAVOR_OPTIONS, BOTTLE_SIZES, MG_OPTIONS, CATEGORIES } from '../data/mockData';

interface ProductFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResults: number;
  totalProducts: number;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  setFilters,
  totalResults,
  totalProducts,
  onReset
}) => {
  const toggleFlavor = (flavor: string) => {
    setFilters(prev => {
      const exists = prev.flavors.includes(flavor);
      if (exists) {
        return { ...prev, flavors: prev.flavors.filter(f => f !== flavor) };
      } else {
        return { ...prev, flavors: [...prev.flavors, flavor] };
      }
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.flavors.length > 0 ||
    filters.mg !== 'all' ||
    filters.bottleSize !== 'all' ||
    filters.icedOnly !== null ||
    filters.category !== 'all' ||
    filters.stockStatus !== 'all';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Search Bar with Clear & Filter Status */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, flavor profile, notes..."
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

        {/* Reset button & Results count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
          <span className="text-slate-400">
            Showing <strong className="text-emerald-400">{totalResults}</strong> of {totalProducts} items
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700"
            >
              <RotateCcw className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Primary Criteria (As Requested: Flavor(s), MG, Bottle Size, ICED) */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        
        {/* 1. Flavors multi-select selection pills */}
        <div className="md:col-span-6 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" /> Multi-Flavor Filter ({filters.flavors.length})
            </label>
            {filters.flavors.length > 0 && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, flavors: [] }))}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {FLAVOR_OPTIONS.map(flavor => {
              const isSelected = filters.flavors.includes(flavor);
              return (
                <button
                  key={flavor}
                  onClick={() => toggleFlavor(flavor)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/80 text-emerald-300 font-medium'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                  {flavor}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. MG Strength Selection */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            MG Strength
          </label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilters(prev => ({ ...prev, mg: 'all' }))}
              className={`text-xs px-2 py-1 rounded-lg border ${
                filters.mg === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {MG_OPTIONS.map(mgVal => (
              <button
                key={mgVal}
                onClick={() => setFilters(prev => ({ ...prev, mg: mgVal }))}
                className={`text-xs px-2 py-1 rounded-lg border ${
                  filters.mg === mgVal
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {mgVal}mg
              </button>
            ))}
          </div>
        </div>

        {/* 3. Bottle Size Selection */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Bottle Size
          </label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilters(prev => ({ ...prev, bottleSize: 'all' }))}
              className={`text-xs px-2 py-1 rounded-lg border ${
                filters.bottleSize === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {BOTTLE_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setFilters(prev => ({ ...prev, bottleSize: size }))}
                className={`text-xs px-2 py-1 rounded-lg border ${
                  filters.bottleSize === size
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 4. ICED / Menthol Cooling Filter (Yes / No / Any) */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Snowflake className="w-3.5 h-3.5 text-cyan-400" /> ICED Status
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setFilters(prev => ({ ...prev, icedOnly: null }))}
              className={`text-xs py-1 text-center rounded-lg border ${
                filters.icedOnly === null
                  ? 'bg-slate-700 text-white font-medium border-slate-600'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Any
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, icedOnly: true }))}
              className={`text-xs py-1 text-center rounded-lg border flex items-center justify-center gap-1 ${
                filters.icedOnly === true
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Snowflake className="w-3 h-3" /> Yes
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, icedOnly: false }))}
              className={`text-xs py-1 text-center rounded-lg border ${
                filters.icedOnly === false
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-300'
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
