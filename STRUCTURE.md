# Clean Eats App Structure

This document outlines the maintainable structure of the Clean Eats application.

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── SlotReel.jsx
│   ├── RecipeCard.jsx
│   ├── TabNavigation.jsx
│   ├── modals/
│   │   ├── RecipeDetailModal.jsx
│   │   ├── AddDishModal.jsx
│   │   ├── MenuSelectorModal.jsx
│   │   └── MenuDisplayModal.jsx
│   └── views/
│       ├── SpinView.jsx
│       ├── BrowseView.jsx
│       └── MenuManagerView.jsx
├── hooks/              # Custom React hooks
│   ├── useFirebase.js
│   ├── useScrollLock.js
│   ├── useRecipes.js
│   └── useMenus.js
├── services/           # External service integrations
│   └── firebase.js
├── utils/              # Utility functions
│   └── healthTag.js
├── constants/          # Constants and configuration
│   └── index.js
├── App.jsx            # Main app orchestrator (simplified)
├── main.jsx
└── index.css
```

## Component Responsibilities

### Components
- **SlotReel**: Displays spinning reel in Spin view
- **RecipeCard**: Displays recipe card in grid/list views
- **TabNavigation**: Bottom tab navigation bar
- **Modals**: Self-contained modal components
- **Views**: Main view components (Spin, Browse, Menus)

### Hooks
- **useFirebase**: Manages Firebase initialization and auth
- **useScrollLock**: Prevents body scrolling when modals open
- **useRecipes**: Manages recipe state and operations
- **useMenus**: Manages menu state and operations

### Services
- **firebase.js**: Firebase initialization and configuration

### Utils
- **healthTag.js**: Health tag calculation logic

### Constants
- **index.js**: All constants (CUISINES, PROTEINS, DEFAULT_RECIPES, etc.)

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a single responsibility
2. **Reusability**: Components and hooks can be easily reused
3. **Testability**: Smaller units are easier to test
4. **Maintainability**: Easy to find and modify specific features
5. **Scalability**: Easy to add new features without touching existing code

## Adding New Features

### To add a new view:
1. Create component in `components/views/NewView.jsx`
2. Add route in `App.jsx`
3. Add tab in `TabNavigation.jsx` if needed

### To add a new modal:
1. Create component in `components/modals/NewModal.jsx`
2. Import and use in parent component

### To add a new hook:
1. Create hook in `hooks/useNewHook.js`
2. Export and use where needed

### To add new constants:
1. Add to `constants/index.js`
2. Import where needed

