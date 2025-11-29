import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Dna, 
  RefreshCw, 
  Heart, 
  Trash2, 
  ArrowLeft,
  ShoppingBag,
  Flame,
  Clock,
  BookOpen,
  Calendar,
  Save,
  Loader2,
  List,
  Plus,
  X,
  Pencil,
  Copy
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc,
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  query, 
  where 
} from 'firebase/firestore';

// Import constants
import { DEFAULT_RECIPES, CUISINES, PROTEINS, HEALTH_TAGS } from './constants';

// Import utilities
import { getHealthTag } from './utils/healthTag';
import { loadRecipes, loadUserData, loadSavedMenus, saveSavedMenus } from './utils/localStorage';

// Import services
import { subscribeToRecipes, addRecipe, updateRecipe, deleteRecipe, isFirebaseRecipeId, copyDefaultRecipesToSpace } from './services/recipeService';
import { 
  subscribeToMenus, 
  saveCurrentMenu, 
  createMenuForSpace, 
  updateMenuNameInSpace, 
  addRecipeToMenuInSpace, 
  deleteMenuFromSpace,
  subscribeToCurrentMenu
} from './services/menuService';
import { 
  getCurrentSpaceId, 
  setCurrentSpaceId, 
  createSpace, 
  joinSpace,
  getSpace
} from './services/spaceService';

// Import config
import { appId } from './config/firebase';

// Import components
import { MenuSelectorModal } from './components/MenuSelectorModal';
import { MenuJoinModal } from './components/MenuJoinModal';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { AddEditDishModal } from './components/AddEditDishModal';
import { MenuDisplayModal } from './components/MenuDisplayModal';
import { RecipeCard } from './components/RecipeCard';
import { SlotReel } from './components/SlotReel';

// Placeholder for Firebase instance
let db = null;

