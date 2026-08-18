import React from 'react';
import { ProductItem } from '../types';
import { Snowflake, Edit2, Trash2, Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ProductListProps {
  products: ProductItem[];
  onEdit: (product: ProductItem) => void;
  onDelete: (id: string) => void;
  onUpdateStock: (id: string, delta: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  onUpdateStock
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <p className="text-lg font-medium text-slate-300">No products match your current filters</p>
        <p className="text-sm mt-1 text-slate-500">Try clearing some flavor selections, adjusting MG strength, or resetting your search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => {
        const isLowStock = product.stockQty <= product.minThreshold;
        return (
          <div
            key={product.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-all duration-200 group"
          >
            {/* Header: Name, SKU, ICED badge */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 tracking-wide uppercase">{product.sku}</span>
                  <h3 className="font-bold text-base sm:text-lg text-white leading-tight mt-0.5">{product.name}</h3>
                </div>
                {product.isIced ? (
                  <span className="inline-flex items-center gap-1 bg-cyan-500/10 text-cyan-400 text-xs px-2 py-0.5 rounded-full border border-cyan-500/20 font-semibold shrink-0">
                    <Snowflake className="w-3 h-3" /> ICED
                  </span>
                ) : (
                  <span className="inline-flex items-center bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700 font-medium shrink-0">
                    Standard
                  </span>
                )}
              </div>

              {/* Spec Chips (Size, MG, Category, Price) */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-md font-semibold border border-emerald-500/20">
                  {product.bottleSize}
                </span>
                <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-0.5 rounded-md font-semibold border border-purple-500/20">
                  {product.mg} MG
                </span>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-md font-medium border border-slate-700">
                  {product.category}
                </span>
                <span className="ml-auto text-sm font-bold text-white">
                  ${product.unitPrice.toFixed(2)}
                </span>
              </div>

              {/* Flavor Profile Tags */}
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Flavor Notes:</p>
                <div className="flex flex-wrap gap-1">
                  {product.flavors.map(f => (
                    <span
                      key={f}
                      className="bg-slate-950 text-slate-300 border border-slate-800 text-xs px-2 py-0.5 rounded-md"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {product.notes && (
                <p className="text-xs text-slate-400 italic mt-2.5 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                  "{product.notes}"
                </p>
              )}
            </div>

            {/* Bottom: Stock Controller & Action Buttons (iPad Friendly large tap targets) */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              {/* Quick Stock Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                  <button
                    onClick={() => onUpdateStock(product.id, -1)}
                    disabled={product.stockQty <= 0}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center disabled:opacity-30 active:scale-95 transition"
                    title="Decrease stock"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5 text-xs font-bold text-white min-w-[2.5rem] text-center">
                    {product.stockQty}
                  </span>
                  <button
                    onClick={() => onUpdateStock(product.id, 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center active:scale-95 transition"
                    title="Increase stock"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isLowStock ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                    <AlertTriangle className="w-3 h-3" /> Low
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" /> In Stock
                  </span>
                )}
              </div>

              {/* Edit / Delete Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(product)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Edit product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
