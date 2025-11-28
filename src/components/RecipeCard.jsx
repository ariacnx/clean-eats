import React from 'react';
import { Heart, Trash2 } from 'lucide-react';

/**
 * Recipe Card Component
 * Displays a recipe in a card format with image, name, and details
 */
export const RecipeCard = ({ 
  recipe, 
  onAddToMenu, 
  onDelete, 
  onView,
  isInAnyMenu = false 
}) => {
  const recipeId = recipe.id || recipe.name;
  
  return (
    <div 
      className="bg-white border border-stone-200 overflow-hidden transition-all hover:border-stone-400 group relative flex flex-col cursor-pointer" 
      onClick={() => onView && onView(recipe)}
    >
      {/* Image - Square */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img 
          src={recipe.img} 
          alt={recipe.name} 
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90" 
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = `https://placehold.co/400x400/f5f5f4/78716c?text=${recipe.name.split(' ').map(n=>n[0]).join('')}`; 
          }}
        />
        {/* Heart button overlay - Minimalist */}
        {onAddToMenu && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToMenu(recipe);
            }}
            className={`absolute top-3 right-3 p-1.5 transition-all ${
              isInAnyMenu 
                ? 'text-stone-900' 
                : 'text-stone-400 hover:text-stone-900'
            }`}
            title="Add to Menu"
          >
            <Heart size={18} className={isInAnyMenu ? 'fill-current' : ''} strokeWidth={1.5} />
          </button>
        )}
        {/* Delete button overlay - Minimalist */}
        {onDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(recipe);
            }}
            className="absolute top-3 left-3 p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
            title="Delete Dish"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>
      
      {/* Content - Minimalist */}
      <div className="p-4 flex-1 flex flex-col border-t border-stone-100">
        <h4 className="font-light text-stone-900 text-base mb-3 line-clamp-2 tracking-wide">
          {recipe.name}
        </h4>
        
        {/* Details - Minimalist */}
        <div className="flex items-center gap-3 text-xs text-stone-500 uppercase tracking-wider mt-auto">
          <span>{recipe.cuisine}</span>
          <span className="text-stone-300">•</span>
          <span>{recipe.protein}</span>
          <span className="text-stone-300">•</span>
          <span>{recipe.time}</span>
        </div>
      </div>
    </div>
  );
};

