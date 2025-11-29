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
  isInAnyMenu = false,
  savedMenus = []
}) => {
  const recipeId = recipe.id || recipe.name;
  // Check if recipe is in any saved menu if isInAnyMenu not explicitly provided
  const isInMenu = isInAnyMenu !== false ? isInAnyMenu : savedMenus.some(menu => menu.recipeIds.includes(recipeId));
  
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
              isInMenu 
                ? 'text-stone-900' 
                : 'text-stone-400 hover:text-stone-900'
            }`}
            title="Add to Menu"
          >
            <Heart size={18} className={isInMenu ? 'fill-current' : ''} strokeWidth={1.5} />
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
        
        {/* Details - Minimalist - Only show tags that exist */}
        {(() => {
          // Mobile: only cuisine and healthTag
          const mobileTags = [];
          if (recipe.cuisine) mobileTags.push(recipe.cuisine);
          if (recipe.healthTag) mobileTags.push(recipe.healthTag);
          
          // Desktop: all tags (cuisine, protein, healthTag)
          const desktopTags = [];
          if (recipe.cuisine) desktopTags.push(recipe.cuisine);
          if (recipe.protein) desktopTags.push(recipe.protein);
          if (recipe.healthTag) desktopTags.push(recipe.healthTag);
          
          if (mobileTags.length === 0 && desktopTags.length === 0) return null;
          
          return (
            <>
              {/* Mobile: Show only cuisine and healthTag with smaller text */}
              <div className="flex items-center gap-2 text-[10px] text-stone-500 uppercase tracking-wider mt-auto md:hidden">
                {mobileTags.map((tag, index) => (
                  <React.Fragment key={`mobile-${index}`}>
                    {index > 0 && <span className="text-stone-300">•</span>}
                    <span>{tag}</span>
                  </React.Fragment>
                ))}
              </div>
              
              {/* Desktop: Show all tags (cuisine, protein, healthTag) with normal text */}
              <div className="hidden md:flex items-center gap-3 text-xs text-stone-500 uppercase tracking-wider mt-auto">
                {desktopTags.map((tag, index) => (
                  <React.Fragment key={`desktop-${index}`}>
                    {index > 0 && <span className="text-stone-300">•</span>}
                    <span>{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

