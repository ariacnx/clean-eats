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
  X
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
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

// --- DATA: Clean Eating Recipes (Default) ---
const DEFAULT_RECIPES = [
  // CHICKEN
  { id: 1, name: "Lemon Herb Grilled Chicken", cuisine: "Mediterranean", protein: "Chicken", cals: 320, time: "25m", img: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "Thai Green Curry Chicken", cuisine: "Asian", protein: "Chicken", cals: 450, time: "40m", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Chicken Fajita Bowl", cuisine: "Mexican", protein: "Chicken", cals: 380, time: "20m", img: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Balsamic Glazed Chicken", cuisine: "Italian", protein: "Chicken", cals: 340, time: "35m", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800" },
  
  // BEEF
  { id: 5, name: "Steak & Asparagus Stir-Fry", cuisine: "Asian", protein: "Beef", cals: 410, time: "20m", img: "https://images.unsplash.com/photo-1543340713-17b2ae519450?auto=format&fit=crop&q=80&w=800" },
  { id: 6, name: "Carne Asada Lettuce Wraps", cuisine: "Mexican", protein: "Beef", cals: 350, time: "30m", img: "https://images.unsplash.com/photo-1541544744-375cfed75489?auto=format&fit=crop&q=80&w=800" },
  { id: 7, name: "Mediterranean Beef Kebabs", cuisine: "Mediterranean", protein: "Beef", cals: 390, time: "25m", img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800" },
  
  // FISH
  { id: 8, name: "Miso Glazed Salmon", cuisine: "Asian", protein: "Fish", cals: 420, time: "25m", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800" },
  { id: 9, name: "Baked Cod with Salsa Verde", cuisine: "Mediterranean", protein: "Fish", cals: 280, time: "20m", img: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800" },
  { id: 10, name: "Fish Taco Salad", cuisine: "Mexican", protein: "Fish", cals: 340, time: "15m", img: "https://images.unsplash.com/photo-1512838243191-e62534c66ec3?auto=format&fit=crop&q=80&w=800" },
  
  // VEGETARIAN
  { id: 11, name: "Quinoa Stuffed Peppers", cuisine: "Mexican", protein: "Vegetarian", cals: 310, time: "45m", img: "https://images.unsplash.com/photo-1628205167699-23847e231185?auto=format&fit=crop&q=80&w=800" },
  { id: 12, name: "Greek Chickpea Salad", cuisine: "Mediterranean", protein: "Vegetarian", cals: 290, time: "10m", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
  { id: 13, name: "Tofu Vegetable Curry", cuisine: "Asian", protein: "Vegetarian", cals: 360, time: "30m", img: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
];

const CUISINES = ["All", "Mediterranean", "Asian", "Mexican", "Italian"];
const PROTEINS = ["All", "Chicken", "Beef", "Fish", "Vegetarian"];

// Placeholder for Firebase/Auth instances
let db = null;
let auth = null;

// --- COMPONENTS ---

// 1. Slot Machine Reel Component
const SlotReel = ({ value, label, isSpinning, icon: Icon }) => (
  <div className="flex flex-col items-center gap-2 w-1/3">
    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{label}</span>
    <div className={`relative w-full h-24 bg-white rounded-xl border-2 border-emerald-100 flex items-center justify-center overflow-hidden shadow-sm transition-all duration-300 ${isSpinning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
      <div className={`absolute inset-0 bg-emerald-50/50 flex flex-col items-center justify-center transition-transform duration-100 ${isSpinning ? 'animate-pulse translate-y-1' : 'translate-y-0'}`}>
        <Icon size={28} className="text-emerald-500 mb-1" />
        <span className="font-bold text-gray-800 text-sm text-center px-1 truncate w-full">{isSpinning ? "..." : value}</span>
      </div>
    </div>
  </div>
);

// 2. The Main App Component
export default function CleanPlateCasino() {
  // Load recipes from localStorage or use defaults
  const loadRecipes = () => {
    try {
      const saved = localStorage.getItem('cleaneats_recipes');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : DEFAULT_RECIPES;
      }
    } catch (e) {
      console.error("Error loading recipes:", e);
    }
    return DEFAULT_RECIPES;
  };

  // Load user data from localStorage
  const loadUserData = () => {
    try {
      const savedMenu = localStorage.getItem('cleaneats_currentMenu');
      return {
        currentMenu: savedMenu ? JSON.parse(savedMenu) : []
      };
    } catch (e) {
      console.error("Error loading user data:", e);
      return { currentMenu: [] };
    }
  };

  const [recipes, setRecipes] = useState(() => DEFAULT_RECIPES); // Start with defaults, Firebase will load shared recipes
  const [view, setView] = useState('spin'); // 'spin', 'browse', or 'menus'
  const userData = loadUserData();
  const [currentMenuIds, setCurrentMenuIds] = useState(userData.currentMenu); // Current working menu
  const [savedMenus, setSavedMenus] = useState([]); // Saved Menus (formerly templates)
  
  const [currentRecipe, setCurrentRecipe] = useState(DEFAULT_RECIPES[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Lock filters for Casino/Browse
  const [lockCuisine, setLockCuisine] = useState("All");
  const [lockProtein, setLockProtein] = useState("All");

  // State for the menu name (Crucial for obeying Rules of Hooks)
  const [templateName, setTemplateName] = useState(''); // Reusing this state for menu name

  // Add/Delete dish states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    cuisine: 'Mediterranean',
    protein: 'Chicken',
    cals: '',
    time: '',
    img: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Menu selector modal state
  const [showMenuSelector, setShowMenuSelector] = useState(false);
  const [selectedRecipeForMenu, setSelectedRecipeForMenu] = useState(null);

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
  const appId = typeof window !== 'undefined' && typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

  // --- FIREBASE SETUP & DATA LOADING ---

  useEffect(() => {
    // Set a timeout to ensure app loads even if Firebase hangs
    const timeoutId = setTimeout(() => {
      if (!isAuthReady) {
        console.warn("Firebase initialization taking too long, proceeding without it.");
        setIsAuthReady(true);
      }
    }, 5000); // 5 second timeout

    try {
      const firebaseConfig = JSON.parse(typeof window !== 'undefined' && typeof window.__firebase_config !== 'undefined' ? window.__firebase_config : '{}');
      if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
        console.warn("Firebase config not set. App will work but templates won't be saved.");
        clearTimeout(timeoutId);
        setIsAuthReady(true);
        return;
      }
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          try {
            // Sign in anonymously if no user is found
            await signInAnonymously(auth);
          } catch (authError) {
            console.error("Anonymous sign-in failed:", authError);
            clearTimeout(timeoutId);
            setIsAuthReady(true); // Proceed anyway
          }
        } else {
          clearTimeout(timeoutId);
          setUserId(user.uid);
          setIsAuthReady(true);
        }
      });

      // Attempt custom token sign-in if available
      if (typeof window !== 'undefined' && typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
        signInWithCustomToken(auth, window.__initial_auth_token).catch(e => {
          console.error("Custom token sign-in failed, proceeding with anonymous.", e);
        });
      }

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      clearTimeout(timeoutId);
      setIsAuthReady(true); // Proceed without persistence if init fails
    }
  }, []);

  // Load shared recipes from Firebase (public, everyone can see/edit)
  useEffect(() => {
    if (!isAuthReady || !db) return;

    const sharedRecipesRef = collection(db, `/artifacts/${appId}/sharedRecipes`);
    
    // Set up real-time listener for shared recipes
    const unsubscribe = onSnapshot(sharedRecipesRef, (snapshot) => {
      const sharedRecipes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Merge shared recipes with default recipes (avoid duplicates by name)
      const defaultNames = new Set(DEFAULT_RECIPES.map(r => r.name));
      const uniqueShared = sharedRecipes.filter(r => !defaultNames.has(r.name));
      const allRecipes = [...DEFAULT_RECIPES, ...uniqueShared];
      
      setRecipes(allRecipes);
    }, (error) => {
      console.error("Error listening to shared recipes:", error);
      // Fallback to default recipes if Firebase fails
      setRecipes(DEFAULT_RECIPES);
    });

    return () => unsubscribe();
  }, [isAuthReady, appId]);

  // Load and sync user data with Firebase (favorites, daily menu - private)
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const userDocRef = doc(db, `/artifacts/${appId}/users/${userId}/data`, 'userData');
    
    // Load user data from Firebase
    const loadUserDataFromFirebase = async () => {
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.currentMenu) setCurrentMenuIds(data.currentMenu);
        }
      } catch (e) {
        console.error("Error loading user data from Firebase:", e);
      }
    };

    loadUserDataFromFirebase();

    // Set up real-time listener for user data
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.currentMenu) setCurrentMenuIds(data.currentMenu);
      }
    }, (error) => {
      console.error("Error listening to user data:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, userId, appId]);

  // Save user data to Firebase whenever it changes (favorites, daily menu only - not recipes)
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const userDocRef = doc(db, `/artifacts/${appId}/users/${userId}/data`, 'userData');
    
    const saveToFirebase = async () => {
      try {
        await setDoc(userDocRef, {
          currentMenu: currentMenuIds,
          lastUpdated: Date.now()
        }, { merge: true });
      } catch (e) {
        console.error("Error saving to Firebase:", e);
      }
    };

    // Debounce Firebase saves to avoid too many writes
    const timeoutId = setTimeout(saveToFirebase, 1000);
    return () => clearTimeout(timeoutId);
  }, [isAuthReady, userId, currentMenuIds, appId]);

  // Real-time Saved Menus Listener
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const menusCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/savedMenus`);
    
    const unsubscribe = onSnapshot(menusCollectionRef, (snapshot) => {
      const loadedMenus = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedMenus(loadedMenus);
    }, (error) => {
      console.error("Error listening to saved menus:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, userId, appId]);

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
      return matchCuisine && matchProtein;
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

  // Add new dish to shared recipes (everyone can see it)
  const handleAddDish = async () => {
    if (!newDish.name.trim()) {
      alert('Please enter a dish name');
      return;
    }

    const dish = {
      name: newDish.name.trim(),
      cuisine: newDish.cuisine,
      protein: newDish.protein,
      cals: parseInt(newDish.cals) || 0,
      time: newDish.time.trim() || '30m',
      img: newDish.img.trim() || `https://placehold.co/800x600/6EE7B7/ffffff?text=${newDish.name.trim().split(' ').map(n=>n[0]).join('')}`,
      createdAt: Date.now(),
      createdBy: userId || 'anonymous'
    };

    // Save to Firebase shared recipes collection
    if (isAuthReady && db) {
      try {
        const sharedRecipesRef = collection(db, `/artifacts/${appId}/sharedRecipes`);
        await addDoc(sharedRecipesRef, dish);
        // Recipe will be added automatically via the real-time listener
      } catch (e) {
        console.error("Error saving recipe to Firebase:", e);
        alert('Failed to save recipe. Please try again.');
        return;
      }
    } else {
      // Fallback to local storage if Firebase not available
      const maxId = recipes.length > 0 ? Math.max(...recipes.map(r => r.id || 0)) : 0;
      const dishWithId = { ...dish, id: maxId + 1 };
      setRecipes([...recipes, dishWithId]);
    }

    setNewDish({
      name: '',
      cuisine: 'Mediterranean',
      protein: 'Chicken',
      cals: '',
      time: '',
      img: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setShowAddForm(false);
  };

  // Delete dish from shared recipes
  const handleDeleteDish = async (recipe) => {
    if (window.confirm('Are you sure you want to delete this dish? Everyone will lose access to it.')) {
      // If it's a shared recipe (has Firebase doc ID), delete from Firebase
      if (recipe.id && typeof recipe.id === 'string' && recipe.id.length > 20 && isAuthReady && db) {
        try {
          const recipeDocRef = doc(db, `/artifacts/${appId}/sharedRecipes`, recipe.id);
          await deleteDoc(recipeDocRef);
          // Recipe will be removed automatically via the real-time listener
        } catch (e) {
          console.error("Error deleting recipe from Firebase:", e);
          alert('Failed to delete recipe. Please try again.');
          return;
        }
      } else {
        // Default recipe or local-only recipe - just remove from local state
        setRecipes(recipes.filter(r => r !== recipe));
      }
      
      // Also remove from current menu if present
      const recipeId = recipe.id || recipe.name;
      setCurrentMenuIds(currentMenuIds.filter(did => did !== recipeId));
      
      // Update current recipe if it was deleted
      if (currentRecipe === recipe && recipes.length > 1) {
        setCurrentRecipe(recipes.find(r => r !== recipe) || recipes[0]);
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
    if (!selectedRecipeForMenu || !isAuthReady || !userId || !db) return;
    
    try {
      const menuDocRef = doc(db, `/artifacts/${appId}/users/${userId}/savedMenus`, menuId);
      const menuDoc = await getDoc(menuDocRef);
      
      if (menuDoc.exists()) {
        const menuData = menuDoc.data();
        const recipeId = selectedRecipeForMenu.id || selectedRecipeForMenu.name;
        
        // Add recipe if not already in menu
        if (!menuData.recipeIds.includes(recipeId)) {
          await updateDoc(menuDocRef, {
            recipeIds: [...menuData.recipeIds, recipeId]
          });
        }
      }
      
      setShowMenuSelector(false);
      setSelectedRecipeForMenu(null);
    } catch (e) {
      console.error("Error adding recipe to menu:", e);
      alert('Failed to add dish to menu. Please try again.');
    }
  };

  // Create new menu and add recipe to it
  const createMenuAndAdd = async () => {
    if (!selectedRecipeForMenu || !isAuthReady || !userId || !db) return;
    
    const menuName = templateName.trim() || `Menu ${savedMenus.length + 1}`;
    const recipeId = selectedRecipeForMenu.id || selectedRecipeForMenu.name;
    
    try {
      const menusCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/savedMenus`);
      await addDoc(menusCollectionRef, {
        name: menuName,
        recipeIds: [recipeId],
        createdAt: Date.now()
      });
      
      setShowMenuSelector(false);
      setSelectedRecipeForMenu(null);
      setTemplateName('');
    } catch (e) {
      console.error("Error creating menu:", e);
      alert('Failed to create menu. Please try again.');
    }
  };

  const getCurrentMenuRecipes = () => recipes.filter(r => {
    const recipeId = r.id || r.name;
    return currentMenuIds.includes(recipeId);
  });

  const saveMenu = async (name) => {
    if (!isAuthReady || !userId || currentMenuIds.length === 0 || !db) {
      console.error("Cannot save: Auth not ready or menu is empty.");
      return;
    }

    try {
      const menusCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/savedMenus`);
      await addDoc(menusCollectionRef, {
        name: name,
        recipeIds: currentMenuIds,
        createdAt: Date.now()
      });
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
    if (!isAuthReady || !userId || !db) return;
    
    try {
      const menuDocRef = doc(db, `/artifacts/${appId}/users/${userId}/savedMenus`, menuId);
      await deleteDoc(menuDocRef);
      console.log("Menu deleted.");
    } catch (e) {
      console.error("Error deleting menu:", e);
    }
  };


  // --- RENDER HELPERS ---

  const RecipeCardSmall = ({ recipe, onAddToMenu, onDelete }) => {
    // Check if recipe is in any saved menu
    const recipeId = recipe.id || recipe.name;
    const isInAnyMenu = savedMenus.some(menu => menu.recipeIds.includes(recipeId));
    
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] group relative flex flex-col">
        {/* Image - Square */}
        <div className="relative w-full aspect-square overflow-hidden">
          <img 
            src={recipe.img} 
            alt={recipe.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x400/6EE7B7/ffffff?text=${recipe.name.split(' ').map(n=>n[0]).join('')}`; }}
          />
          {/* Heart button overlay */}
          <button 
            onClick={() => onAddToMenu(recipe)}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all backdrop-blur-sm ${
              isInAnyMenu 
                ? 'bg-emerald-500/90 text-white shadow-lg' 
                : 'bg-white/80 text-stone-400 hover:bg-white hover:text-emerald-600'
            }`}
            title="Add to Menu"
          >
            <Heart size={18} className={isInAnyMenu ? 'fill-white' : ''} />
          </button>
          {/* Delete button overlay (if available) */}
          {onDelete && (
            <button 
              onClick={() => onDelete(recipe)}
              className="absolute top-2 left-2 p-2 rounded-full transition-all bg-white/80 text-red-500 hover:bg-red-500 hover:text-white backdrop-blur-sm"
              title="Delete Dish"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{recipe.name}</h4>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {recipe.cuisine}
            </span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {recipe.protein}
            </span>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-stone-500 mt-auto">
            <span className="flex items-center gap-1">
              <Flame size={14} className="text-orange-400"/>
              {recipe.cals} cal
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-stone-400"/>
              {recipe.time}
            </span>
          </div>
        </div>
      </div>
    );
  };


  // --- RENDER: MENU MANAGER VIEW ---
  const renderMenuManager = () => {
    return (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="bg-white p-6 sticky top-0 z-10 border-b border-stone-200 shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">My Menus</h2>
          </div>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Saved Menus */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-stone-100">
            <h3 className="text-lg font-bold text-emerald-600 mb-4 flex items-center gap-2">
              <List size={20} /> Saved Menus ({savedMenus.length})
            </h3>
            
            {!isAuthReady && <p className="text-yellow-600 text-sm">Connecting to storage...</p>}

            {savedMenus.length === 0 ? (
              <p className="text-stone-400 text-sm italic">Save your first menu above to see it here!</p>
            ) : (
              <div className="space-y-3">
                {savedMenus.map(menu => {
                  const menuRecipes = recipes.filter(r => {
                    const recipeId = r.id || r.name;
                    return menu.recipeIds.includes(recipeId);
                  });
                  const menuTotalCals = menuRecipes.reduce((sum, r) => sum + r.cals, 0);
                  
                  return (
                    <div key={menu.id} className="bg-emerald-50 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 truncate">{menu.name}</p>
                          <span className="text-xs text-stone-500">{menu.recipeIds.length} dishes • {menuTotalCals} kcal</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => loadMenu(menu.recipeIds)}
                            className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full hover:bg-emerald-600 transition-colors"
                          >
                            Load
                          </button>
                          <button 
                            onClick={() => deleteMenu(menu.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full bg-white shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {menuRecipes.slice(0, 5).map(recipe => (
                          <span key={recipe.id || recipe.name} className="text-xs bg-white px-2 py-0.5 rounded text-stone-600">
                            {recipe.name}
                          </span>
                        ))}
                        {menuRecipes.length > 5 && (
                          <span className="text-xs bg-white px-2 py-0.5 rounded text-stone-400">
                            +{menuRecipes.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  // --- RENDER: BROWSE ALL VIEW ---
  const renderBrowse = () => {
    const filteredRecipes = recipes.filter(r => {
      const matchCuisine = lockCuisine === "All" || r.cuisine === lockCuisine;
      const matchProtein = lockProtein === "All" || r.protein === lockProtein;
      return matchCuisine && matchProtein;
    });

    return (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="bg-white p-6 sticky top-0 z-10 border-b border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Browse All</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              <Plus size={18} /> Add Dish
            </button>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 gap-3">
             <div className="relative">
              <select 
                value={lockCuisine} 
                onChange={(e) => setLockCuisine(e.target.value)}
                className="w-full bg-stone-100 border-none rounded-lg text-sm font-semibold text-gray-700 py-2 pl-3 pr-8 appearance-none cursor-pointer hover:bg-stone-200 transition-colors"
              >
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-3 top-2.5 pointer-events-none text-stone-400">
                <Utensils size={14} />
              </div>
            </div>
            
            <div className="relative">
              <select 
                value={lockProtein} 
                onChange={(e) => setLockProtein(e.target.value)}
                className="w-full bg-stone-100 border-none rounded-lg text-sm font-semibold text-gray-700 py-2 pl-3 pr-8 appearance-none cursor-pointer hover:bg-stone-200 transition-colors"
              >
                {PROTEINS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
               <div className="absolute right-3 top-2.5 pointer-events-none text-stone-400">
                <Dna size={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-4 px-2">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {filteredRecipes.map((recipe, index) => {
              const recipeId = recipe.id || recipe.name || index;
              return (
                <RecipeCardSmall
                  key={recipeId}
                  recipe={recipe}
                  onAddToMenu={openMenuSelector}
                  onDelete={handleDeleteDish}
                />
              );
            })}
          </div>

          {filteredRecipes.length === 0 && (
             <div className="text-center py-10 text-stone-400">
               <p>No recipes found matching these filters.</p>
               <button 
                  onClick={() => {setLockCuisine("All"); setLockProtein("All")}}
                  className="text-emerald-600 text-sm font-bold mt-2 hover:underline"
               >
                 Clear Filters
               </button>
             </div>
          )}
        </div>

        {/* Menu Selector Modal */}
        {showMenuSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Add to Menu</h3>
                <button
                  onClick={() => {
                    setShowMenuSelector(false);
                    setSelectedRecipeForMenu(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              {selectedRecipeForMenu && (
                <p className="text-sm text-stone-600 mb-4">
                  Select a menu to add <span className="font-semibold">{selectedRecipeForMenu.name}</span> to:
                </p>
              )}

              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {savedMenus.length === 0 ? (
                  <p className="text-stone-400 text-sm italic text-center py-4">
                    No menus yet. Create one below!
                  </p>
                ) : (
                  savedMenus.map(menu => {
                    const recipeId = selectedRecipeForMenu?.id || selectedRecipeForMenu?.name;
                    const isAlreadyInMenu = menu.recipeIds.includes(recipeId);
                    
                    return (
                      <button
                        key={menu.id}
                        onClick={() => !isAlreadyInMenu && addToMenu(menu.id)}
                        disabled={isAlreadyInMenu}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          isAlreadyInMenu
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{menu.name}</p>
                            <p className="text-xs text-stone-500">{menu.recipeIds.length} dishes</p>
                          </div>
                          {isAlreadyInMenu && (
                            <span className="text-xs bg-emerald-200 text-emerald-700 px-2 py-1 rounded">
                              Already added
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="border-t border-stone-200 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Or create a new menu:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Menu name..."
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1 p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && templateName.trim()) {
                        createMenuAndAdd();
                      }
                    }}
                  />
                  <button
                    onClick={createMenuAndAdd}
                    disabled={!templateName.trim()}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create & Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Dish Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Add New Dish</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dish Name *</label>
                  <input
                    type="text"
                    value={newDish.name}
                    onChange={(e) => setNewDish({...newDish, name: e.target.value})}
                    placeholder="e.g., Grilled Salmon"
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cuisine</label>
                    <select
                      value={newDish.cuisine}
                      onChange={(e) => setNewDish({...newDish, cuisine: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      {CUISINES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Protein</label>
                    <select
                      value={newDish.protein}
                      onChange={(e) => setNewDish({...newDish, protein: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      {PROTEINS.filter(p => p !== 'All').map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Calories</label>
                    <input
                      type="number"
                      value={newDish.cals}
                      onChange={(e) => setNewDish({...newDish, cals: e.target.value})}
                      placeholder="320"
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Prep Time</label>
                    <input
                      type="text"
                      value={newDish.time}
                      onChange={(e) => setNewDish({...newDish, time: e.target.value})}
                      placeholder="25m"
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Image (optional)</label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border border-stone-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-stone-300 border-dashed rounded-lg cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-stone-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-stone-400">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </label>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-stone-300"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-stone-500">Or</span>
                        </div>
                      </div>
                      
                      <input
                        type="url"
                        value={newDish.img}
                        onChange={(e) => setNewDish({...newDish, img: e.target.value})}
                        placeholder="Enter image URL..."
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDish({
                      name: '',
                      cuisine: 'Mediterranean',
                      protein: 'Chicken',
                      cals: '',
                      time: '',
                      img: ''
                    });
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-stone-300 rounded-lg font-semibold text-gray-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDish}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600"
                >
                  Add Dish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  // --- RENDER: PRIMARY VIEW ROUTING ---
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
        <p className="font-semibold">Loading Meal Planner...</p>
      </div>
    );
  }

  // --- RENDER: TAB NAVIGATION ---
  const renderTabs = () => {
    const tabs = [
      { id: 'spin', label: 'Spin', icon: RefreshCw },
      { id: 'browse', label: 'Browse', icon: BookOpen },
      { id: 'menus', label: 'Menus', icon: List, badge: currentMenuCount }
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg z-50">
        <div className="flex justify-around items-center px-2 py-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all relative ${
                  isActive 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <div className="relative">
                  <Icon size={24} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {tab.badge}
                    </div>
                  )}
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-emerald-600' : 'text-stone-400'}`}>
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
      <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-gray-800 pb-20">
      
      {/* Top Bar */}
      <div className="px-6 pt-6 pb-2">
        <div>
          <h1 className="text-2xl font-black text-emerald-800 tracking-tight">CLEAN EATS</h1>
          <p className="text-xs text-stone-500 font-medium">RANDOMIZER</p>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        
        {/* Slot Machine Display */}
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-stone-100 mb-8 relative">
          
          {/* Visual Reels */}
          <div className="flex justify-between gap-2 mb-6">
            <SlotReel value={currentRecipe.cuisine} label="Cuisine" isSpinning={isSpinning} icon={Utensils} />
            <SlotReel value={currentRecipe.protein} label="Protein" isSpinning={isSpinning} icon={Dna} />
            <SlotReel value={currentRecipe.cals + " kcal"} label="Energy" isSpinning={isSpinning} icon={Flame} />
          </div>

          {/* Featured Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-inner">
              <div className="h-48 overflow-hidden relative">
                 <img 
                    src={currentRecipe.img} 
                    alt={currentRecipe.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${isSpinning ? 'blur-sm scale-110' : 'blur-0 scale-100'}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x192/6EE7B7/ffffff?text=${currentRecipe.name.split(' ').map(n=>n[0]).join('')}`; }}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h2 className="text-white font-bold text-xl leading-tight shadow-black drop-shadow-md">
                      {isSpinning ? "Spinning..." : currentRecipe.name}
                    </h2>
                  </div>
              </div>
              
              <div className="p-4 flex justify-between">
                <div className="flex flex-col gap-2">
                   {/* Add to Menu Button */}
                  <button 
                    onClick={() => openMenuSelector(currentRecipe)}
                    className="flex items-center gap-2 px-3 py-1 rounded-full font-bold transition-all transform active:scale-95 text-sm bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                  >
                    <Heart size={16} />
                    Add to Menu
                  </button>
                </div>
                
                <div className="text-sm text-right text-stone-600">
                  <span className="block font-semibold text-emerald-700">{currentRecipe.time} prep</span>
                  <span className="text-xs">Perfect for {currentRecipe.protein === 'Vegetarian' ? 'plants' : currentRecipe.protein.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-md space-y-4">
          
          {/* Lock Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm">
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-1">Lock Cuisine</label>
              <select 
                value={lockCuisine} 
                onChange={(e) => setLockCuisine(e.target.value)}
                className="w-full bg-stone-50 border-none rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500 py-2"
              >
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm">
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-1">Lock Meat</label>
              <select 
                value={lockProtein} 
                onChange={(e) => setLockProtein(e.target.value)}
                className="w-full bg-stone-50 border-none rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500 py-2"
              >
                {PROTEINS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Big Spin Button */}
          <button 
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xl py-5 rounded-2xl shadow-lg shadow-emerald-200 transform transition-all active:scale-95 active:shadow-none hover:brightness-110 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <RefreshCw size={28} className={isSpinning ? 'animate-spin' : ''} />
            {isSpinning ? "FINDING..." : "SPIN FOR DINNER"}
          </button>
          
        </div>
      </div>
      
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

