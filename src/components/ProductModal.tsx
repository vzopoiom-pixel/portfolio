import React, { useState } from 'react';
import { ProductItem } from '../types';
import { X, Snowflake } from 'lucide-react';
import { FLAVOR_OPTIONS, BOTTLE_SIZES, MG_OPTIONS, CATEGORIES } from '../data/mockData';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductItem) => void;
  editingProduct?: ProductItem | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct
}) => {
  const [formData, setFormData] = useState<Partial<ProductItem>>(() => {
    if (editingProduct) return { ...editingProduct };
    return {
      name: '',
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      flavors: ['Strawberry'],
      mg: 3,
      bottleSize: '60ml',
      isIced: false,
      stockQty: 50,
      minThreshold: 20,
      unitPrice: 18.00,
      category: 'Fruit & Ice',
      notes: ''
    };
  });

  const [customFlavorInput, setCustomFlavorInput] = useState('');

  if (!isOpen) return null;

  const handleToggleFlavor = (f: string) => {
    const current = formData.flavors || [];
    if (current.includes(f)) {
      setFormData(prev => ({ ...prev, flavors: current.filter(item => item !== f) }));
    } else {
      setFormData(prev => ({ ...prev, flavors: [...current, f] }));
    }
  };

  const handleAddCustomFlavor = () => {
    if (!customFlavorInput.trim()) return;
    const current = formData.flavors || [];
    if (!current.includes(customFlavorInput.trim())) {
      setFormData(prev => ({ ...prev, flavors: [...current, customFlavorInput.trim()] }));
    }
    setCustomFlavorInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    const finalItem: ProductItem = {
      id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
      name: formData.name || 'Untitled Product',
      sku: formData.sku || 'SKU-GEN',
      flavors: formData.flavors && formData.flavors.length > 0 ? formData.flavors : ['Standard Flavor'],
      mg: Number(formData.mg ?? 3),
      bottleSize: formData.bottleSize || '60ml',
      isIced: Boolean(formData.isIced),
      stockQty: Number(formData.stockQty ?? 0),
      minThreshold: Number(formData.minThreshold ?? 20),
      unitPrice: Number(formData.unitPrice ?? 15),
      category: formData.category || 'Fruits',
      notes: formData.notes || '',
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">
            {editingProduct ? 'Edit Product' : 'Add New Product to Database'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Arctic Strawberry Freeze"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">SKU / Code *</label>
              <input
                type="text"
                required
                value={formData.sku || ''}
                onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none uppercase font-mono"
              />
            </div>
          </div>

          {/* Flavor Selection Pills */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Flavor Profiles</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {FLAVOR_OPTIONS.map(f => {
                const selected = (formData.flavors || []).includes(f);
                return (
                  <button
                    type="button"
                    key={f}
                    onClick={() => handleToggleFlavor(f)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      selected
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            {/* Custom Flavor input */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Add custom flavor..."
                value={customFlavorInput}
                onChange={e => setCustomFlavorInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomFlavor}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* MG Strength, Bottle Size, ICED */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nicotine (MG)</label>
              <select
                value={formData.mg ?? 3}
                onChange={e => setFormData(prev => ({ ...prev, mg: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none focus:border-emerald-500"
              >
                {MG_OPTIONS.map(mg => (
                  <option key={mg} value={mg}>{mg} MG</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bottle Size</label>
              <select
                value={formData.bottleSize || '60ml'}
                onChange={e => setFormData(prev => ({ ...prev, bottleSize: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none focus:border-emerald-500"
              >
                {BOTTLE_SIZES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ICED / Cooling</label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isIced: !prev.isIced }))}
                className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-1 font-semibold transition ${
                  formData.isIced
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5" />
                {formData.isIced ? 'ICED: Yes' : 'ICED: No'}
              </button>
            </div>
          </div>

          {/* Stock, Min Threshold, Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Initial Stock</label>
              <input
                type="number"
                min="0"
                value={formData.stockQty ?? 0}
                onChange={e => setFormData(prev => ({ ...prev, stockQty: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Min Threshold</label>
              <input
                type="number"
                min="1"
                value={formData.minThreshold ?? 20}
                onChange={e => setFormData(prev => ({ ...prev, minThreshold: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice ?? 18}
                onChange={e => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Production Notes</label>
            <input
              type="text"
              placeholder="e.g. Steep time 2 weeks, top seller in California"
              value={formData.notes || ''}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
