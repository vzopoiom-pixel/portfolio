import React from 'react';
import { Package, FlaskConical, BarChart3, Tablet, Plus, RefreshCw, Download, Database } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  productCount: number;
  ingredientCount: number;
  lowStockCount: number;
  onAddNew: () => void;
  onResetData: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  productCount,
  ingredientCount,
  lowStockCount,
  onAddNew,
  onResetData,
  onExportData
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Database className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white">VaporCore Engine</h1>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-500/20 flex items-center gap-1">
                    <Tablet className="w-3 h-3" /> iPad Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400">Internal Product & Ingredient Multi-Search Database</p>
              </div>
            </div>

            {/* Quick Action Button for Mobile/iPad */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onAddNew}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1 shadow"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-emerald-500 text-slate-950 shadow font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products Database</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'products' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300'
              }`}>
                {productCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'ingredients'
                  ? 'bg-emerald-500 text-slate-950 shadow font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Ingredients Database</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'ingredients' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300'
              }`}>
                {ingredientCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500 text-slate-950 shadow font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Stock Overview</span>
              {lowStockCount > 0 && (
                <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  {lowStockCount} low
                </span>
              )}
            </button>
          </div>

          {/* Action buttons (Desktop / iPad Pro) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onExportData}
              title="Export database to JSON/CSV"
              className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>

            <button
              onClick={onResetData}
              title="Reset to initial sample catalog"
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onAddNew}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add {activeTab === 'ingredients' ? 'Ingredient' : 'Product'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
