# Refactoring Guide

This guide explains how to gradually refactor the monolithic `App.jsx` into a maintainable structure.

## Current State

- `App.jsx` is 2200+ lines
- All logic is in one file
- Hard to test and maintain

## Target State

- Modular components
- Separated concerns
- Reusable hooks
- Service layer for data operations

## Step-by-Step Refactoring Plan

### Phase 1: Extract Constants ✅
- [x] Move `DEFAULT_RECIPES` to `constants/recipes.js`
- [x] Move `CUISINES`, `PROTEINS`, `HEALTH_TAGS` to `constants/filters.js`
- [x] Create barrel export in `constants/index.js`

### Phase 2: Extract Utilities ✅
- [x] Move `getHealthTag` to `utils/healthTag.js`
- [x] Create `utils/localStorage.js` for localStorage operations

### Phase 3: Extract Services
- [x] Create `services/recipeService.js` for recipe operations
- [x] Create `services/menuService.js` for menu operations
- [ ] Update `App.jsx` to use services

### Phase 4: Extract Components
- [ ] Extract `RecipeCardSmall` to `components/cards/RecipeCardSmall.jsx`
- [ ] Extract modals to `components/modals/`
  - [ ] `RecipeDetailModal.jsx`
  - [ ] `MenuSelectorModal.jsx`
  - [ ] `AddEditDishModal.jsx`
  - [ ] `MenuDisplayModal.jsx`
- [ ] Extract `TabNavigation` to `components/navigation/TabNavigation.jsx`
- [ ] Extract `SlotReel` (already exists, verify location)

### Phase 5: Extract Views
- [ ] Create `views/SpinView.jsx`
- [ ] Create `views/BrowseView.jsx`
- [ ] Create `views/MenuManagerView.jsx`

### Phase 6: Extract Hooks
- [ ] Create `hooks/useRecipes.js` - recipe state management
- [ ] Create `hooks/useMenus.js` - menu state management
- [ ] Create `hooks/useFilters.js` - filter state
- [ ] Create `hooks/useSwipe.js` - swipe gesture logic
- [ ] Create `hooks/useScrollLock.js` - scroll lock for modals

### Phase 7: Clean Up App.jsx
- [ ] `App.jsx` becomes a simple orchestrator
- [ ] Routes between views
- [ ] Manages top-level state only

## Migration Strategy

1. **Start with utilities** - Low risk, high value
2. **Extract services** - Isolate data operations
3. **Extract components** - One at a time, test as you go
4. **Extract views** - Move view logic to separate files
5. **Extract hooks** - Consolidate state management
6. **Final cleanup** - Simplify App.jsx

## Testing Strategy

After each extraction:
1. Test the feature manually
2. Verify imports work
3. Check for console errors
4. Test on mobile if possible

## Rollback Plan

- Keep old code commented until verified
- Use feature flags if needed
- Git commits after each phase

