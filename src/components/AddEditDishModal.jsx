import React from 'react';
import { X } from 'lucide-react';
import { CUISINES, PROTEINS } from '../constants';

/**
 * Add/Edit Dish Modal Component
 * Form for adding new dishes or editing existing ones
 */
export const AddEditDishModal = ({
  isOpen,
  onClose,
  editingRecipe,
  newDish,
  onNewDishChange,
  imagePreview,
  onImageSelect,
  onRemoveImage,
  onSubmit,
  imageRemoved = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-md w-full mx-auto px-4 py-12 pb-32">
        <div className="flex justify-end mb-8">
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 transition-colors p-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="text-center mb-12 border-b border-stone-200 pb-8">
          <h3 className="text-2xl font-light text-stone-900 tracking-wide uppercase">
            {editingRecipe ? 'Edit Dish' : 'Add New Dish'}
          </h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Dish Name</label>
            <input
              type="text"
              value={newDish.name}
              onChange={(e) => onNewDishChange({...newDish, name: e.target.value})}
              placeholder="e.g., Grilled Salmon"
              className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Cuisine</label>
              <select
                value={newDish.cuisine}
                onChange={(e) => {
                  const selectedCuisine = e.target.value;
                  console.log('Select onChange - selected value:', selectedCuisine);
                  console.log('Select onChange - current newDish:', newDish);
                  onNewDishChange({...newDish, cuisine: selectedCuisine});
                }}
                className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent appearance-none"
              >
                {CUISINES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Protein</label>
              <select
                value={newDish.protein}
                onChange={(e) => onNewDishChange({...newDish, protein: e.target.value})}
                className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent appearance-none"
              >
                {PROTEINS.filter(p => p !== 'All').map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Calories</label>
              <input
                type="number"
                value={newDish.cals}
                onChange={(e) => onNewDishChange({...newDish, cals: e.target.value})}
                placeholder="320"
                className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Prep Time</label>
              <input
                type="text"
                value={newDish.time}
                onChange={(e) => onNewDishChange({...newDish, time: e.target.value})}
                placeholder="25m"
                className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Health Level</label>
              <select
                value={newDish.healthTag}
                onChange={(e) => onNewDishChange({...newDish, healthTag: e.target.value})}
                className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent appearance-none"
              >
                <option value="Healthy">Healthy</option>
                <option value="Moderate Healthy">Moderate Healthy</option>
                <option value="Guilty Pleasure">Guilty Pleasure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Custom Tags</label>
              <input
                type="text"
                value={newDish.freeformTag}
                onChange={(e) => onNewDishChange({...newDish, freeformTag: e.target.value})}
                placeholder="e.g., Quick, Spicy, Vegan"
                className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Image</label>
            
            {(imagePreview || (editingRecipe && editingRecipe.img && !imagePreview && !imageRemoved)) ? (
              <div className="relative">
                <img 
                  src={imagePreview || editingRecipe?.img} 
                  alt="Preview" 
                  className="w-full h-48 object-cover border border-stone-200"
                />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute top-3 right-3 text-stone-400 hover:text-stone-900 transition-colors p-1"
                  title="Remove image"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border border-stone-300 cursor-pointer hover:border-stone-900 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Click to upload</p>
                    <p className="text-xs text-stone-400">PNG, JPG, GIF</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={onImageSelect}
                  />
                </label>
                
                <div className="text-center py-4 border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">
                    Or leave empty to generate with BANANA! 🍌
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-12 border-t border-stone-200 pt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 text-stone-900 hover:text-stone-600 text-sm uppercase tracking-widest border-b border-stone-900 hover:border-stone-600 transition-colors pb-1"
          >
            {editingRecipe ? 'Save Changes' : 'Add Dish'}
          </button>
        </div>
      </div>
    </div>
  );
};

