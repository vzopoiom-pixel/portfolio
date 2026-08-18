import React, { useState } from 'react';
import { IngredientItem } from '../types';
import { X } from 'lucide-react';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: IngredientItem) => void;
  editingIngredient?: IngredientItem | null;
}

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingIngredient
}) => {
  const [formData, setFormData] = useState<Partial<IngredientItem>>(() => {
    if (editingIngredient) return { ...editingIngredient };
    return {
      name: '',
      brandSupplier: 'Capella Flavors',
      flavorProfile: ['Sweet'],
      category: 'Flavoring',
      size: '1 Gallon',
      currentStock: 2,
      unit: 'Gallons',
      costPerUnit: 65,
      reorderLevel: 1,
      batchLotNumber: 'LOT-' + Math.floor(1000 + Math.random() * 9000),
      status: 'In Stock'
    };
  });

  const [flavorInput, setFlavorInput] = useState('');

  if (!isOpen) return null;

  const handleAddFlavor = () => {
    if (!flavorInput.trim()) return;
    const current = formData.flavorProfile || [];
    if (!current.includes(flavorInput.trim())) {
      setFormData(prev => ({ ...prev, flavorProfile: [...current, flavorInput.trim()] }));
    }
    setFlavorInput('');
  };

  const handleRemoveFlavor = (f: string) => {
    setFormData(prev => ({
      ...prev,
      flavorProfile: (prev.flavorProfile || []).filter(item => item !== f)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brandSupplier) return;

    const stock = Number(formData.currentStock ?? 0);
    const reorder = Number(formData.reorderLevel ?? 1);
    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (stock <= 0) status = 'Out of Stock';
    else if (stock <= reorder) status = 'Low Stock';

    const finalItem: IngredientItem = {
      id: editingIngredient ? editingIngredient.id : 'ing-' + Date.now(),
      name: formData.name || 'Untitled Ingredient',
      brandSupplier: formData.brandSupplier || 'Custom Supplier',
      flavorProfile: formData.flavorProfile && formData.flavorProfile.length > 0 ? formData.flavorProfile : ['Standard'],
      category: (formData.category as any) || 'Flavoring',
      size: (formData.size as any) || '1 Gallon',
      currentStock: stock,
      unit: formData.unit || 'Gallons',
      costPerUnit: Number(formData.costPerUnit ?? 50),
      reorderLevel: reorder,
      batchLotNumber: formData.batchLotNumber || 'LOT-AUTO-100',
      status: status,
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">
            {editingIngredient ? 'Edit Raw Ingredient' : 'Add Raw Ingredient'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Ingredient Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Natural Ripe Strawberry Concentrate"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Brand / Supplier *</label>
              <input
                type="text"
                required
                value={formData.brandSupplier || ''}
                onChange={e => setFormData(prev => ({ ...prev, brandSupplier: e.target.value }))}
                placeholder="e.g. Capella, TFA, Flavorah"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Batch / LOT #</label>
              <input
                type="text"
                value={formData.batchLotNumber || ''}
                onChange={e => setFormData(prev => ({ ...prev, batchLotNumber: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={formData.category || 'Flavoring'}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none focus:border-emerald-500"
              >
                <option value="Flavoring">Flavoring</option>
                <option value="Base (PG/VG)">Base (PG/VG)</option>
                <option value="Nicotine / Salt">Nicotine / Salt</option>
                <option value="Cooling / Additive">Cooling / Additive</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Container Size</label>
              <select
                value={formData.size || '1 Gallon'}
                onChange={e => setFormData(prev => ({ ...prev, size: e.target.value as any }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none focus:border-emerald-500"
              >
                <option value="10ml Sample">10ml Sample</option>
                <option value="60ml Bottle">60ml Bottle</option>
                <option value="250ml Jug">250ml Jug</option>
                <option value="1 Gallon">1 Gallon</option>
                <option value="5 Gallon Drum">5 Gallon Drum</option>
                <option value="55 Gallon Drum">55 Gallon Drum</option>
              </select>
            </div>
          </div>

          {/* Flavor Profiles Tags */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Flavor Notes & Aromas</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(formData.flavorProfile || []).map(f => (
                <span
                  key={f}
                  className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                >
                  {f}
                  <button type="button" onClick={() => handleRemoveFlavor(f)} className="hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Strawberry, Creamy, Cooling..."
                value={flavorInput}
                onChange={e => setFlavorInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddFlavor}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* Stock & Unit Cost */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Qty</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.currentStock ?? 0}
                onChange={e => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reorder Level</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.reorderLevel ?? 1}
                onChange={e => setFormData(prev => ({ ...prev, reorderLevel: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cost / Unit ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costPerUnit ?? 50}
                onChange={e => setFormData(prev => ({ ...prev, costPerUnit: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

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
              {editingIngredient ? 'Save Ingredient' : 'Create Ingredient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
