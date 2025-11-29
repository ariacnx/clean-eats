import React from 'react';
import { X } from 'lucide-react';

/**
 * Menu Display Modal Component
 * Displays a saved menu in a restaurant-style format
 */
export const MenuDisplayModal = ({
  isOpen,
  menu,
  recipes,
  showCalories,
  onToggleCalories,
  onClose,
  onLoadMenu
}) => {
  if (!isOpen || !menu) return null;

  const menuRecipes = recipes.filter(r => {
    const recipeId = r.id || r.name;
    return menu.recipeIds.includes(recipeId);
  });

  const totalCalories = menuRecipes.reduce((sum, r) => sum + r.cals, 0);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-3xl w-full mx-auto px-6 py-12 pb-32">
        {/* Toggle and Close Button - Top */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onToggleCalories}
            className="text-stone-400 hover:text-stone-900 text-xs uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
          >
            {showCalories ? 'Hide Calories' : 'Show Calories'}
          </button>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 transition-colors p-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Header - Minimalist */}
        <div className="text-center mb-16 border-b border-stone-200 pb-8">
          <h2 className="text-4xl font-light tracking-wider text-stone-900 mb-3 uppercase letter-spacing-wider">
            {menu.name}
          </h2>
          <div className="text-xs text-stone-500 tracking-widest uppercase">
            {menu.recipeIds.length} {menu.recipeIds.length === 1 ? 'Dish' : 'Dishes'}
          </div>
        </div>
        
        {/* Menu Items - Clean Lines */}
        <div className="space-y-12 mb-16">
          {menuRecipes.map((recipe, index) => (
            <div key={recipe.id || recipe.name || index} className="border-b border-stone-100 pb-8 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-8">
                {/* Left: Number, Name and Details */}
                <div className="flex-1 flex items-start gap-4">
                  <span className="text-stone-400 text-xl font-light tracking-wide mt-1">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-2xl font-light text-stone-900 mb-2 tracking-wide">
                      {recipe.name}
                    </h3>
                    {recipe.cuisine || recipe.protein ? (
                      <div className="flex items-center gap-4 text-xs text-stone-500 uppercase tracking-wider mt-3">
                        {recipe.cuisine && (
                          <>
                            <span>{recipe.cuisine}</span>
                            {recipe.protein && <span className="text-stone-300">•</span>}
                          </>
                        )}
                        {recipe.protein && <span>{recipe.protein}</span>}
                      </div>
                    ) : null}
                  </div>
                </div>
                
                {/* Right: Calories - Minimalist (conditionally shown) */}
                {showCalories && (
                  <div className="text-right">
                    <div className="text-xl font-light text-stone-700 tracking-wide">
                      {recipe.cals}
                    </div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">
                      kcal
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Menu Footer - Subtle */}
        <div className="border-t border-stone-200 pt-8 text-center">
          {showCalories && (
            <div className="mb-6">
              <div className="text-xs text-stone-400 uppercase tracking-widest mb-2">Total</div>
              <div className="text-3xl font-light text-stone-900 tracking-wide">
                {totalCalories}
                <span className="text-lg text-stone-500 ml-2">kcal</span>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              onLoadMenu(menu.recipeIds);
              onClose();
            }}
            className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

