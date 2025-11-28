# Clean Eats - Architecture & Structure

This document outlines the application structure for maintainability and future development.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── cards/          # Card components (RecipeCard, etc.)
│   ├── modals/         # Modal components (RecipeDetail, MenuSelector, etc.)
│   ├── filters/        # Filter components
│   └── navigation/     # Navigation components (TabBar, etc.)
├── views/              # Main view components
│   ├── SpinView.jsx
│   ├── BrowseView.jsx
│   └── MenuManagerView.jsx
├── hooks/              # Custom React hooks
│   ├── useRecipes.js   # Recipe state management
│   ├── useMenus.js     # Menu state management
│   ├── useFilters.js   # Filter state management
│   ├── useSwipe.js     # Swipe gesture handling
│   └── useFirebase.js  # Firebase initialization
├── services/           # Business logic & API calls
│   ├── firebase.js     # Firebase initialization
│   ├── recipeService.js # Recipe CRUD operations
│   └── menuService.js  # Menu CRUD operations
├── utils/              # Utility functions
│   ├── healthTag.js    # Health tag calculations
│   └── localStorage.js # LocalStorage helpers
├── constants/          # Constants and configuration
│   ├── recipes.js      # Default recipes
│   ├── filters.js      # Filter options
│   └── index.js        # Central exports
├── config/             # Configuration files
│   └── firebase.js     # Firebase config
└── App.jsx             # Main app component (orchestrator)

```

## 🎯 Design Principles

### 1. **Separation of Concerns**
- **Components**: Pure UI, receive props, emit events
- **Views**: Composed of components, handle view-specific logic
- **Hooks**: Encapsulate stateful logic and side effects
- **Services**: Handle data operations (Firebase, localStorage)
- **Utils**: Pure functions, no side effects

### 2. **Single Responsibility**
Each file should have one clear purpose:
- `RecipeCard.jsx` - Display a recipe card
- `useRecipes.js` - Manage recipe state
- `recipeService.js` - Handle recipe data operations

### 3. **Reusability**
- Extract common patterns into hooks
- Create reusable components
- Share utilities across features

### 4. **Maintainability**
- Clear file naming conventions
- Consistent folder structure
- Document complex logic
- Keep files under 300 lines when possible

## 📝 Adding New Features

### Adding a New View
1. Create `src/views/NewView.jsx`
2. Add route in `App.jsx`
3. Add navigation item if needed

### Adding a New Component
1. Create component in appropriate folder (`components/cards/`, `components/modals/`, etc.)
2. Export from component folder's `index.js`
3. Import and use in views

### Adding a New Hook
1. Create `src/hooks/useNewFeature.js`
2. Encapsulate state and logic
3. Export and use in components

### Adding a New Service
1. Create `src/services/newService.js`
2. Export functions for data operations
3. Use in hooks or components

## 🔄 State Management Flow

```
User Action
    ↓
Component (UI)
    ↓
Hook (State Logic)
    ↓
Service (Data Operations)
    ↓
Firebase / localStorage
```

## 📦 Key Modules

### Constants
- `constants/recipes.js` - Default recipe data
- `constants/filters.js` - Filter dropdown options

### Services
- `services/firebase.js` - Firebase initialization
- `services/recipeService.js` - Recipe CRUD operations
- `services/menuService.js` - Menu CRUD operations

### Hooks
- `hooks/useRecipes.js` - Recipe state, loading, CRUD
- `hooks/useMenus.js` - Menu state, loading, CRUD
- `hooks/useFilters.js` - Filter state management
- `hooks/useSwipe.js` - Swipe gesture handling

### Views
- `views/SpinView.jsx` - Randomizer/spin view
- `views/BrowseView.jsx` - Browse all recipes
- `views/MenuManagerView.jsx` - Menu management

## 🚀 Best Practices

1. **Import from index files** - Use barrel exports for cleaner imports
2. **Keep components small** - Extract sub-components when needed
3. **Use TypeScript-like JSDoc** - Document function parameters
4. **Test utilities** - Write tests for pure functions
5. **Consistent naming** - Use PascalCase for components, camelCase for functions

## 🔧 Refactoring Checklist

When refactoring, ensure:
- [ ] No circular dependencies
- [ ] All imports resolve correctly
- [ ] Components are properly exported
- [ ] Hooks follow React rules
- [ ] Services handle errors gracefully
- [ ] Constants are centralized

