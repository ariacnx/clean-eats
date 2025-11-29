import React from 'react';
import { X, Pencil } from 'lucide-react';
import { getHealthTag } from '../utils/healthTag';
import { doc, updateDoc } from 'firebase/firestore';
import { appId } from '../config/firebase';

/**
 * Recipe Detail Modal Component
 * Displays full recipe details with notes and edit functionality
 */
export const RecipeDetailModal = ({
  isOpen,
  recipe,
  recipeNote,
  onRecipeNoteChange,
  onClose,
  onEdit,
  onSaveNotes,
  isAuthReady,
  db
}) => {
  if (!isOpen || !recipe) return null;

  const healthTag = getHealthTag(recipe.cals || 0, recipe.healthTag);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-2xl w-full mx-auto px-4 py-12 pb-32">
        <div className="flex justify-end mb-8">
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 transition-colors p-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Recipe Image */}
        <div className="mb-8">
          <img 
            src={recipe.img} 
            alt={recipe.name}
            className="w-full h-64 object-cover border border-stone-200"
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = `https://placehold.co/800x400/f5f5f4/78716c?text=${recipe.name.split(' ').map(n=>n[0]).join('')}`; 
            }}
          />
        </div>
        
        {/* Recipe Header */}
        <div className="text-center mb-12 border-b border-stone-200 pb-8">
          <h2 className="text-4xl font-light text-stone-900 tracking-wider uppercase mb-4">
            {recipe.name}
          </h2>
          <div className="flex items-center justify-center gap-4 text-xs text-stone-500 uppercase tracking-wider">
            <span>{recipe.cuisine}</span>
            <span className="text-stone-300">•</span>
            <span>{recipe.protein}</span>
            <span className="text-stone-300">•</span>
            <span>{recipe.time}</span>
          </div>
        </div>
        
        {/* Recipe Details */}
        <div className="space-y-8 mb-12">
          <div className="flex items-start justify-between border-b border-stone-100 pb-6">
            <div>
              <div className="text-xs text-stone-400 uppercase tracking-widest mb-2">Calories</div>
              <div className="text-3xl font-light text-stone-900 tracking-wide">
                {recipe.cals}
                <span className="text-lg text-stone-500 ml-2">kcal</span>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="border-b border-stone-100 pb-6">
            <div className="text-xs text-stone-400 uppercase tracking-widest mb-4">Tags</div>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-2">Cuisine</div>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded text-xs font-light tracking-wide">
                    {recipe.cuisine}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-2">Protein</div>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded text-xs font-light tracking-wide">
                    {recipe.protein}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-2">Health Level</div>
                <div className="flex flex-wrap gap-3">
                  <span className={`${healthTag.color} px-3 py-1.5 rounded text-xs font-light tracking-wide`}>
                    {healthTag.label}
                  </span>
                </div>
              </div>
              {recipe.freeformTag && (
                <div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-2">Custom Tags</div>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded text-xs font-light tracking-wide">
                      {recipe.freeformTag}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Notes Section */}
          <div className="border-b border-stone-100 pb-6">
            <div className="text-xs text-stone-400 uppercase tracking-widest mb-4">Recipe Notes</div>
            <textarea
              value={recipeNote}
              onChange={(e) => onRecipeNoteChange(e.target.value)}
              placeholder="Add your recipe notes, ingredients, instructions, or any other details here..."
              className="w-full p-4 border border-stone-200 focus:border-stone-900 focus:outline-none bg-transparent resize-none font-light text-stone-900 leading-relaxed min-h-[200px]"
              rows={8}
            />
            <button
              onClick={onSaveNotes}
              className="mt-4 text-stone-900 hover:text-stone-600 text-sm uppercase tracking-widest border-b border-stone-900 hover:border-stone-600 transition-colors pb-1"
            >
              Save Notes
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-4 border-t border-stone-200 pt-8 pb-8">
          <button
            onClick={onEdit}
            className="flex-1 text-stone-900 hover:text-stone-600 text-sm uppercase tracking-widest border-b border-stone-900 hover:border-stone-600 transition-colors pb-1 flex items-center justify-center gap-2"
          >
            <Pencil size={16} strokeWidth={1.5} />
            Edit
          </button>
          <button
            onClick={onClose}
            className="flex-1 text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

