# Refactoring Status

## Completed ✅
1. **Constants extracted** - `src/constants/`
2. **Utilities extracted** - `src/utils/`
3. **Services extracted** - `src/services/`
4. **Config extracted** - `src/config/`
5. **Modal components created**:
   - `MenuSelectorModal.jsx`
   - `RecipeDetailModal.jsx`
   - `AddEditDishModal.jsx`
   - `MenuDisplayModal.jsx`
6. **RecipeCard component updated** - now supports `savedMenus` prop

## In Progress 🔄
- **View components** - Need to extract:
  - `SpinView.jsx` - Spin/Randomizer view
  - `BrowseView.jsx` - Browse all recipes view
  - `MenusView.jsx` - Menu management view

## Next Steps
1. Create the three view components in `src/views/`
2. Update `App.jsx` to import and use:
   - Modal components
   - View components
   - Remove inline component definitions
3. Extract Tab Navigation into a component
4. Test that everything works

## Notes
- The views will need many props passed from App.jsx (state, handlers, etc.)
- Consider creating custom hooks to reduce prop drilling
- Tab navigation could be extracted to `src/components/TabNavigation.jsx`

