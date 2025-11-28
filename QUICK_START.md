# Quick Start Guide - Adding Features

## 📦 Current Structure

```
src/
├── constants/     ✅ Extracted (recipes, filters)
├── utils/         ✅ Extracted (healthTag, localStorage)
├── services/      ✅ Extracted (recipeService, menuService)
├── config/        ✅ Extracted (firebase config)
└── App.jsx         ⚠️  Still monolithic (2200+ lines)
```

## 🚀 Quick Reference

### Adding a New Filter Option

Edit `src/constants/filters.js`:
```javascript
export const CUISINES = ["All", "Japanese", "American", "Chinese", "Korean", "Mexican", "Italian", "NEW_CUISINE"];
```

### Adding a Default Recipe

Edit `src/constants/recipes.js`:
```javascript
export const DEFAULT_RECIPES = [
  // ... existing recipes
  { id: 14, name: "New Recipe", cuisine: "Italian", protein: "Chicken", cals: 350, time: "30m", img: "..." },
];
```

### Using Recipe Service

```javascript
import { subscribeToRecipes, addRecipe, updateRecipe, deleteRecipe } from './services/recipeService';

// Subscribe to recipes
const unsubscribe = subscribeToRecipes(db, (recipes) => {
  setRecipes(recipes);
});

// Add a recipe
await addRecipe(db, recipeData);

// Update a recipe
await updateRecipe(db, recipeId, { name: 'New Name' });

// Delete a recipe
await deleteRecipe(db, recipeId);
```

### Using Menu Service

```javascript
import { subscribeToMenus, createMenu, updateMenuName } from './services/menuService';

// Subscribe to menus
const unsubscribe = subscribeToMenus(db, userId, (menus) => {
  setSavedMenus(menus);
});

// Create a menu
await createMenu(db, userId, 'Menu Name', [recipeId1, recipeId2]);

// Update menu name
await updateMenuName(db, userId, menuId, 'New Name');
```

### Using Utilities

```javascript
import { getHealthTag } from './utils/healthTag';
import { loadRecipes, saveRecipes } from './utils/localStorage';

// Get health tag
const healthTag = getHealthTag(recipe.cals, recipe.healthTag);

// Load/save recipes
const recipes = loadRecipes(DEFAULT_RECIPES);
saveRecipes(recipes);
```

## 📝 Next Refactoring Steps

1. **Extract Components** - Break down UI into reusable pieces
2. **Extract Views** - Separate Spin, Browse, and Menu views
3. **Extract Hooks** - Consolidate state management logic
4. **Update App.jsx** - Make it a simple orchestrator

See `REFACTORING_GUIDE.md` for detailed steps.

## 🎯 Best Practices

1. **Import from constants** - Don't hardcode filter options
2. **Use services** - Don't write Firebase code directly in components
3. **Use utilities** - Reuse helper functions
4. **Keep components small** - Extract when > 200 lines
5. **Document complex logic** - Add comments for future you

## 🔍 Finding Code

- **Constants**: `src/constants/`
- **Utilities**: `src/utils/`
- **Services**: `src/services/`
- **Config**: `src/config/`
- **Components**: `src/components/` (to be expanded)
- **Views**: `src/views/` (to be created)
- **Hooks**: `src/hooks/` (to be expanded)

