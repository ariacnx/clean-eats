import React from 'react';
import { X } from 'lucide-react';

/**
 * Menu Selector Modal Component
 * Allows user to select a saved menu to add a recipe to, or create a new menu
 */
export const MenuSelectorModal = ({
  isOpen,
  onClose,
  selectedRecipe,
  savedMenus,
  templateName,
  onTemplateNameChange,
  onAddToMenu,
  onCreateMenuAndAdd
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
          <h3 className="text-2xl font-light text-stone-900 tracking-wide uppercase mb-2">Add to Menu</h3>
          {selectedRecipe && (
            <p className="text-sm text-stone-500 uppercase tracking-wider mt-2">
              {selectedRecipe.name}
            </p>
          )}
        </div>

        <div className="space-y-4 max-h-64 overflow-y-auto mb-8">
          {savedMenus.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">
              No menus yet. Create one below.
            </p>
          ) : (
            savedMenus.map(menu => {
              const recipeId = selectedRecipe?.id || selectedRecipe?.name;
              const isAlreadyInMenu = menu.recipeIds.includes(recipeId);
              
              return (
                <button
                  key={menu.id}
                  onClick={() => !isAlreadyInMenu && onAddToMenu(menu.id)}
                  disabled={isAlreadyInMenu}
                  className={`w-full p-4 text-left border-b border-stone-100 transition-colors ${
                    isAlreadyInMenu
                      ? 'text-stone-300 cursor-not-allowed'
                      : 'text-stone-900 hover:text-stone-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-light text-lg tracking-wide mb-1">{menu.name}</p>
                      <p className="text-xs text-stone-500 uppercase tracking-wider">{menu.recipeIds.length} dishes</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-stone-200 pt-8">
          <p className="text-xs text-stone-500 uppercase tracking-widest mb-4 text-center">Or create a new menu</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Menu name (optional)"
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
              className="flex-1 p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none text-sm bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onCreateMenuAndAdd();
                }
              }}
            />
            <button
              onClick={onCreateMenuAndAdd}
              className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