// --- MAIN APP COMPONENT ---
export default function CleanPlateCasino() {
  // Load initial data using utilities
  const userData = loadUserData();

  const [recipes, setRecipes] = useState(() => loadRecipes(DEFAULT_RECIPES)); // Start with defaults, Firebase will load shared recipes
  const [view, setView] = useState('spin'); // 'spin', 'browse', or 'menus'
  const [currentMenuIds, setCurrentMenuIds] = useState(userData.currentMenu); // Current working menu
  const [savedMenus, setSavedMenus] = useState([]); // Saved Menus (formerly templates)
  
  const [currentRecipe, setCurrentRecipe] = useState(DEFAULT_RECIPES[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [spaceId, setSpaceId] = useState(null);
  const [spaceName, setSpaceName] = useState('');
  const [showSpaceSelector, setShowSpaceSelector] = useState(false);
  
  // Swipe gesture state
  const [swipePosition, setSwipePosition] = useState({ x: 0, y: 0 });
  const [swipeStart, setSwipeStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Lock filters for Casino/Browse
  const [lockCuisine, setLockCuisine] = useState("All");
  const [lockProtein, setLockProtein] = useState("All");
  const [lockHealthTag, setLockHealthTag] = useState("All");
  const [lockFreeformTag, setLockFreeformTag] = useState("All");
  
  // Scroll state for hiding filters on mobile
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  // State for the menu name (Crucial for obeying Rules of Hooks)
  const [templateName, setTemplateName] = useState(''); // Reusing this state for menu name
  const [menuNameInput, setMenuNameInput] = useState(''); // For saving current menu

  // Add/Delete dish states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    cuisine: 'Mediterranean',
    protein: 'Chicken',
    cals: '',
    time: '',
    img: '',
    healthTag: 'Healthy', // 'Healthy', 'Moderate Healthy', 'Guilty Pleasure'
    freeformTag: '' // User-defined tag
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Menu selector modal state
  const [showMenuSelector, setShowMenuSelector] = useState(false);
  const [selectedRecipeForMenu, setSelectedRecipeForMenu] = useState(null);
  
  // Menu display state
  const [viewingMenu, setViewingMenu] = useState(null);
  
  // Recipe detail view state
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipeNote, setRecipeNote] = useState('');
  
  // Menu editing state
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [editingMenuName, setEditingMenuName] = useState('');
  const [showCalories, setShowCalories] = useState(true);

  // Recipes are now shared via Firebase, no need to save to localStorage
  // (localStorage was for user-specific recipes, but now recipes are public/shared)

  // Save current menu to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cleaneats_currentMenu', JSON.stringify(currentMenuIds));
    } catch (e) {
      console.error("Error saving current menu:", e);
    }
  }, [currentMenuIds]);

  const currentMenuCount = currentMenuIds.length;

  // --- FIREBASE SETUP & DATA LOADING ---

  useEffect(() => {
    // Set a timeout to ensure app loads even if Firebase hangs
    const timeoutId = setTimeout(() => {
      if (!isFirebaseReady) {
        console.warn("Firebase initialization taking too long, proceeding without it.");
        setIsFirebaseReady(true);
      }
    }, 5000); // 5 second timeout

    try {
      const firebaseConfig = JSON.parse(typeof window !== 'undefined' && typeof window.__firebase_config !== 'undefined' ? window.__firebase_config : '{}');
      if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
        console.warn("Firebase config not set. App will work but data won't be saved.");
        clearTimeout(timeoutId);
        setIsFirebaseReady(true);
        return;
      }
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      
      // Set isFirebaseReady to true immediately after Firebase is initialized
      setIsFirebaseReady(true);
      clearTimeout(timeoutId);
      
      // Load current space ID from localStorage
      const savedSpaceId = getCurrentSpaceId();
      if (savedSpaceId) {
        setSpaceId(savedSpaceId);
        // Load space metadata (name) for convenience
        (async () => {
          try {
            const space = await getSpace(db, savedSpaceId);
            if (space && space.name) {
              setSpaceName(space.name);
            }
          } catch (e) {
            console.error('Error loading space name:', e);
          }
        })();
      } else {
        // Show space selector if no space is selected
        setShowSpaceSelector(true);
      }
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      clearTimeout(timeoutId);
      setIsFirebaseReady(true); // Proceed without persistence if init fails
    }
  }, []);

  // Load recipes from Firebase for the current space
  useEffect(() => {
    if (!isFirebaseReady || !db || !spaceId) {
      // If no space, show default recipes
      setRecipes(DEFAULT_RECIPES);
      return;
    }

    // Set up real-time listener for space recipes
    const unsubscribe = subscribeToRecipes(db, spaceId, (spaceRecipes) => {
      // Use the recipes from the space (empty array if no recipes)
      setRecipes(spaceRecipes || []);
    });

    return () => unsubscribe();
  }, [isFirebaseReady, spaceId]);

  // Load and sync current menu for space
  useEffect(() => {
    if (!isFirebaseReady || !spaceId || !db) return;

    // Set up real-time listener for current menu
    const unsubscribe = subscribeToCurrentMenu(db, spaceId, (recipeIds) => {
      setCurrentMenuIds(recipeIds);
    });

    return () => unsubscribe();
  }, [isFirebaseReady, spaceId]);

  // Save current menu to Firebase whenever it changes
  useEffect(() => {
    if (!isFirebaseReady || !spaceId || !db) return;

    // Use service to save current menu
    const saveToFirebase = async () => {
      try {
        await saveCurrentMenu(db, spaceId, currentMenuIds);
      } catch (e) {
        console.error("Error saving to Firebase:", e);
      }
    };

    // Debounce Firebase saves to avoid too many writes
    const timeoutId = setTimeout(saveToFirebase, 1000);
    return () => clearTimeout(timeoutId);
  }, [isFirebaseReady, spaceId, currentMenuIds]);

  // Load saved menus from localStorage on mount
  useEffect(() => {
    const localMenus = loadSavedMenus();
    // Only load local menus if Firebase hasn't loaded yet
    if (savedMenus.length === 0 && localMenus.length > 0) {
      setSavedMenus(localMenus);
    }
  }, []);

  // Real-time Saved Menus Listener
  useEffect(() => {
    if (!isFirebaseReady || !spaceId || !db) return;

    // Use service to subscribe to menus
    const unsubscribe = subscribeToMenus(db, spaceId, (loadedMenus) => {
      setSavedMenus(loadedMenus);
      // Also sync to localStorage as backup
      saveSavedMenus(loadedMenus);
    });

    return () => unsubscribe();
  }, [isFirebaseReady, spaceId]);

  // Handle scroll to hide/show filters on mobile
  useEffect(() => {
    if (view !== 'browse') {
      setShowFilters(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only hide on mobile (screen width < 768px)
      if (window.innerWidth < 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down - hide filters
          setShowFilters(false);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show filters
          setShowFilters(true);
        }
      } else {
        // Always show on desktop
        setShowFilters(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, view]);

  // Prevent body scrolling when modals are open (but allow modal content to scroll)
  useEffect(() => {
    const hasOpenModal = showAddForm || viewingRecipe || showMenuSelector || viewingMenu;
    if (hasOpenModal) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [showAddForm, viewingRecipe, showMenuSelector, viewingMenu]);

  // --- CORE LOGIC FUNCTIONS ---

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewDish({...newDish, img: reader.result}); // Set as base64 data URL
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setNewDish({...newDish, img: ''});
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Filter available recipes based on locks
    const pool = recipes.filter(r => {
      const matchCuisine = lockCuisine === "All" || r.cuisine === lockCuisine;
      const matchProtein = lockProtein === "All" || r.protein === lockProtein;
      
      // Health tag filter
      const recipeHealthTag = getHealthTag(r.cals || 0, r.healthTag).label;
      const matchHealthTag = lockHealthTag === "All" || recipeHealthTag === lockHealthTag;
      
      // Freeform tag filter
      const matchFreeformTag = lockFreeformTag === "All" || 
        (lockFreeformTag !== "All" && r.freeformTag && r.freeformTag.trim() === lockFreeformTag);
      
      return matchCuisine && matchProtein && matchHealthTag && matchFreeformTag;
    });

    setTimeout(() => {
      if (pool.length > 0) {
        const random = pool[Math.floor(Math.random() * pool.length)];
        setCurrentRecipe(random);
      } else {
        console.warn("No recipes match those exact filters! Try unlocking one."); 
      }
      setIsSpinning(false);
    }, 600);
  };

  // Swipe handlers
  const handleSwipeStart = (e) => {
    if (isSpinning) return;
    const touch = e.touches ? e.touches[0] : e;
    setSwipeStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleSwipeMove = (e) => {
    if (!isDragging || !swipeStart || isSpinning) return;
    const touch = e.touches ? e.touches[0] : e;
    const deltaX = touch.clientX - swipeStart.x;
    const deltaY = touch.clientY - swipeStart.y;
    setSwipePosition({ x: deltaX, y: deltaY });
  };

  const handleSwipeEnd = () => {
    if (!isDragging || isSpinning) return;
    
    const swipeThreshold = 100; // Minimum distance to trigger swipe
    const absX = Math.abs(swipePosition.x);
    const absY = Math.abs(swipePosition.y);
    
    // Only trigger if horizontal swipe is dominant
    if (absX > absY && absX > swipeThreshold) {
      if (swipePosition.x > 0) {
        // Swipe right = Like = Add to menu
        handleSwipeLike();
      } else {
        // Swipe left = Pass = Next recipe
        handleSwipePass();
      }
    }
    
    // Reset swipe state
    setSwipePosition({ x: 0, y: 0 });
    setSwipeStart(null);
    setIsDragging(false);
  };

  const handleSwipeLike = () => {
    const recipeId = currentRecipe.id || currentRecipe.name;
    if (!currentMenuIds.includes(recipeId)) {
      setCurrentMenuIds([...currentMenuIds, recipeId]);
    }
    // Move to next recipe
    handleSpin();
  };

  const handleSwipePass = () => {
    // Just move to next recipe
    handleSpin();
  };

  // Add new dish or update existing dish
  const handleAddDish = async () => {
    if (!newDish.name.trim()) {
      alert('Please enter a dish name');
      return;
    }

    // Determine image: prioritize imagePreview (new upload), then newDish.img (URL or existing), then placeholder
    let finalImage = '';
    if (imagePreview) {
      // New image uploaded
      finalImage = imagePreview;
    } else if (newDish.img && newDish.img.trim()) {
      // Image URL provided or existing image kept
      finalImage = newDish.img.trim();
    } else if (editingRecipe && editingRecipe.img) {
      // Editing and no new image - keep existing
      finalImage = editingRecipe.img;
    } else {
      // No image - use placeholder
      finalImage = `https://placehold.co/800x600/d97706/ffffff?text=${newDish.name.trim().split(' ').map(n=>n[0]).join('')}`;
    }

    const dish = {
      name: newDish.name.trim(),
      cuisine: newDish.cuisine,
      protein: newDish.protein,
      cals: parseInt(newDish.cals) || 0,
      time: newDish.time.trim() || '30m',
      img: finalImage,
      healthTag: newDish.healthTag || 'Healthy',
      freeformTag: newDish.freeformTag.trim() || '',
      notes: editingRecipe?.notes || '',
      createdAt: editingRecipe?.createdAt || Date.now(),
      createdBy: editingRecipe?.createdBy || spaceId || 'anonymous'
    };

    // If editing, update existing recipe
    if (editingRecipe && isFirebaseRecipeId(editingRecipe.id) && isFirebaseReady && db && spaceId) {
      try {
        await updateRecipe(db, spaceId, editingRecipe.id, dish);
        // Recipe will be updated automatically via the real-time listener
      } catch (e) {
        console.error("Error updating recipe in Firebase:", e);
        alert('Failed to update recipe. Please try again.');
        return;
      }
    } else if (isFirebaseReady && db && spaceId) {
      // Save new recipe to space's recipes collection
      try {
        await addRecipe(db, spaceId, dish);
        // Recipe will be added automatically via the real-time listener
      } catch (e) {
        console.error("Error saving recipe to Firebase:", e);
        alert('Failed to save recipe. Please try again.');
        return;
      }
    } else {
      // Fallback to local storage if Firebase not available
      if (editingRecipe) {
        // Update local recipe
        setRecipes(prevRecipes => prevRecipes.map(r => {
          const rId = r.id || r.name;
          const editId = editingRecipe.id || editingRecipe.name;
          return rId === editId ? { ...r, ...dish } : r;
        }));
      } else {
        // Add new local recipe
        const maxId = recipes.length > 0 ? Math.max(...recipes.map(r => r.id || 0)) : 0;
        const dishWithId = { ...dish, id: maxId + 1 };
        setRecipes([...recipes, dishWithId]);
      }
    }

    setNewDish({
      name: '',
      cuisine: 'Mediterranean',
      protein: 'Chicken',
      cals: '',
      time: '',
      img: '',
      healthTag: 'Healthy',
      freeformTag: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingRecipe(null);
    setShowAddForm(false);
  };

  // Delete dish from space recipes
  const handleDeleteDish = async (recipe) => {
    if (window.confirm('Are you sure you want to delete this dish from your space?')) {
      const recipeId = recipe.id || recipe.name;
      
      // If it's a Firebase recipe (has Firebase doc ID - typically 20 chars), delete from Firebase
      // Firebase IDs are alphanumeric strings, typically 20 characters long
      if (recipe.id && typeof recipe.id === 'string' && recipe.id.length >= 20 && !recipe.id.startsWith('local_') && isFirebaseReady && db && spaceId) {
        try {
          await deleteRecipe(db, spaceId, recipe.id);
          // Recipe will be removed automatically via the real-time listener
        } catch (e) {
          console.error("Error deleting recipe from Firebase:", e);
          alert('Failed to delete recipe. Please try again.');
          return;
        }
      } else {
        // Local-only recipe - remove from local state by ID
        setRecipes(prevRecipes => {
          return prevRecipes.filter(r => {
            const rId = r.id || r.name;
            return rId !== recipeId;
          });
        });
      }
      
      // Also remove from current menu if present
      setCurrentMenuIds(prev => prev.filter(did => did !== recipeId));
      
      // Update current recipe if it was deleted (compare by ID)
      const currentRecipeId = currentRecipe.id || currentRecipe.name;
      if (currentRecipeId === recipeId && recipes.length > 1) {
        const remainingRecipes = recipes.filter(r => {
          const rId = r.id || r.name;
          return rId !== recipeId;
        });
        if (remainingRecipes.length > 0) {
          setCurrentRecipe(remainingRecipes[0]);
        }
      }
    }
  };

  // Open menu selector to add recipe to a saved menu
  const openMenuSelector = (recipe) => {
    setSelectedRecipeForMenu(recipe);
    setShowMenuSelector(true);
  };

  // Add recipe to a specific saved menu
  const addToMenu = async (menuId) => {
    if (!selectedRecipeForMenu || !isFirebaseReady || !spaceId || !db) return;
    
    try {
      const recipeId = selectedRecipeForMenu.id || selectedRecipeForMenu.name;
      await addRecipeToMenuInSpace(db, spaceId, menuId, recipeId);
      
      setShowMenuSelector(false);
      setSelectedRecipeForMenu(null);
    } catch (e) {
      console.error("Error adding recipe to menu:", e);
      alert('Failed to add dish to menu. Please try again.');
    }
  };

  // Create new menu and add recipe to it
  const createMenuAndAdd = async () => {
    if (!selectedRecipeForMenu) {
      alert('No recipe selected. Please try again.');
      return;
    }
    
    const menuName = templateName.trim() || `Menu ${savedMenus.length + 1}`;
    const recipeId = selectedRecipeForMenu.id || selectedRecipeForMenu.name;
    
    // If Firebase is ready, save to Firebase
    if (isFirebaseReady && spaceId && db) {
      try {
        await createMenuForSpace(db, spaceId, menuName, [recipeId]);
        
        // Success - close modal and reset
        setShowMenuSelector(false);
        setSelectedRecipeForMenu(null);
        setTemplateName('');
        return;
      } catch (e) {
        console.error("Error creating menu:", e);
        alert(`Failed to create menu: ${e.message || 'Please try again.'}`);
        return;
      }
    }
    
    // Fallback: Save to localStorage if Firebase not ready
    try {
      const newMenu = {
        id: `local_${Date.now()}`,
        name: menuName,
        recipeIds: [recipeId],
        createdAt: Date.now()
      };
      
      // Add to local state temporarily
      setSavedMenus(prev => [...prev, newMenu]);
      
      // Save to localStorage
      const savedMenusLocal = JSON.parse(localStorage.getItem('cleaneats_savedMenus') || '[]');
      savedMenusLocal.push(newMenu);
      localStorage.setItem('cleaneats_savedMenus', JSON.stringify(savedMenusLocal));
      
      // Success - close modal and reset
      setShowMenuSelector(false);
      setSelectedRecipeForMenu(null);
      setTemplateName('');
      
      alert('Menu created! It will sync to cloud when connection is ready.');
    } catch (e) {
      console.error("Error saving menu locally:", e);
      alert('Failed to create menu. Please try again.');
    }
  };

  const getCurrentMenuRecipes = () => recipes.filter(r => {
    const recipeId = r.id || r.name;
    return currentMenuIds.includes(recipeId);
  });

  const saveMenu = async (name) => {
    if (!isFirebaseReady || !spaceId || currentMenuIds.length === 0 || !db) {
      console.error("Cannot save: Firebase not ready or menu is empty.");
      return;
    }

    try {
      await createMenuForSpace(db, spaceId, name, currentMenuIds);
      console.log(`Menu "${name}" saved successfully!`);
    } catch (e) {
      console.error("Error saving menu:", e);
    }
  };

  const loadMenu = (recipeIds) => {
    setCurrentMenuIds(recipeIds);
    console.log("Menu loaded!");
  };

  const deleteMenu = async (menuId) => {
    if (!isFirebaseReady || !spaceId || !db) return;
    
    try {
      await deleteMenuFromSpace(db, spaceId, menuId);
      console.log("Menu deleted.");
    } catch (e) {
      console.error("Error deleting menu:", e);
    }
  };

  const updateMenuName = async (menuId, newName) => {
    if (!newName || !newName.trim()) {
      alert('Menu name cannot be empty');
      return;
    }
    
    if (!isFirebaseReady || !spaceId || !db) {
      // Fallback to localStorage
      try {
        const savedMenusLocal = loadSavedMenus();
        const updatedMenus = savedMenusLocal.map(menu => 
          menu.id === menuId ? { ...menu, name: newName.trim() } : menu
        );
        saveSavedMenus(updatedMenus);
        setSavedMenus(updatedMenus);
        setEditingMenuId(null);
        setEditingMenuName('');
        return;
      } catch (e) {
        console.error("Error updating menu name locally:", e);
        alert('Failed to update menu name. Please try again.');
        return;
      }
    }
    
    try {
      await updateMenuNameInSpace(db, spaceId, menuId, newName.trim());
      // Update local state immediately
      setSavedMenus(prev => prev.map(menu => 
        menu.id === menuId ? { ...menu, name: newName.trim() } : menu
      ));
      setEditingMenuId(null);
      setEditingMenuName('');
      console.log("Menu name updated.");
    } catch (e) {
      console.error("Error updating menu name:", e);
      alert('Failed to update menu name. Please try again.');
    }
  };

  // Helper function to save recipe notes
  const handleSaveRecipeNotes = async () => {
    if (!viewingRecipe || !isFirebaseReady || !db) return;
    
    const recipeId = viewingRecipe.id || viewingRecipe.name;
    
    // If it's a Firebase recipe, save notes to Firebase
    if (viewingRecipe.id && typeof viewingRecipe.id === 'string' && viewingRecipe.id.length >= 20 && !viewingRecipe.id.startsWith('local_') && spaceId) {
      try {
        await updateRecipe(db, spaceId, viewingRecipe.id, { notes: recipeNote });
        // Recipe will be updated automatically via the real-time listener
        alert('Notes saved!');
      } catch (e) {
        console.error("Error saving notes:", e);
        alert('Failed to save notes. Please try again.');
      }
    } else {
      // Local recipe - update local state
      setRecipes(prevRecipes => prevRecipes.map(r => {
        const rId = r.id || r.name;
        return rId === recipeId ? { ...r, notes: recipeNote } : r;
      }));
      alert('Notes saved!');
    }
  };

  // Helper function to handle edit button click
  const handleEditRecipe = () => {
    if (!viewingRecipe) return;
    setViewingRecipe(null);
    setEditingRecipe(viewingRecipe);
    setNewDish({
      name: viewingRecipe.name,
      cuisine: viewingRecipe.cuisine,
      protein: viewingRecipe.protein,
      cals: viewingRecipe.cals.toString(),
      time: viewingRecipe.time,
      img: viewingRecipe.img,
      healthTag: viewingRecipe.healthTag || 'Healthy',
      freeformTag: viewingRecipe.freeformTag || ''
    });
    setImagePreview(null);
    setImageFile(null);
    setRecipeNote(viewingRecipe.notes || '');
    setShowAddForm(true);
  };

  // Helper function to close add/edit form
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setEditingRecipe(null);
    setNewDish({
      name: '',
      cuisine: 'Mediterranean',
      protein: 'Chicken',
      cals: '',
      time: '',
      img: '',
      healthTag: 'Healthy',
      freeformTag: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };


  // --- RENDER HELPERS ---

  // Helper function to determine health tag based on calories or use provided tag
  const getHealthTag = (cals, providedTag) => {
    // If tag is provided, use it
    if (providedTag) {
      const tagMap = {
        'Healthy': { label: 'Healthy', color: 'bg-amber-50 text-slate-500' },
        'Moderate Healthy': { label: 'Moderate Healthy', color: 'bg-yellow-100 text-yellow-700' },
        'Guilty Pleasure': { label: 'Guilty Pleasure', color: 'bg-pink-100 text-pink-700' }
      };
      return tagMap[providedTag] || tagMap['Healthy'];
    }
    // Otherwise calculate from calories
    if (cals <= 320) return { label: 'Healthy', color: 'bg-amber-50 text-slate-500' };
    if (cals <= 400) return { label: 'Moderate Healthy', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Guilty Pleasure', color: 'bg-pink-100 text-pink-700' };
  };



  // --- RENDER: MENU MANAGER VIEW ---
  const renderMenuManager = () => {
    const currentMenuRecipes = getCurrentMenuRecipes();
    const currentMenuTotalCals = currentMenuRecipes.reduce((sum, r) => sum + r.cals, 0);

    return (
      <div className="min-h-screen bg-white pb-32">
        <div className="bg-white p-8 sticky top-0 z-10 border-b border-stone-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h2 className="text-3xl font-light text-stone-900 tracking-wider uppercase">
                {spaceName ? `${spaceName}'s Menu` : 'My Menus'}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-16 max-w-4xl mx-auto">
          
          {/* Current Menu (Today's Menu) */}
          <div className="border-b border-stone-200 pb-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-light text-stone-900 mb-2 tracking-wide uppercase">
                Today's Menu
              </h3>
              <div className="text-xs text-stone-500 uppercase tracking-widest">
                {currentMenuIds.length} {currentMenuIds.length === 1 ? 'Dish' : 'Dishes'}
              </div>
            </div>
            
            {currentMenuIds.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-stone-400 text-sm mb-2">No dishes in your menu yet.</p>
                <p className="text-stone-500 text-xs uppercase tracking-wider">Swipe right on recipes in the Spin tab to add them</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
                    <div className="text-right">
                      <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Total</div>
                      <div className="text-2xl font-light text-stone-900 tracking-wide">
                        {currentMenuTotalCals} <span className="text-sm text-stone-500">kcal</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Clear all dishes from today\'s menu?')) {
                          setCurrentMenuIds([]);
                        }
                      }}
                      className="text-xs text-stone-400 hover:text-stone-900 uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  {/* Recipe Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {currentMenuRecipes.map((recipe, index) => {
                      const recipeId = recipe.id || recipe.name || index;
                      return (
                        <RecipeCard
                          key={recipeId}
                          recipe={recipe}
                          onAddToMenu={null}
                          onDelete={(r) => {
                            const id = r.id || r.name;
                            setCurrentMenuIds(currentMenuIds.filter(did => did !== id));
                          }}
                          savedMenus={savedMenus}
                        />
                      );
                    })}
                  </div>
                </div>
                
                {/* Save Menu Section - Minimalist */}
                <div className="border-t border-stone-200 pt-8">
                  <div className="flex gap-3 max-w-md mx-auto">
                    <input
                      type="text"
                      placeholder="Menu name (optional)"
                      value={menuNameInput}
                      onChange={(e) => setMenuNameInput(e.target.value)}
                      className="flex-1 p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none text-sm bg-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && menuNameInput.trim()) {
                          saveMenu(menuNameInput.trim());
                          setMenuNameInput('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (menuNameInput.trim()) {
                          saveMenu(menuNameInput.trim());
                          setMenuNameInput('');
                        } else {
                          const defaultName = `Menu ${savedMenus.length + 1}`;
                          saveMenu(defaultName);
                        }
                      }}
                      disabled={currentMenuIds.length === 0}
                      className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Saved Menus */}
          <div className="border-b border-stone-200 pb-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-light text-stone-900 mb-2 tracking-wide uppercase">
                Saved Menus
              </h3>
            </div>
            
            {!isFirebaseReady && <p className="text-center text-stone-400 text-sm uppercase tracking-wider">Connecting to storage...</p>}

            {savedMenus.length === 0 ? (
              <p className="text-center text-stone-400 text-sm">No saved menus yet. Save your first menu above.</p>
            ) : (
              <div className="space-y-6">
                {savedMenus.map(menu => {
                  const menuRecipes = recipes.filter(r => {
                    const recipeId = r.id || r.name;
                    return menu.recipeIds.includes(recipeId);
                  });
                  const menuTotalCals = menuRecipes.reduce((sum, r) => sum + r.cals, 0);
                  
                  return (
                    <div key={menu.id} className="border-b border-stone-100 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {editingMenuId === menu.id ? (
                            <div className="flex items-center gap-3 mb-2">
                              <input
                                type="text"
                                value={editingMenuName}
                                onChange={(e) => setEditingMenuName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateMenuName(menu.id, editingMenuName);
                                  } else if (e.key === 'Escape') {
                                    setEditingMenuId(null);
                                    setEditingMenuName('');
                                  }
                                }}
                                className="flex-1 text-xl font-light text-stone-900 tracking-wide border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
                                autoFocus
                              />
                              <button
                                onClick={() => updateMenuName(menu.id, editingMenuName)}
                                className="text-stone-600 hover:text-stone-900 text-xs uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMenuId(null);
                                  setEditingMenuName('');
                                }}
                                className="text-stone-400 hover:text-stone-900 transition-colors"
                              >
                                <X size={16} strokeWidth={1.5} />
                              </button>
                            </div>
                          ) : (
                            <h4 className="text-xl font-light text-stone-900 mb-2 tracking-wide">{menu.name}</h4>
                          )}
                          <div className="flex items-center gap-4 text-xs text-stone-500 uppercase tracking-wider">
                            <span>{menu.recipeIds.length} {menu.recipeIds.length === 1 ? 'Dish' : 'Dishes'}</span>
                            <span className="text-stone-300">•</span>
                            <span>{menuTotalCals} kcal</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setViewingMenu(menu)}
                            className="text-stone-600 hover:text-stone-900 text-xs uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                          >
                            View
                          </button>
                          {editingMenuId !== menu.id && (
                            <button 
                              onClick={() => {
                                setEditingMenuId(menu.id);
                                setEditingMenuName(menu.name);
                              }}
                              className="text-stone-400 hover:text-stone-900 transition-colors"
                              title="Edit menu name"
                            >
                              <Pencil size={16} strokeWidth={1.5} />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteMenu(menu.id)}
                            className="text-stone-400 hover:text-stone-900 transition-colors"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Restaurant Menu Display Modal */}
        <MenuDisplayModal
          isOpen={!!viewingMenu}
          menu={viewingMenu}
          recipes={recipes}
          showCalories={showCalories}
          onToggleCalories={() => setShowCalories(!showCalories)}
          onClose={() => {
            setViewingMenu(null);
            setShowCalories(true);
          }}
          onLoadMenu={(recipeIds) => {
            loadMenu(recipeIds);
            setViewingMenu(null);
            setShowCalories(true);
          }}
        />
        
        {/* Space Selector Modal */}
        <MenuJoinModal
          isOpen={showSpaceSelector}
          onClose={() => setShowSpaceSelector(false)}
          onCreateSpace={handleCreateSpace}
          onJoinSpace={handleJoinSpace}
          currentSpaceId={spaceId}
          currentSpaceName={spaceName}
        />
      </div>
    );
  };


  // --- RENDER: BROWSE ALL VIEW ---
  const renderBrowse = () => {
    // Get all unique freeform tags for filter dropdown
    const allFreeformTags = Array.from(new Set(
      recipes
        .map(r => r.freeformTag)
        .filter(tag => tag && tag.trim() !== '')
    )).sort();

    const filteredRecipes = recipes.filter(r => {
      const matchCuisine = lockCuisine === "All" || r.cuisine === lockCuisine;
      const matchProtein = lockProtein === "All" || r.protein === lockProtein;
      
      // Health tag filter
      const recipeHealthTag = getHealthTag(r.cals || 0, r.healthTag).label;
      const matchHealthTag = lockHealthTag === "All" || recipeHealthTag === lockHealthTag;
      
      // Freeform tag filter
      const matchFreeformTag = lockFreeformTag === "All" || 
        (lockFreeformTag !== "All" && r.freeformTag && r.freeformTag.trim() === lockFreeformTag);
      
      return matchCuisine && matchProtein && matchHealthTag && matchFreeformTag;
    });

    return (
      <div className="min-h-screen bg-white pb-32">
        <div className={`bg-white p-8 sticky top-0 z-10 border-b border-stone-200 transition-transform duration-300 ${
          showFilters ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-3xl font-light text-stone-900 tracking-wider uppercase">Browse</h2>
              </div>
              {/* Intentionally minimal header: no count or inline space code */}
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
            >
              Add Dish
            </button>
          </div>

          {/* Filters - Minimalist */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div>
              <select 
                value={lockCuisine === "All" ? "" : lockCuisine} 
                onChange={(e) => setLockCuisine(e.target.value || "All")}
                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="" disabled>Cuisines</option>
                {CUISINES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <select 
                value={lockProtein === "All" ? "" : lockProtein} 
                onChange={(e) => setLockProtein(e.target.value || "All")}
                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="" disabled>Proteins</option>
                {PROTEINS.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <select 
                value={lockHealthTag === "All" ? "" : lockHealthTag} 
                onChange={(e) => setLockHealthTag(e.target.value || "All")}
                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="" disabled>Health Levels</option>
                {HEALTH_TAGS.filter(tag => tag !== 'All').map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
            
            <div>
              <select 
                value={lockFreeformTag === "All" ? "" : lockFreeformTag} 
                onChange={(e) => setLockFreeformTag(e.target.value || "All")}
                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="" disabled>Others</option>
                {allFreeformTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe, index) => {
              const recipeId = recipe.id || recipe.name || index;
              return (
                <RecipeCard
                  key={recipeId}
                  recipe={recipe}
                  onAddToMenu={openMenuSelector}
                  onDelete={handleDeleteDish}
                  onView={(recipe) => {
                    setViewingRecipe(recipe);
                    setRecipeNote(recipe.notes || '');
                  }}
                  savedMenus={savedMenus}
                />
              );
            })}
          </div>

          {filteredRecipes.length === 0 && (
             <div className="text-center py-16">
               <p className="text-stone-400 mb-4">No recipes found matching these filters.</p>
               <button 
                  onClick={() => {
                    setLockCuisine("All");
                    setLockProtein("All");
                    setLockHealthTag("All");
                    setLockFreeformTag("All");
                  }}
                  className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
               >
                 Clear Filters
               </button>
             </div>
          )}
        </div>

        {/* Menu Selector Modal */}
        <MenuSelectorModal
          isOpen={showMenuSelector}
          onClose={() => {
            setShowMenuSelector(false);
            setSelectedRecipeForMenu(null);
          }}
          selectedRecipe={selectedRecipeForMenu}
          savedMenus={savedMenus}
          templateName={templateName}
          onTemplateNameChange={setTemplateName}
          onAddToMenu={addToMenu}
          onCreateMenuAndAdd={createMenuAndAdd}
        />

        {/* Recipe Detail Modal */}
        <RecipeDetailModal
          isOpen={!!viewingRecipe}
          recipe={viewingRecipe}
          recipeNote={recipeNote}
          onRecipeNoteChange={setRecipeNote}
          onClose={() => {
            setViewingRecipe(null);
            setRecipeNote('');
          }}
          onEdit={handleEditRecipe}
          onSaveNotes={handleSaveRecipeNotes}
          isAuthReady={isFirebaseReady}
          db={db}
        />

        {/* Add/Edit Dish Modal */}
        <AddEditDishModal
          isOpen={showAddForm}
          onClose={handleCloseAddForm}
          editingRecipe={editingRecipe}
          newDish={newDish}
          onNewDishChange={setNewDish}
          imagePreview={imagePreview}
          onImageSelect={handleImageSelect}
          onRemoveImage={handleRemoveImage}
          onSubmit={handleAddDish}
        />
        
        {/* Space Selector Modal */}
        <MenuJoinModal
          isOpen={showSpaceSelector}
          onClose={() => setShowSpaceSelector(false)}
          onCreateSpace={handleCreateSpace}
          onJoinSpace={handleJoinSpace}
          currentSpaceId={spaceId}
          currentSpaceName={spaceName}
        />
      </div>
    );
  };


  // Space management handlers
  const handleCreateSpace = async (name) => {
    if (!db) {
      alert('Firebase not initialized. Please refresh the page.');
      return;
    }
    
    try {
      // Format display name as UPPERCASE with hyphens
      const raw = (name && name.trim()) || 'My Space';
      let displayName = raw
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')   // non-alphanumeric -> hyphen
        .replace(/^-+|-+$/g, '')       // trim leading/trailing hyphens
        .slice(0, 24);
      if (!displayName) {
        displayName = 'MY-SPACE';
      }

      const newSpaceId = await createSpace(db, displayName);
      setSpaceId(newSpaceId);
      setSpaceName(displayName);
      
      // Copy default recipes to the new space
      try {
        await copyDefaultRecipesToSpace(db, newSpaceId, DEFAULT_RECIPES);
      } catch (e) {
        console.error("Error copying default recipes to space:", e);
        // Continue anyway - recipes will be loaded from defaults if copy fails
      }
      
      setShowSpaceSelector(false);
    } catch (e) {
      console.error("Error creating space:", e);
      let errorMessage = 'Failed to create space. Please try again.';
      
      // Provide more specific error messages
      if (e.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please deploy Firestore rules to Firebase Console.\n\nGo to: Firebase Console → Firestore → Rules → Paste firestore.rules → Publish';
      } else if (e.message) {
        errorMessage = `Error: ${e.message}`;
      }
      
      alert(errorMessage + '\n\nOpening in local-only mode so you can continue.');
      // Local fallback: create a temporary local space so the app can proceed
      try {
        const fallbackId = `local_${Date.now().toString(36)}`;
        setCurrentSpaceId(fallbackId);
        setSpaceId(fallbackId);
        setSpaceName(raw?.toUpperCase?.() || 'MY-SPACE');
        setShowSpaceSelector(false);
      } catch (fallbackError) {
        console.error('Local fallback failed:', fallbackError);
      }
    }
  };

  const handleJoinSpace = async (spaceIdToJoin) => {
    if (!spaceIdToJoin) {
      // Leave current space
      setCurrentSpaceId(null);
      setSpaceId(null);
      setSpaceName('');
      setCurrentMenuIds([]);
      setSavedMenus([]);
      setShowSpaceSelector(true);
      return;
    }
    
    if (!db) {
      alert('Firebase not initialized. Please refresh the page.');
      return;
    }
    
    try {
      const success = await joinSpace(db, spaceIdToJoin);
      if (success) {
        setSpaceId(spaceIdToJoin);
        try {
          const space = await getSpace(db, spaceIdToJoin);
          if (space && space.name) {
            setSpaceName(space.name);
          } else {
            setSpaceName('');
          }
        } catch (e) {
          console.error('Error loading space name after join:', e);
          setSpaceName('');
        }
        setShowSpaceSelector(false);
      } else {
        alert('Space not found. Please check the code and try again.');
      }
    } catch (e) {
      console.error("Error joining space:", e);
      let errorMessage = 'Failed to join space. Please try again.';
      
      if (e.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please deploy Firestore rules to Firebase Console.\n\nGo to: Firebase Console → Firestore → Rules → Paste firestore.rules → Publish';
      } else if (e.message) {
        errorMessage = `Error: ${e.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // --- RENDER: PRIMARY VIEW ROUTING ---
  if (!isFirebaseReady) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin text-stone-900 mb-4" strokeWidth={1.5} />
        <p className="text-sm uppercase tracking-widest">Loading</p>
      </div>
    );
  }

  // Show space selector if no space is selected
  if (showSpaceSelector || !spaceId) {
    return (
      <MenuJoinModal
        isOpen={true}
        onClose={() => {
          // Don't allow closing if no space is selected
          if (!spaceId) return;
          setShowSpaceSelector(false);
        }}
        onCreateSpace={handleCreateSpace}
        onJoinSpace={handleJoinSpace}
        currentSpaceId={spaceId}
      />
    );
  }

  // --- RENDER: TAB NAVIGATION ---
  const renderTabs = () => {
    const tabs = [
      { id: 'spin', label: 'Spin', icon: RefreshCw },
      { id: 'browse', label: 'Browse', icon: BookOpen },
      { id: 'menus', label: 'Menus', icon: List, badge: currentMenuCount },
      { id: 'space', label: 'Space', icon: Copy }
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 pb-safe">
        <div className="flex justify-around items-center px-2 py-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'space') {
                    setShowSpaceSelector(true);
                    return;
                  }
                  setView(tab.id);
                }}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all relative ${
                  isActive 
                    ? 'text-stone-900' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] font-light w-4 h-4 flex items-center justify-center border border-white">
                      {tab.badge}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] uppercase tracking-widest ${isActive ? 'text-stone-900 font-light' : 'text-stone-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // --- RENDER: SPIN VIEW ---
  const renderSpin = () => {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans text-stone-900 pb-32">
      
      {/* Top Bar */}
      <div className="px-8 pt-8 pb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-3xl font-light text-stone-900 tracking-wider uppercase">Clean Eats</h1>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        
        {/* Slot Machine Display */}
        <div className="w-full max-w-md bg-white border border-stone-200 p-8 mb-12 relative">
          
          {/* Visual Reels */}
          <div className="flex justify-between gap-4 mb-8 border-b border-stone-200 pb-6">
            <SlotReel value={currentRecipe.cuisine} label="Cuisine" isSpinning={isSpinning} icon={Utensils} />
            <SlotReel value={currentRecipe.protein} label="Protein" isSpinning={isSpinning} icon={Dna} />
            <SlotReel value={currentRecipe.cals + " kcal"} label="Energy" isSpinning={isSpinning} icon={Flame} />
          </div>

          {/* Featured Card - Swipeable */}
          <div className="relative group">
            <div 
              className="relative bg-white overflow-hidden border border-stone-200 cursor-grab active:cursor-grabbing select-none"
              style={{
                transform: `translateX(${swipePosition.x}px) rotate(${swipePosition.x * 0.1}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                opacity: isDragging ? 1 - Math.abs(swipePosition.x) / 300 : 1
              }}
              onMouseDown={handleSwipeStart}
              onMouseMove={handleSwipeMove}
              onMouseUp={handleSwipeEnd}
              onMouseLeave={handleSwipeEnd}
              onTouchStart={handleSwipeStart}
              onTouchMove={handleSwipeMove}
              onTouchEnd={handleSwipeEnd}
            >
              {/* Swipe indicators */}
              {isDragging && (
                <>
                  {swipePosition.x > 50 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 z-10">
                      <div className="text-stone-900 text-xl font-light tracking-wider uppercase flex items-center gap-2">
                        <Heart size={20} strokeWidth={1.5} />
                        Like
                      </div>
                    </div>
                  )}
                  {swipePosition.x < -50 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 z-10">
                      <div className="text-stone-900 text-xl font-light tracking-wider uppercase">
                        Pass
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="h-48 overflow-hidden relative">
                 <img 
                    src={currentRecipe.img} 
                    alt={currentRecipe.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${isSpinning ? 'blur-sm scale-110' : 'blur-0 scale-100'}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x192/d97706/ffffff?text=${currentRecipe.name.split(' ').map(n=>n[0]).join('')}`; }}
                    draggable={false}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-stone-900/80 p-4">
                    <h2 className="text-white font-light text-xl leading-tight tracking-wide">
                      {isSpinning ? "Spinning..." : currentRecipe.name}
                    </h2>
                  </div>
              </div>
              
              <div className="p-6 border-t border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-500 uppercase tracking-wider">
                  <span>{currentRecipe.time}</span>
                  <span className="text-stone-300">•</span>
                  <span>{currentRecipe.protein === 'Vegetarian' ? 'Vegetarian' : currentRecipe.protein}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-md space-y-4">
          
          {/* Action Buttons */}
          <div className="flex gap-4 mb-4">
            <button 
              onClick={handleSwipePass}
              disabled={isSpinning}
              className="flex-1 text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-2 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <X size={18} strokeWidth={1.5} />
              Pass
            </button>
            <button 
              onClick={handleSwipeLike}
              disabled={isSpinning}
              className="flex-1 text-stone-900 hover:text-stone-600 text-sm uppercase tracking-widest border-b border-stone-900 hover-border-stone-600 transition-colors pb-2 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Heart size={18} strokeWidth={1.5} />
              Like
            </button>
          </div>
          
        </div>
      </div>
      
      {/* Menu Selector Modal */}
      <MenuSelectorModal
        isOpen={showMenuSelector}
        onClose={() => {
          setShowMenuSelector(false);
          setSelectedRecipeForMenu(null);
        }}
        selectedRecipe={selectedRecipeForMenu}
        savedMenus={savedMenus}
        templateName={templateName}
        onTemplateNameChange={setTemplateName}
        onAddToMenu={addToMenu}
        onCreateMenuAndAdd={createMenuAndAdd}
      />
      
      {/* Space Selector Modal */}
      <MenuJoinModal
        isOpen={showSpaceSelector}
        onClose={() => setShowSpaceSelector(false)}
        onCreateSpace={handleCreateSpace}
        onJoinSpace={handleJoinSpace}
        currentSpaceId={spaceId}
      />
      
      {/* Tab Navigation */}
      {renderTabs()}
    </div>
    );
  };

  // --- RENDER: PRIMARY VIEW ROUTING ---
  if (view === 'browse') {
    return (
      <>
        {renderBrowse()}
        {renderTabs()}
      </>
    );
  }
  
  if (view === 'menus') {
    return (
      <>
        {renderMenuManager()}
        {renderTabs()}
      </>
    );
  }

  // Default: Spin view
  return renderSpin();
}

