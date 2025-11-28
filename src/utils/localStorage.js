// LocalStorage utility functions
const STORAGE_KEYS = {
  RECIPES: 'cleaneats_recipes',
  CURRENT_MENU: 'cleaneats_currentMenu',
  SAVED_MENUS: 'cleaneats_savedMenus',
};

export const loadRecipes = (defaultRecipes) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RECIPES);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed : defaultRecipes;
    }
  } catch (e) {
    console.error("Error loading recipes:", e);
  }
  return defaultRecipes;
};

export const saveRecipes = (recipes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  } catch (e) {
    console.error("Error saving recipes:", e);
  }
};

export const loadUserData = () => {
  try {
    const savedMenu = localStorage.getItem(STORAGE_KEYS.CURRENT_MENU);
    return {
      currentMenu: savedMenu ? JSON.parse(savedMenu) : []
    };
  } catch (e) {
    console.error("Error loading user data:", e);
    return { currentMenu: [] };
  }
};

export const loadSavedMenus = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_MENUS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error loading menus from localStorage:", e);
  }
  return [];
};

export const saveSavedMenus = (menus) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_MENUS, JSON.stringify(menus));
  } catch (e) {
    console.error("Error saving menus to localStorage:", e);
  }
};

